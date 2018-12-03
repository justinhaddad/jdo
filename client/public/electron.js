const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const axios = require("axios");
const path = require("path");
const isDev = require("electron-is-dev");

let mainWindow;
let reminderWindow;

require("update-electron-app")({
  repo: "kitze/react-electron-example",
  updateInterval: "1 hour"
});

function checkReminders() {
  axios.get('http://localhost:5005/todos?remindersOnly=true').then(resp => {
    if (resp.data.totalCount > 0) {
      reminderWindow.showInactive();
      reminderWindow.setAlwaysOnTop(true, 'screen-saver');
    } else {
      reminderWindow.hide();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({ width: 900, height: 680, title: 'JDO - Tasks' });
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000?todos"
      : `file://${path.join(__dirname, "../build/index.html?todos")}`
  );
  mainWindow.on("closed", () => (mainWindow = null));

  reminderWindow = new BrowserWindow({
    width: 400, height: 780, x: 0, y: 0,
    title: 'JDO - Reminders', show: true,
  });
  reminderWindow.on("closed", () => (reminderWindow.hide()));
  reminderWindow.loadURL(
    isDev
      ? "http://localhost:3000?reminders"
      : `file://${path.join(__dirname, "../build/index.html?reminders")}`
  );
  setInterval(checkReminders, 5000);
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

