import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

const endpoint = 'eus.codesigning.azure.net';
const certificateProfile = 'sentientsimulations/storm-public';
const timestampAuthority = 'http://timestamp.acs.microsoft.com';

// Binaries that reach the build byte-identical on every run: Electron's DLLs, sharp's prebuilt
// libvips, and electron-builder's elevate.exe. The app exe, the installers and the locally
// compiled better_sqlite3.node differ per build, so caching their signatures would never hit.
const prebuilt = /\.dll$|[\\/]@img[\\/].+\.node$|[\\/]elevate\.exe$/i;

function jsign(jar: string, file: string, extraArgs: string[] = []) {
  execFileSync(
    'java',
    [
      '-jar',
      jar,
      '--storetype',
      'TRUSTEDSIGNING',
      '--keystore',
      endpoint,
      '--storepass',
      'env:AZURE_CODESIGN_TOKEN',
      '--alias',
      certificateProfile,
      '--tsaurl',
      timestampAuthority,
      '--tsmode',
      'RFC3161',
      '--replace',
      ...extraArgs,
      file,
    ],
    { stdio: 'inherit' },
  );
}

// electron-builder calls this once per Windows binary. jsign signs it through Azure Artifact
// Signing, and the RFC 3161 timestamp keeps the signature valid after the 3-day certificate
// expires. The publish workflow supplies the token and the jar. A build without them (a fork, a
// local package) stays unsigned, and the workflow's verify step is what fails an unsigned release.
//
// With SIGNATURE_CACHE_DIR set, a prebuilt binary's signature is stored there under the SHA-256
// of the unsigned file. jsign --detached re-attaches a stored signature without calling Azure.
// jsign attaches whatever it is given, so the workflow's verify step is also what catches a
// stored signature that does not belong to its file.
export default function (configuration: { path: string }) {
  const file = configuration.path;
  const jar = process.env.JSIGN_JAR;
  if (!process.env.AZURE_CODESIGN_TOKEN || !jar) {
    console.log(`Not signing ${file}: AZURE_CODESIGN_TOKEN and JSIGN_JAR are not both set`);
    return;
  }

  const cacheDir = process.env.SIGNATURE_CACHE_DIR;
  if (!cacheDir || !prebuilt.test(file)) {
    jsign(jar, file);
    return;
  }

  const unsignedHash = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const cached = path.join(cacheDir, `${unsignedHash}.sig`);
  const detached = `${file}.sig`;
  const hit = fs.existsSync(cached);
  if (hit) {
    fs.copyFileSync(cached, detached);
  }

  try {
    jsign(jar, file, ['--detached']);
    if (!hit) {
      fs.mkdirSync(cacheDir, { recursive: true });
      fs.copyFileSync(detached, cached);
    }
  } finally {
    fs.rmSync(detached, { force: true });
  }
}
