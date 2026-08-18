import * as fs from 'fs';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import AdmZip from 'adm-zip';
import log from 'electron-log';
import { ApiContext } from './ApiContext';

export type ModUpdate = {
  type: string;
  credentials: AwsCredentialIdentity;
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

export class UpdateService {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  async updateMod({ type, credentials }: ModUpdate) {
    const zippedModFile = this.ctx.directory.getZippedModFile();
    try {
      if (fs.existsSync(zippedModFile)) {
        log.info(`Zipped mod file exists, deleting: ${zippedModFile}`);
        try {
          fs.rmSync(zippedModFile);
        } catch (err) {
          log.error(`Unable to delete existing mod zip: ${zippedModFile}`, err);
          if (isPermissionErrorCode(fsErrorCode(err))) {
            throw new Error(permissionErrorMessage(zippedModFile), { cause: err });
          }
          throw err;
        }
      }

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
        const outputStream = fs.createWriteStream(zippedModFile);
        responseBody.pipe(outputStream);

        await new Promise<void>((resolve, reject) => {
          outputStream.on('finish', resolve);
          outputStream.on('error', reject);
        });

        if (!fs.existsSync(zippedModFile)) {
          throw new Error(`Zipped mod file did not exist at: ${zippedModFile}`);
        }
      } catch (err) {
        log.error(`Unable to write mod update to ${zippedModFile}`, err);
        if (isPermissionErrorCode(fsErrorCode(err))) {
          throw new Error(permissionErrorMessage(zippedModFile), { cause: err });
        }
        throw new Error(`Unable to save the mod update to disk, try again.`, { cause: err });
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

      log.info(`Update completed.`);

      try {
        await this.ctx.gameSigning.signGame();
      } catch (signErr) {
        log.error(`Failed to re-sign game after mod update`, signErr);
      }
    } finally {
      this.ctx.directory.filesToDelete().forEach((fileToDelete) => {
        if (fs.existsSync(fileToDelete)) {
          log.info(`File exists, deleting: ${fileToDelete}`);
          fs.rmSync(fileToDelete);
        }
      });
    }
  }
}
