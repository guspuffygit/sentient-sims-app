import { makeUniversalApp } from '@electron/universal';
import { readdirSync } from 'fs';
import * as path from 'path';
import log from 'electron-log';

const currentDirectory = path.dirname(__filename);
log.info('current: ');
log.info(readdirSync(`${currentDirectory}`));
log.info('mac: ');
log.info(readdirSync(`${currentDirectory}/mac`));

(async () => {
  await makeUniversalApp({
    x64AppPath: `${currentDirectory}/mac/SentientSims.app`,
    arm64AppPath: `${currentDirectory}/mac-arm64/SentientSims.app`,
    outAppPath: `${currentDirectory}/universal/SentientSims.app`,
  });

  log.info('Mac universal build complete');
})();
