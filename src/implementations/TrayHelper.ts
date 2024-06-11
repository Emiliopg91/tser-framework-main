import { JsonUtils } from '@tser-framework/commons';
import { Menu, MenuItemConstructorOptions, Tray, nativeImage } from 'electron';

import { LoggerMain } from './LoggerMain';
import { TranslatorMain } from './TranslatorMain';

export class TrayBuilder {
  private ICON_PATH: string;
  private TOOLTIP: string | null = null;
  private CONTEXT_MENU: Array<MenuItemConstructorOptions> | null = null;
  private static LOGGER = new LoggerMain('TrayBuilder');

  public static builder(iconPath: string): TrayBuilder {
    return new TrayBuilder(iconPath);
  }

  private constructor(iconPath: string) {
    this.ICON_PATH = iconPath;
  }

  public withToolTip(text: string): TrayBuilder {
    this.TOOLTIP = text;
    return this;
  }

  public withMenu(menu: Array<MenuItemConstructorOptions>): TrayBuilder {
    this.CONTEXT_MENU = menu;
    return this;
  }

  public build(): Tray {
    try {
      const tray = new Tray(nativeImage.createFromPath(this.ICON_PATH));
      if (this.TOOLTIP) {
        tray.setToolTip(this.TOOLTIP);
      }

      if (this.CONTEXT_MENU) {
        const menu = JsonUtils.modifyObject(this.CONTEXT_MENU, ['label'], (_, value: unknown) => {
          return TranslatorMain.translate(value as string);
        });
        tray.setContextMenu(Menu.buildFromTemplate(menu));
      }

      return tray;
    } catch (error) {
      TrayBuilder.LOGGER.error('Error creating tray icon', error);
      throw error;
    }
  }
}
