/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'path';
import { FileHelper } from './FileHelper';
import { JsonUtils } from '@tser-framework/commons';
import { CryptoHelper } from './CryptoHelper';

export class ConfigurationHelper {
  private constructor() {}

  private static CONFIG_FOLDER: string = path.join(FileHelper.APP_DIR, 'config');
  private static CONFIG_FILE: string = path.join(ConfigurationHelper.CONFIG_FOLDER, 'config.json');
  private static CONFIG_MAP: Record<string, any> = {};
  private static PROXY_HANDLER: ProxyHandler<Record<string, any>> = {
    get(target, key) {
      if (typeof target[String(key)] === 'object' && target[String(key)] !== null) {
        return new Proxy(target[String(key)], ConfigurationHelper.PROXY_HANDLER);
      } else {
        return target[String(key)];
      }
    },
    set: function (target: Record<string, any>, key: string | symbol, value: any) {
      target[String(key)] = value;
      ConfigurationHelper.persist();
      ConfigurationHelper.notify();
      return true;
    }
  };

  private static SUBSCRIPTORS: Record<string, (cfg: Record<string, any>) => void> = {};

  public static registerForChange(
    callback: (cfg: Record<string, any>) => void,
    id: string = String(Date.now())
  ): () => void {
    ConfigurationHelper.SUBSCRIPTORS[id] = callback;

    return () => {
      delete ConfigurationHelper.SUBSCRIPTORS[id];
    };
  }

  public static initialize(defaultConfig: Record<string, any> = {}): void {
    if (!FileHelper.exists(ConfigurationHelper.CONFIG_FOLDER)) {
      FileHelper.mkdir(ConfigurationHelper.CONFIG_FOLDER);
    }

    if (!FileHelper.exists(ConfigurationHelper.CONFIG_FILE)) {
      ConfigurationHelper.CONFIG_MAP = defaultConfig;
      ConfigurationHelper.notify();
      ConfigurationHelper.persist();
    } else {
      const cfgJson: string = FileHelper.read(ConfigurationHelper.CONFIG_FILE);
      ConfigurationHelper.CONFIG_MAP = JSON.parse(cfgJson);
    }
  }

  public static configAsInterface<T>(): T {
    return new Proxy(ConfigurationHelper.CONFIG_MAP, ConfigurationHelper.PROXY_HANDLER) as T;
  }

  public static config(): Record<string, any> {
    return ConfigurationHelper.CONFIG_MAP;
  }

  public static getValue<T>(key: string): T | undefined {
    return JsonUtils.getValue<T>(key, ConfigurationHelper.CONFIG_MAP);
  }

  public static getSecretValue(key: string): string | undefined {
    const prop = JsonUtils.getValue<string>(key, ConfigurationHelper.CONFIG_MAP);
    if (prop) {
      return CryptoHelper.decrypt(prop);
    } else {
      return undefined;
    }
  }

  public static setValue<T>(key: string, value: T): void {
    JsonUtils.setValue<T>(key, value, ConfigurationHelper.CONFIG_MAP);
    ConfigurationHelper.notify();
    ConfigurationHelper.persist();
  }

  private static persist(): void {
    FileHelper.write(
      ConfigurationHelper.CONFIG_FILE,
      JsonUtils.serialize(ConfigurationHelper.CONFIG_MAP)
    );
  }

  private static notify(): void {
    for (const id in ConfigurationHelper.SUBSCRIPTORS) {
      (async (): Promise<void> => {
        ConfigurationHelper.SUBSCRIPTORS[id](ConfigurationHelper.CONFIG_MAP);
      })();
    }
  }
}
