import '@testing-library/jest-dom';
import fs from 'fs';
import { Version } from 'main/sentient-sims/services/VersionService';
import path from 'path';
import { mockApiContext } from './util';
import { describe, test, expect } from '@jest/globals';

describe('Version Service', () => {
  test('get modVersion', () => {
    const ctx = mockApiContext();
    const version: Version = {
      version: '0192830jklasd',
    };

    // Test no version file existing
    expect(ctx.version.getModVersion().version).toEqual('none');

    ctx.directory.createDirectoryIfNotExist(path.dirname(ctx.directory.getModVersionFile()));
    fs.writeFileSync(ctx.directory.getModVersionFile(), JSON.stringify(version));
    expect(ctx.version.getModVersion().version).toEqual(version.version);
  });
});
