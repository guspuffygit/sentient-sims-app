const fs = require('fs');

const version = process.argv[2];

const packageLockFile = './release/app/package-lock.json';
const packageLock = JSON.parse(fs.readFileSync(packageLockFile));

packageLock.version = version;
packageLock.packages[''].version = version;

fs.writeFileSync(packageLockFile, JSON.stringify(packageLock, null, 2));

const packageFile = './release/app/package.json';
const package = JSON.parse(fs.readFileSync(packageFile));

package.version = version;

fs.writeFileSync(packageFile, JSON.stringify(package, null, 2));
