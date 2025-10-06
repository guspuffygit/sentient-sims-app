import { execSync } from 'child_process';

const { VERSION } = process.env;
const { GITHUB_REPOSITORY } = process.env;

const timeout = 20 * 60 * 1000; // 20 minutes in ms
const startTime = Date.now();

while (Date.now() - startTime < timeout) {
  try {
    execSync(
      `gh release download "v${VERSION}" --repo ${GITHUB_REPOSITORY} --pattern "SentientSims-${VERSION}-mac.zip" --skip-existing --dir .`,
    );
    execSync(
      `gh release download v${VERSION} --repo ${GITHUB_REPOSITORY} --pattern "SentientSims-${VERSION}-arm64-mac.zip" --skip-existing --dir .`,
    );
    execSync(`unzip -q SentientSims-${VERSION}-arm64-mac.zip -d mac-arm64`);
    execSync(`unzip -q SentientSims-${VERSION}-mac.zip -d mac`);
    break;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    if (Date.now() - startTime >= timeout) break;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
