const fs = require('fs');

const architecture = process.argv[2];

if (!('arm64'.includes(architecture) || 'x64'.includes(architecture))) {
  throw Error('Pass in architecture argument of arm64 or x64');
}

const packageJson = JSON.parse(fs.readFileSync('package.json'));

packageJson.build.mac.target.arch = [architecture];

if (architecture === 'x64') {
  delete packageJson.build.afterPack;
}

fs.rmSync('package.json');

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('Wrote package.json');
