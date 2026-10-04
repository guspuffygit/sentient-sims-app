import log from 'electron-log';

log.transports.file.setAppName('sentient-sims-app');
// Unit tests must not write fixture traffic into a real log file — test noise in
// %APPDATA%/sentient-sims-app/logs muddied live debugging of the 08-24 stream session
log.transports.file.level = false;
