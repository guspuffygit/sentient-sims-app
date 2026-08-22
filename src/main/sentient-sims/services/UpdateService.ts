import * as fs from 'fs';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import AdmZip from 'adm-zip';
import log from 'electron-log';
import { ApiContext } from './ApiContext';

export type ModUpdate = {
  type: string;
  credentials: AwsCredentialIdentity;
  // Set by the app's startup auto-update; auto failures are logged, not popped up
  auto?: boolean;
};

function fsErrorCode(err: unknown): string | undefined {
  if (err && typeof err === 'object' && 'code' in err) {
    return String((err as NodeJS.ErrnoException).code);
  }
  return undefined;
}

function isPermissionErrorCode(code: string | undefined): boolean {
  return code === 'ENOENT' || code === 'EPERM' || code === 'EACCES';
}

function permissionErrorMessage(targetPath: string): string {
  return [
    `Unable to write to: ${targetPath}.`,
    'Antivirus or Windows "Controlled folder access" may be blocking the Sentient Sims app.',
    'Allow the app through your antivirus/ransomware protection and try again.',
  ].join(' ');
}

function installErrorMessage(err: unknown, modsFolder: string): string {
  if (isPermissionErrorCode(fsErrorCode(err))) {
    return permissionErrorMessage(modsFolder);
  }
  return 'Unable to update mod, make sure The Sims 4 is closed before updating.';
}

const noop = () => {};

type InFlightUpdate = {
  type: string;
  promise: Promise<void>;
};

export class UpdateService {
  private ctx: ApiContext;

  // Two updates racing used to interleave their downloads into one temp file and
  // corrupt it (CRC32 failures on extract), so callers requesting the release
  // that is already installing join it, and other releases queue behind it.
  private inFlight?: InFlightUpdate;

  private queueTail: Promise<void> = Promise.resolve();

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  updateMod(modUpdate: ModUpdate): Promise<void> {
    if (this.inFlight && this.inFlight.type === modUpdate.type) {
      log.info(`Mod update for '${modUpdate.type}' already in progress, joining it`);
      return this.inFlight.promise;
    }

    const run = this.queueTail.then(() => this.installMod(modUpdate));
    this.queueTail = run.then(noop, noop);

    const entry: InFlightUpdate = { type: modUpdate.type, promise: run };
    this.inFlight = entry;
    const clear = () => {
      if (this.inFlight === entry) {
        this.inFlight = undefined;
      }
    };
    run.then(clear).catch(clear);

    return run;
  }

  private async installMod({ type, credentials }: ModUpdate): Promise<void> {
    // A unique path per install keeps a second app instance (e.g. briefly alive
    // across a self-update relaunch) from writing into the same download
    const zippedModFile = path.join(os.tmpdir(), `sentient-sims-${randomUUID()}.zip`);
    try {
      let responseBody: Readable;
      try {
        const client = new S3Client({ region: 'us-east-1', credentials });
        const response = await client.send(
          new GetObjectCommand({
            Bucket: 'sentient-sims-artifacts',
            Key: `sentient-sims-${type}.zip`,
          }),
        );

        if (!response.Body) {
          throw new Error('Response body is undefined.');
        }
        if (!(response.Body instanceof Readable)) {
          throw new Error('Body not instance of Readable');
        }
        responseBody = response.Body;
      } catch (err) {
        log.error(`Unable to download mod update`, err);
        throw new Error(`Unable to download the mod update, check your internet connection and try again.`, {
          cause: err,
        });
      }

      try {
        await pipeline(responseBody, fs.createWriteStream(zippedModFile));
      } catch (err) {
        log.error(`Unable to write mod update to ${zippedModFile}`, err);
        if (isPermissionErrorCode(fsErrorCode(err))) {
          throw new Error(permissionErrorMessage(zippedModFile), { cause: err });
        }
        throw new Error(
          `Unable to save the mod update, check your internet connection and disk space, then try again.`,
          {
            cause: err,
          },
        );
      }

      const modsFolder = this.ctx.directory.getModsFolder();
      try {
        if (!fs.existsSync(modsFolder)) {
          log.info(`Creating mods folder: ${modsFolder}`);
          fs.mkdirSync(modsFolder, { recursive: true });
        }

        const sentientSimsFolder = this.ctx.directory.getSentientSimsFolder();
        if (!fs.existsSync(sentientSimsFolder)) {
          log.info(`Sentient Sims folder did not exist, creating: ${sentientSimsFolder}`);
          fs.mkdirSync(sentientSimsFolder);
        }

        const scriptsFolderExists = fs.existsSync(this.ctx.directory.getSentientSimsScriptsFolder());

        const zip = new AdmZip(zippedModFile);
        zip
          .getEntries()
          .filter((zipEntry) => !zipEntry.isDirectory)
          .filter((zipEntry) => {
            return !(zipEntry.name === 'sentient-sims.ts4script' && scriptsFolderExists);
          })
          .forEach((zipEntry) => {
            log.log(zipEntry.name);
            zip.extractEntryTo(
              zipEntry.entryName,
              sentientSimsFolder,
              /* maintainEntryPath */ false,
              /* overwrite */ true,
            );
          });
      } catch (err) {
        log.error(`Unable to install mod update`, err);
        throw new Error(installErrorMessage(err, modsFolder), { cause: err });
      }

      // Players who move the mod files around by hand (a sentient-sims.ts4script
      // dropped straight into Mods, an old sentient-sims.zip left behind) end
      // up with the game loading the stray copy instead of this install, so
      // sweep them out rather than letting the two fight.
      const stray = this.ctx.directory.removeStrayModFiles();
      if (stray.removed.length > 0) {
        log.info(`Removed ${stray.removed.length} stray mod file(s): ${stray.removed.join(', ')}`);
      }
      if (stray.failed.length > 0) {
        log.warn(`Could not remove stray mod file(s), delete them by hand: ${stray.failed.join(', ')}`);
      }

      log.info(`Update completed.`);

      try {
        this.ctx.paintingMount.ensureMount();
      } catch (mountErr) {
        log.error(`Failed to set up paintings texture mount after mod update`, mountErr);
      }

      try {
        await this.ctx.gameSigning.signGame();
      } catch (signErr) {
        log.error(`Failed to re-sign game after mod update`, signErr);
      }
    } finally {
      [zippedModFile, ...this.ctx.directory.filesToDelete()].forEach((fileToDelete) => {
        try {
          if (fs.existsSync(fileToDelete)) {
            log.info(`File exists, deleting: ${fileToDelete}`);
            fs.rmSync(fileToDelete);
          }
        } catch (cleanupErr) {
          log.error(`Unable to clean up ${fileToDelete}`, cleanupErr);
        }
      });
    }
  }
}
