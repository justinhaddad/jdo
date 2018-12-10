const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const isDev = require("electron-is-dev");

let mainWindow;
let reminderWindow;

require("update-electron-app")({
  repo: "kitze/react-electron-example",
  updateInterval: "1 hour"
});

function createWindow() {
  mainWindow = new BrowserWindow({ width: 900, height: 680, title: 'JDO' });
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000?todos"
      : `file://${path.join(__dirname, "../build/index.html?todos")}`
  );
  mainWindow.on("closed", () => (mainWindow = null));

  const reminderWindow = new BrowserWindow({
    width: 400, height: 780, parent: mainWindow,
    title: 'Reminders',
  });
  reminderWindow.setAlwaysOnTop(true, 'screen-saver');
  reminderWindow.loadURL(
    isDev
      ? "http://localhost:3000?reminders"
      : `file://${path.join(__dirname, "../build/index.html?reminders")}`
  );
  //setInterval(() => reminderWindow.show(), 5000);
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

