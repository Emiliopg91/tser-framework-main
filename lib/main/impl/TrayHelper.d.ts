import { Menu, Tray } from 'electron';
export declare class TrayBuilder {
    private iconPath;
    private toolTip;
    private contextMenu;
    static builder(iconPath: string): TrayBuilder;
    private constructor();
    withToolTip(text: string): TrayBuilder;
    withContextMenu(menu: Menu): TrayBuilder;
    build(): Tray;
}
export declare class TrayMenuBuilder {
    private entries;
    private constructor();
    static builder(): TrayMenuBuilder;
    addLabel(label: string, click?: (() => void) | undefined): TrayMenuBuilder;
    addSeparator(): TrayMenuBuilder;
    build(): Menu;
}
