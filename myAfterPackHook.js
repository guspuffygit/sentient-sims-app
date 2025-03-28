/* eslint-disable */
const { execSync } = require('child_process');

function extractBetterSQLite(context, url) {
  const fullPath = `${context.appOutDir}/SentientSims.app/Contents/Resources/app.asar.unpacked/node_modules/better-sqlite3/build/Release/better_sqlite3.node`;
  const outFile = 'better-sqlite3.tar.gz';
  const command = `wget ${url} -O ${outFile}`;
  console.log(execSync(command).toString());
  console.log(execSync('tar -xvzf better-sqlite3.tar.gz').toString());
  console.log(execSync(`cp build/Release/better_sqlite3.node ${fullPath}`).toString());
}

exports.default = async function(context) {
  if (process.env.BUILD_ARCHITECTURE === 'arm64') {
    extractBetterSQLite(context, 'https://github.com/WiseLibs/better-sqlite3/releases/download/v9.6.0/better-sqlite3-v9.6.0-electron-v118-darwin-arm64.tar.gz');
  } else if (process.env.BUILD_ARCHITECTURE === 'x64') {
    extractBetterSQLite(context, 'https://github.com/WiseLibs/better-sqlite3/releases/download/v9.6.0/better-sqlite3-v9.6.0-electron-v118-darwin-x64.tar.gz');
  }
}
