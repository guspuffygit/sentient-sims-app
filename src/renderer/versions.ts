import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fetchAuthSession } from 'aws-amplify/auth';
import log from 'electron-log';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';

import { ModUpdate } from 'main/sentient-sims/services/UpdateService';

const client = new SentientSimsAppClient();

export async function isNewVersionAvailable(currentVersionId: string, type = 'main'): Promise<boolean> {
  log.debug(`current version: ${currentVersionId}`);
  try {
    const authSession = await fetchAuthSession();
    const s3Client = new S3Client({
      region: 'us-east-1',
      credentials: authSession.credentials,
    });

    const headObjectCommand = new HeadObjectCommand({
      Bucket: 'sentient-sims-artifacts',
      Key: `sentient-sims-${type}.zip`,
    });

    const response = await s3Client.send(headObjectCommand);

    const latestVersionId = response?.Metadata?.version;
    log.debug(`latestVersionId: ${latestVersionId}`);
    const yourVersionId = currentVersionId;

    if (latestVersionId !== yourVersionId) {
      log.info(`New version available. Current: ${yourVersionId} Latest: ${latestVersionId}`);

      if (authSession.credentials) {
        const modUpdate: ModUpdate = {
          type,
          credentials: authSession.credentials,
        };
        try {
          const updateModResponse = await client.update.updateMod(modUpdate);
          return updateModResponse?.done ? false : true;
        } catch (err) {
          log.error(`Unable to request update to mod`, err);
        }
      }

      return true;
    }

    return false;
  } catch (error) {
    log.error('Error checking for new version:', error);
    throw error;
  }
}
