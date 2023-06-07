import * as fs from 'fs';
import { ICredentials } from '@aws-amplify/core';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import AdmZip from 'adm-zip';
import {
  getAppVersionFile,
  getModVersionFile,
  getModsFolder,
  getSentientSimsFolder,
  getZippedModFile,
} from './directories';
import Logger from './logger';

const logger = new Logger('Updater');

export type Version = {
  version: string;
};

export type ModUpdate = {
  type: 'main' | 'develop';
  credentials: ICredentials;
};

function getVersion(path: string): Version {
  if (fs.existsSync(path)) {
    logger.log(`Version file exists at path: ${path}`);
    const parsedVersion = JSON.parse(
      fs.readFileSync(path, { encoding: 'utf-8' })
    );
    logger.log(parsedVersion);
    return parsedVersion;
  }

  logger.log(`Version file does not exist at path: ${path}`);
  return { version: 'none' };
}

export function getModVersion(): Version {
  const modVersionFile = getModVersionFile();
  return getVersion(modVersionFile);
}

export function getAppVersion(): Version {
  const appVersionFile = getAppVersionFile();
  return getVersion(appVersionFile);
}

export async function updateMod({ type, credentials }: ModUpdate) {
  try {
    const modsFolder = getModsFolder();
    if (!fs.existsSync(modsFolder)) {
      logger.log(`Creating mods folder: ${modsFolder}`);
      fs.mkdirSync(modsFolder, { recursive: true });
    }

    const zippedModFile = getZippedModFile();
    if (fs.existsSync(zippedModFile)) {
      logger.log(`Zipped mod file exists, deleting: ${zippedModFile}`);
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
        logger.error(`Zipped mod file did not exist at: ${zippedModFile}`);
        throw Error(`Zipped mod file did not exist at: ${zippedModFile}`);
      }
    } else {
      throw new Error('Response body is undefined.');
    }

    const sentientSimsFolder = getSentientSimsFolder();
    if (!fs.existsSync(sentientSimsFolder)) {
      logger.log(
        `Sentient Sims folder did not exist, creating: ${sentientSimsFolder}`
      );
      fs.mkdirSync(sentientSimsFolder);
    }

    const zip = new AdmZip(zippedModFile);
    zip.getEntries().forEach((zipEntry) => {
      if (!zipEntry.isDirectory) {
        logger.log(zipEntry.name);
        zip.extractEntryTo(
          zipEntry.entryName,
          sentientSimsFolder,
          /* maintainEntryPath */ false,
          /* overwrite */ true
        );
      }
    });
  } finally {
    if (fs.existsSync(getZippedModFile())) {
      logger.log(
        `Zipped mod file exists at the end, deleting: ${getZippedModFile()}`
      );
      fs.rmSync(getZippedModFile());
    }
  }
}
