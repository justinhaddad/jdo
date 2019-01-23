const {app, BrowserWindow, Menu, Tray} = require('electron');
// const app = electron.app;
// const BrowserWindow = electron.BrowserWindow;
const axios = require("axios");
const path = require("path");
const isDev = require("electron-is-dev");
// const {Menu, MenuItem} = remote;
let mainWindow;
let reminderWindow;
let tray;

const REMINDERS_URL = 'http://localhost:5005/todos?remindersOnly=true';
//const REMINDERS_URL = 'http://ec2-3-17-36-180.us-east-2.compute.amazonaws.com/todos?remindersOnly=true';

require("update-electron-app")({
  repo: "kitze/react-electron-example",
  updateInterval: "1 hour"
});

function checkReminders() {
  axios.get(REMINDERS_URL).then(resp => {
    if (resp.data.totalCount > 0) {
      reminderWindow.showInactive();
      reminderWindow.setAlwaysOnTop(true, 'screen-saver');
    } else {
      reminderWindow.hide();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100, height: 680, title: 'JDO - Tasks', backgroundColor: '#424242',
  });
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000?todos"
      : `file://${path.join(__dirname, "../build/index.html?todos")}`
  );
  mainWindow.on("closed", () => (mainWindow = null));

  reminderWindow = new BrowserWindow({
    width: 400, height: 500, x: 0, y: 0, backgroundColor: '#424242',
    title: 'JDO - Reminders', show: true,
    minimizable: false, maximizable: false, closable: false,
  });
  reminderWindow.on("closed", () => (reminderWindow.hide()));
  reminderWindow.loadURL(
    isDev
      ? "http://localhost:3000?reminders"
      : `file://${path.join(__dirname, "../build/index.html?reminders")}`
  );
  setInterval(checkReminders, 5000);
  createTrayIcon();
}

function createTrayIcon() {
  const icon = path.join(__dirname, '/logo.png');
  tray = new Tray(icon);

  tray.on('click', () => {
    mainWindow.show();
  });

  /*
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Tasks', click: () => mainWindow.show()},
    { label: 'Reminders', click: () => reminderWindow.show()},
  ]);
  tray.setContextMenu(contextMenu);
  */
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

