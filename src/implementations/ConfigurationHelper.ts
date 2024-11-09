/* eslint-disable @typescript-eslint/no-explicit-any */
import { JsonUtils, LogLevel } from '@tser-framework/commons';
import path from 'path';

import { CryptoHelper } from './CryptoHelper';
import { File } from './File';
import { FileHelper } from './FileHelper';
import { LoggerMain } from './LoggerMain';

export class ConfigurationHelper {
  private constructor() {}

  public static CONFIG_FOLDER: string = path.join(FileHelper.APP_DIR, 'config');
  public static CONFIG_FILE: string = path.join(ConfigurationHelper.CONFIG_FOLDER, 'config.json');
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
    },
    deleteProperty(target, key: string | symbol): boolean {
      target[String(key)] = undefined;
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
    if (!new File({ file: ConfigurationHelper.CONFIG_FOLDER }).exists()) {
      new File({ file: ConfigurationHelper.CONFIG_FOLDER }).mkdir();
    }

    if (!new File({ file: ConfigurationHelper.CONFIG_FILE }).exists()) {
      ConfigurationHelper.CONFIG_MAP = defaultConfig;
      ConfigurationHelper.notify();
      ConfigurationHelper.persist();
    } else {
      const cfgJson: string = FileHelper.read(ConfigurationHelper.CONFIG_FILE);
      ConfigurationHelper.CONFIG_MAP = JSON.parse(cfgJson);
    }

    LoggerMain.setLogLevel(
      LogLevel[ConfigurationHelper.CONFIG_MAP['logger.level'] as keyof typeof LogLevel] ||
        LogLevel.INFO
    );
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

  public static setSecretValue(key: string, value: string): void {
    ConfigurationHelper.setValue<string>(key, CryptoHelper.encryptForUser(value));
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
