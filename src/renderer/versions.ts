import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fetchAuthSession } from 'aws-amplify/auth';
import log from 'electron-log';

// Pure check — installing is ModUpdateProvider's job. This used to also kick off
// the install, so every mounted version checker started its own concurrent
// download and the racing writes corrupted the zip.
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

    const latestVersionId = response.Metadata?.version;
    log.debug(`latestVersionId: ${latestVersionId}`);

    if (latestVersionId !== currentVersionId) {
      log.info(`New version available. Current: ${currentVersionId} Latest: ${latestVersionId}`);
      return true;
    }

    return false;
  } catch (error) {
    log.error('Error checking for new version:', error);
    throw error;
  }
}
