import { Privileges, net } from 'electron/main';
import url from 'url';

import { OSHelper } from '../implementations/OSHelper';

export interface ProtocolBinding {
  privileges: Privileges;
  handler: (request: GlobalRequest) => GlobalResponse | Promise<GlobalResponse>;
}

export const defaultProtocolBindings: Record<string, ProtocolBinding> = {
  local: {
    privileges: { bypassCSP: true },
    handler: (request) => {
      let filePath = request.url.slice('local://'.length);
      if (OSHelper.isWindows()) {
        filePath = filePath.substring(0, 1) + ':' + filePath.substring(1);
      }
      return net.fetch(url.pathToFileURL(filePath).toString());
    }
  }
};
