import '@testing-library/jest-dom';
import fs from 'fs';
import {
  Version,
  VersionService,
} from 'main/sentient-sims/services/VersionService';
import path from 'path';
import { mockDirectoryService } from './util';

describe('Version Service', () => {
  it('get modVersion', () => {
    const directoryService = mockDirectoryService();
    const versionService = new VersionService(directoryService);
    const version: Version = {
      version: '0192830jklasd',
    };

    // Test no version file existing
    expect(versionService.getModVersion().version).toEqual('none');

    directoryService.createDirectoryIfNotExist(
      path.dirname(directoryService.getModVersionFile()),
    );
    fs.writeFileSync(
      directoryService.getModVersionFile(),
      JSON.stringify(version),
    );
    expect(versionService.getModVersion().version).toEqual(version.version);
  });
});
