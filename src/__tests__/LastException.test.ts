import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';
import { mockApiContext } from './util';

const expectedParsedResult = `[manus] Setup error for service sentient_sims_service. This will likely cause additional errors in the future. (ConnectionResetError: [WinError 10054] An existing connection was forcibly closed by the remote host)
Traceback (most recent call last):

  File "T:\\InGame\\Gameplay\\Scripts\\Core\\sims4\\utils.py", line 157, in wrapper
  File "T:\\InGame\\Gameplay\\Scripts\\Core\\sims4\\utils.py", line 175, in wrapper
  File "T:\\InGame\\Gameplay\\Scripts\\Server\\areaserver.py", line 250, in c_api_zone_init
  File "T:\\InGame\\Gameplay\\Scripts\\Server\\game_services.py", line 171, in start_services
  File "C:\\Users\\Username\\Documents\\Electronic Arts\\The Sims 4\\Mods\\sentient-sims\\Scripts\\sentient_sims_code\\injector.py", line 18, in _wrapped_function
    return new_function(original_function, *args, **kwargs)
  File "C:\\Users\\Username\\Documents\\Electronic Arts\\The Sims 4\\Mods\\sentient-sims\\Scripts\\sentient_sims_code\\sentient_sims_service.py", line 105, in start_services
    original(self, *args, **kwargs)
  File "T:\\InGame\\Gameplay\\Scripts\\Core\\sims4\\service_manager.py", line 300, in start_services
  File "C:\\Users\\Username\\Documents\\Electronic Arts\\The Sims 4\\Mods\\sentient-sims\\Scripts\\sentient_sims_code\\sentient_sims_service.py", line 54, in setup
    SentientMemoriesService.unload_all_memories()
  File "C:\\Users\\Username\\Documents\\Electronic Arts\\The Sims 4\\Mods\\sentient-sims\\Scripts\\sentient_sims_code\\memories.py", line 84, in unload_all_memories
    urllib.request.urlopen(req, timeout=20)
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 222, in urlopen
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 525, in open
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 543, in _open
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 503, in _call_chain
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 1345, in http_open
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 1323, in do_open
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\http\\client.py", line 1338, in getresponse
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\http\\client.py", line 296, in begin
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\http\\client.py", line 257, in _read_status
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\socket.py", line 596, in readinto
ConnectionResetError: [WinError 10054] An existing connection was forcibly closed by the remote hostrtim=0
ClientInfo isn't here`;

describe('Formatter', () => {
  it('should trim sentence', () => {
    const ctx = mockApiContext();
    const expectedFileName = 'lastException-1901283.txt';
    const lastExceptionFile = path.join(ctx.directoryService.getSims4Folder(), expectedFileName);

    ctx.directoryService.createDirectoryIfNotExist(ctx.directoryService.getSims4Folder());

    fs.copyFileSync('./src/__tests__/lastException.txt', lastExceptionFile);

    const files = ctx.lastExceptionService.getLastExceptionFiles();
    const expectedFile = files[0];
    expect(expectedFile).toEqual(lastExceptionFile);

    const parsedFiles = ctx.lastExceptionService.getParsedLastExceptionFiles();
    const actualParsedFile = parsedFiles[0];
    expect(actualParsedFile.filename).toEqual(expectedFileName);
    expect(actualParsedFile.text).toEqual(expectedParsedResult);
  });
});
