import { Menu, MenuItemConstructorOptions, Tray, nativeImage } from "electron";
import { LoggerMain } from "./LoggerMain";
import { TranslatorMain } from "./TranslatorMain";

export class TrayBuilder {
  private iconPath: string;
  private toolTip: string | null = null;
  private contextMenu: Menu | null = null;

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

  public withContextMenu(menu: Menu): TrayBuilder {
    this.contextMenu = menu;
    return this;
  }

  public build(): Tray {
    try {
      const tray = new Tray(nativeImage.createFromPath(this.iconPath));
      if (this.toolTip) tray.setToolTip(this.toolTip);

      if (this.contextMenu) tray.setContextMenu(this.contextMenu);

      return tray;
    } catch (error) {
      LoggerMain.error("Error creating tray icon", error);
      throw error;
    }
  }
}

export class TrayMenuBuilder {
  private entries: Array<MenuItemConstructorOptions> = [];

  private constructor() {}

  public static builder(): TrayMenuBuilder {
    return new TrayMenuBuilder();
  }

  public addLabel(
    label: string,
    click: (() => void) | undefined = undefined
  ): TrayMenuBuilder {
    this.entries.push({
      label,
      type: "normal",
      click,
    });
    return this;
  }

  public addSeparator(): TrayMenuBuilder {
    this.entries.push({ type: "separator" });
    return this;
  }

  public build(): Menu {
    for (let i = 0; i < this.entries.length; i++) {
      if (this.entries[i]["label"]) {
        this.entries[i]["label"] = TranslatorMain.translate(
          this.entries[i]["label"] as string
        );
      }
    }
    return Menu.buildFromTemplate(this.entries);
  }
}
