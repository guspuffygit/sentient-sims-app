import { detect } from 'detect-port';

const port = process.env.PORT || '1212';

const availablePort = await detect(port);
if (port !== String(availablePort)) {
  throw new Error(`Port "${port}" on "localhost" is already in use. Please use another port. ex: PORT=4343 npm start`);
}
