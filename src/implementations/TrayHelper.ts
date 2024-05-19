import { Menu, MenuItemConstructorOptions, Tray, nativeImage } from "electron";
import { JsonUtils } from "@tser-framework/commons";
import { LoggerMain } from "./LoggerMain";
import { TranslatorMain } from "./TranslatorMain";

export class TrayBuilder {
  private iconPath: string;
  private toolTip: string | null = null;
  private contextMenu: Array<MenuItemConstructorOptions> | null = null;

  public static builder(iconPath: string): TrayBuilder {
    return new TrayBuilder(iconPath);
  }

  private constructor(iconPath: string) {
    this.iconPath = iconPath;
  }

  public withToolTip(text: string): TrayBuilder {
    this.toolTip = text;
    return this;
  }

  public withMenu(menu: Array<MenuItemConstructorOptions>): TrayBuilder {
    this.contextMenu = menu;
    return this;
  }

  public build(): Tray {
    try {
      const tray = new Tray(nativeImage.createFromPath(this.iconPath));
      if (this.toolTip) {
        tray.setToolTip(this.toolTip);
      }

      if (this.contextMenu) {
        JsonUtils.modifyObject(
          this.contextMenu,
          ["label"],
          (_, value: unknown) => {
            return TranslatorMain.translate(value as string);
          }
        );
        tray.setContextMenu(Menu.buildFromTemplate(this.contextMenu));
      }

      return tray;
    } catch (error) {
      LoggerMain.error("Error creating tray icon", error);
      throw error;
    }
  }
}
