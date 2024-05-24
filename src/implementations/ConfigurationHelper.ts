import path from "path";
import { FileHelper } from "./FileHelper";
import { JsonUtils } from "@tser-framework/commons";

export class ConfigurationHelper {
  private constructor() {}

  private static CONFIG_FOLDER: string = path.join(
    FileHelper.APP_DIR,
    "config"
  );
  private static CONFIG_FILE: string = path.join(
    ConfigurationHelper.CONFIG_FOLDER,
    "config.json"
  );
  private static CONFIG_MAP: Record<string, any> = {};
  private static PROXY_HANDLER: ProxyHandler<Record<string, any>> = {
    get(target, key) {
      if (typeof target[String(key)] === "object" && target[key] !== null) {
        return new Proxy(
          target[String(key)],
          ConfigurationHelper.PROXY_HANDLER
        );
      } else {
        return target[String(key)];
      }
    },
    set: function (
      target: Record<string, any>,
      key: string | symbol,
      value: any
    ) {
      target[String(key)] = value;
      return true;
    },
  };

  public static initialize(defaultConfig: Record<string, any> = {}) {
    if (!FileHelper.exists(ConfigurationHelper.CONFIG_FOLDER)) {
      FileHelper.mkdir(ConfigurationHelper.CONFIG_FOLDER);
    }

    if (!FileHelper.exists(ConfigurationHelper.CONFIG_FILE)) {
      FileHelper.append(
        ConfigurationHelper.CONFIG_FILE,
        JsonUtils.serialize(defaultConfig)
      );
    }

    const cfgJson: string = FileHelper.read(ConfigurationHelper.CONFIG_FILE);
    ConfigurationHelper.CONFIG_MAP = JSON.parse(cfgJson);
  }

  public static configAsInterface<T>(): T {
    return new Proxy(
      ConfigurationHelper.CONFIG_MAP,
      ConfigurationHelper.PROXY_HANDLER
    ) as T;
  }

  public static getValue<T>(key: string): T | undefined {
    return JsonUtils.getValue<T>(key, ConfigurationHelper.CONFIG_MAP);
  }

  public static setValue<T>(key: string, value: T): void {
    JsonUtils.setValue<T>(key, value, ConfigurationHelper.CONFIG_MAP);
    FileHelper.write(
      ConfigurationHelper.CONFIG_FILE,
      JsonUtils.serialize(ConfigurationHelper.CONFIG_MAP)
    );
  }
}
