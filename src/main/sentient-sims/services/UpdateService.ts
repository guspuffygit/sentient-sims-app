import * as fs from 'fs';
import { ICredentials } from '@aws-amplify/core';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import AdmZip from 'adm-zip';
import log from 'electron-log';
import { DirectoryService } from './DirectoryService';

export type ModUpdate = {
  type: string;
  credentials: ICredentials;
};

export class UpdateService {
  private directoryService: DirectoryService;

  constructor(directoryService: DirectoryService) {
    this.directoryService = directoryService;
  }

  async updateMod({ type, credentials }: ModUpdate) {
    try {
      const modsFolder = this.directoryService.getModsFolder();
      if (!fs.existsSync(modsFolder)) {
        log.info(`Creating mods folder: ${modsFolder}`);
        fs.mkdirSync(modsFolder, { recursive: true });
      }

      const zippedModFile = this.directoryService.getZippedModFile();
      if (fs.existsSync(zippedModFile)) {
        log.info(`Zipped mod file exists, deleting: ${zippedModFile}`);
        fs.rmSync(zippedModFile);
      }

      const client = new S3Client({ region: 'us-east-1', credentials });
      const getObjectCommand = new GetObjectCommand({
        Bucket: 'sentient-sims-artifacts',
        Key: `sentient-sims-${type}.zip`,
      });

      const response = await client.send(getObjectCommand);

      if (response.Body) {
        // Create a write stream to the desired output location
        const outputStream = fs.createWriteStream(zippedModFile);

        // Pipe the S3 object stream to the output stream
        if (response.Body instanceof Readable) {
          response.Body.pipe(outputStream);
        } else {
          throw Error('Body not instance of Readable');
        }

        // Wait for the write stream to finish writing the data
        await new Promise((resolve, reject) => {
          outputStream.on('finish', resolve);
          outputStream.on('error', reject);
        });

        if (!fs.existsSync(zippedModFile)) {
          log.error(`Zipped mod file did not exist at: ${zippedModFile}`);
          throw Error(`Zipped mod file did not exist at: ${zippedModFile}`);
        }
      } else {
        throw new Error('Response body is undefined.');
      }

      const sentientSimsFolder = this.directoryService.getSentientSimsFolder();
      if (!fs.existsSync(sentientSimsFolder)) {
        log.info(
          `Sentient Sims folder did not exist, creating: ${sentientSimsFolder}`
        );
        fs.mkdirSync(sentientSimsFolder);
      }

      const zip = new AdmZip(zippedModFile);
      zip.getEntries().forEach((zipEntry) => {
        if (!zipEntry.isDirectory) {
          log.log(zipEntry.name);
          zip.extractEntryTo(
            zipEntry.entryName,
            sentientSimsFolder,
            /* maintainEntryPath */ false,
            /* overwrite */ true
          );
        }
      });

      log.info(`Update completed.`);
    } finally {
      this.directoryService.filesToDelete().forEach((fileToDelete) => {
        if (fs.existsSync(fileToDelete)) {
          log.info(`File exists, deleting: ${fileToDelete}`);
          fs.rmSync(fileToDelete);
        }
      });
    }
  }
}
