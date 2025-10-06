import fs from 'fs';
import packageJson from './package.json' with { type: 'json' };

const architecture = process.argv[2];

if (!('arm64'.includes(architecture) || 'x64'.includes(architecture))) {
  throw Error('Pass in architecture argument of arm64 or x64');
}

packageJson.build.mac.target.arch = [architecture];

fs.rmSync('package.json');

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('Wrote package.json');
