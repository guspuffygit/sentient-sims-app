import * as fs from 'fs';

const version = process.argv[2];

const packageLockFile = './release/app/package-lock.json';
const packageLock = JSON.parse(fs.readFileSync(packageLockFile, 'utf-8'));

packageLock.version = version;
packageLock.packages[''].version = version;

fs.writeFileSync(packageLockFile, JSON.stringify(packageLock, null, 2));

const packageFile = './release/app/package.json';
const packageData = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));

packageData.version = version;

fs.writeFileSync(packageFile, JSON.stringify(packageData, null, 2));
