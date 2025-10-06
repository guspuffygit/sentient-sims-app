import { execSync } from 'child_process';
import releasePackageJson from './release/app/package.json' with { type: 'json' };
import packageJson from './package.json' with { type: 'json' };
import * as nodeAbi from 'node-abi';

function extractBetterSQLite(context: any, url: string) {
  const fullPath = `${context.appOutDir}/SentientSims.app/Contents/Resources/app.asar.unpacked/node_modules/better-sqlite3/build/Release/better_sqlite3.node`;
  const outFile = 'better-sqlite3.tar.gz';
  const command = `wget ${url} -O ${outFile}`;
  console.log(execSync(command).toString());
  console.log(execSync('tar -xvzf better-sqlite3.tar.gz').toString());
  console.log(execSync(`cp build/Release/better_sqlite3.node ${fullPath}`).toString());
}

const betterSqlite3Version = packageJson.devDependencies['better-sqlite3'].replace('^', '');
if (betterSqlite3Version !== releasePackageJson.dependencies['better-sqlite3'].replace('^', '')) {
  throw new Error(`better-sqlite3 must match in package.json and release/app/package.json`);
}

const abiVersion = nodeAbi.getAbi(packageJson.devDependencies.electron.replace('^', ''), 'electron');
console.log(`ABI Version is ${abiVersion}`);

export default async function (context: any) {
  if (process.env.BUILD_ARCHITECTURE === 'arm64') {
    extractBetterSQLite(
      context,
      `https://github.com/WiseLibs/better-sqlite3/releases/download/v${betterSqlite3Version}/better-sqlite3-v${betterSqlite3Version}-electron-v${abiVersion}-darwin-arm64.tar.gz`,
    );
  } else if (process.env.BUILD_ARCHITECTURE === 'x64') {
    extractBetterSQLite(
      context,
      `https://github.com/WiseLibs/better-sqlite3/releases/download/v${betterSqlite3Version}/better-sqlite3-v${betterSqlite3Version}-electron-v${abiVersion}-darwin-x64.tar.gz`,
    );
  }
}
