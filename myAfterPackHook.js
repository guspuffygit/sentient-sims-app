/* eslint-disable */
exports.default = async function(context) {
  if (context.appOutDir.includes('mac-arm64')) {
    const { execSync } = require('child_process');

    const fullPath = `${context.appOutDir}/SentientSims.app/Contents/Resources/app.asar.unpacked/node_modules/better-sqlite3/build/Release/better_sqlite3.node`;
    const outFile = 'better-sqlite3.tar.gz';
    const command = `wget https://github.com/WiseLibs/better-sqlite3/releases/download/v9.1.1/better-sqlite3-v9.1.1-electron-v113-darwin-arm64.tar.gz -O ${outFile}`;
    console.log(execSync(command).toString());
    console.log(execSync('tar -xvzf better-sqlite3.tar.gz').toString());
    console.log(execSync(`cp build/Release/better_sqlite3.node ${fullPath}`).toString());
  }
}
