import { app, autoUpdater, BrowserWindow, dialog } from "electron";

type QueryParams = {
  arch: string;
  platform: string;
  current_version: string;
};

const getQueryString = (query: QueryParams): string => {
  const params = new URLSearchParams();
  params.append("arch", query.arch);
  params.append("platform", query.platform);
  params.append("current_version", query.current_version);
  return params.toString();
};

//downloaded => yes update -> restart
//downloaded => no update -> restart

class AppUpdater {
  constructor() {
    const server = `http://localhost:3002/check-update?${getQueryString({
      arch: process.arch,
      platform: process.platform,
      current_version: app.getVersion(),
    })}`;
    const url = `${server}`;
    autoUpdater.setFeedURL({ url });
  }

  checkForUpdates() {
    return new Promise((resolve, reject) => {
      autoUpdater.checkForUpdates();

      autoUpdater.on(
        "update-downloaded",
        (event, releaseNotes, releaseName) => {
          dialog.showErrorBox("title", "update-downloaded");
          const dialogOpts = {
            type: "info",
            buttons: ["Restart", "Later"],
            title: "Application Update",
            message: process.platform === "win32" ? releaseNotes : releaseName,
            detail:
              "A new version has been downloaded. Restart the application to apply the updates.",
          } as any;

          dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) {
              setImmediate(() => autoUpdater.quitAndInstall());
            }
          });
          console.log("update-downloaded", event, releaseNotes, releaseName);
        }
      );

      autoUpdater.on("update-available", (info: any) => {
        // dialog.showErrorBox("title", "update-available");
        console.log("update-available");
        resolve(true);
      });

      autoUpdater.on("update-not-available", (info: any) => {
        // dialog.showErrorBox("title", "update-not-available");
        console.log("update-not-available", info);
        resolve(false);
      });

      autoUpdater.on("error", (error) => {
        dialog.showErrorBox("error happened", JSON.stringify(error));
        console.log("error", error);
        resolve(false);
      });
    });
  }

  async downloadUpdate() {
    autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
      const dialogOpts = {
        type: "info",
        buttons: ["Restart", "Later"],
        title: "Application Update",
        message: process.platform === "win32" ? releaseNotes : releaseName,
        detail:
          "A new version has been downloaded. Restart the application to apply the updates.",
      } as any;

      dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall();
      });
      console.log("update-downloaded", event, releaseNotes, releaseName);
    });
  }

  quitAndInstall() {
    autoUpdater.quitAndInstall();
  }
}

export const appUpdater = new AppUpdater();

// autoUpdater.setFeedURL({ url });

// autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
//   const dialogOpts = {
//     type: "info",
//     buttons: ["Restart", "Later"],
//     title: "Application Update",
//     message: process.platform === "win32" ? releaseNotes : releaseName,
//     detail:
//       "A new version has been downloaded. Restart the application to apply the updates.",
//   } as any;

//   dialog.showMessageBox(dialogOpts).then((returnValue) => {
//     if (returnValue.response === 0) autoUpdater.quitAndInstall();
//   });
//   console.log("update-downloaded", event, releaseNotes, releaseName);
// });

// autoUpdater.on("update-available", (info: any) => {
//   dialog.showErrorBox("title", "update-available");
//   console.log("update-available", info);
// });

// autoUpdater.on("error", (error) => {
//   // dialog.showErrorBox("title", JSON.stringify(error));
//   console.log("error", error);
// });
