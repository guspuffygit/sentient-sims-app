import { makeUniversalApp } from '@electron/universal';

const currentDirectory = process.cwd();

(async () => {
  await makeUniversalApp({
    x64AppPath: `${currentDirectory}/mac/SentientSims.app`,
    arm64AppPath: `${currentDirectory}/mac-arm64/SentientSims.app`,
    outAppPath: `${currentDirectory}/universal/SentientSims.app`,
  });

  console.log('Mac universal build complete');
})();
