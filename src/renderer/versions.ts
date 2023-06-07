/* eslint no-console: off, import/prefer-default-export: off */
import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Auth } from 'aws-amplify';

export async function isNewVersionAvailable(
  currentVersionId: string,
  type = 'main'
): Promise<boolean> {
  console.log(`current version: ${currentVersionId}`);
  try {
    const credentials = await Auth.currentCredentials();
    const client = new S3Client({ region: 'us-east-1', credentials });

    // Get the latest version ID of the object
    const headObjectCommand = new HeadObjectCommand({
      Bucket: 'sentient-sims-artifacts',
      Key: `sentient-sims-${type}.zip`,
    });

    const response = await client.send(headObjectCommand);

    // Compare the latest version ID with the version you have
    const latestVersionId = response?.Metadata?.version;
    console.log(`latestVersionId: ${latestVersionId}`);
    const yourVersionId = currentVersionId;

    if (latestVersionId !== yourVersionId) {
      // A new version is available
      return true;
    }

    // No new version is available
    return false;
  } catch (error) {
    // Handle error if the object doesn't exist or other issues occur
    console.error('Error checking for new version:', error);
    throw error;
  }
}
