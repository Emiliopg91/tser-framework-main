import { Notification, app } from 'electron';

import { OSHelper } from './OSHelper';

export class Toaster {
  private constructor() {}

  public static toast(
    body: string,
    icon: string | undefined = undefined,
    onClick: (() => void) | undefined = undefined
  ): void {
    let toastXml: string | undefined = undefined;
    if (OSHelper.isWindows()) {
      if (icon) {
        toastXml =
          "<toast><visual><binding template='ToastImageAndText01'><image id='1' src='" +
          icon +
          "'/><text id='1'>" +
          body +
          '</text></binding></visual></toast>';
      } else {
        toastXml =
          "<toast><visual><binding template='ToastText01'><text id='1'>" +
          body +
          '</text></binding></visual></toast>';
      }
    }

    const notif: Notification = new Notification({ title: app.name, body, icon, toastXml });
    if (onClick) {
      notif.on('click', onClick);
    }
    notif.show();
  }
}
