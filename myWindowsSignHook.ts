import { execFileSync } from 'child_process';

const endpoint = 'eus.codesigning.azure.net';
const certificateProfile = 'sentientsimulations/storm-public';
const timestampAuthority = 'http://timestamp.acs.microsoft.com';

// electron-builder calls this once per Windows binary. jsign signs it through Azure Artifact
// Signing, and the RFC 3161 timestamp keeps the signature valid after the 3-day certificate
// expires. The publish workflow supplies the token and the jar. A build without them (a fork, a
// local package) stays unsigned, and the workflow's verify step is what fails an unsigned release.
export default function (configuration: { path: string }) {
  const jar = process.env.JSIGN_JAR;
  if (!process.env.AZURE_CODESIGN_TOKEN || !jar) {
    console.log(`Not signing ${configuration.path}: AZURE_CODESIGN_TOKEN and JSIGN_JAR are not both set`);
    return;
  }

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
      configuration.path,
    ],
    { stdio: 'inherit' },
  );
}
