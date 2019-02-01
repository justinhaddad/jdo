const electron = require('electron');
const {app, BrowserWindow, Tray} = electron;
const {createStore, applyMiddleware, compose} = require('redux');
const thunk = require('redux-thunk').default;
const path = require("path");
const isDev = require("electron-is-dev");
const forwardToRenderer  = require('electron-redux').forwardToRenderer;
const replayActionMain = require('electron-redux').replayActionMain;
const {reducer} = require('../src/reducer');

let mainWindow;
let reminderWindow;
let tray;
// const REMINDERS_URL = 'http://localhost:5005/todos?remindersOnly=true';
//const REMINDERS_URL = 'http://ec2-3-17-36-180.us-east-2.compute.amazonaws.com/todos?remindersOnly=true';

require("update-electron-app")({
  repo: "kitze/react-electron-example",
  updateInterval: "1 hour"
});

const initialState = {'todos': []};

const reducerWrapper = (state = initialState, action = {}) => {
  const newState = reducer(state, action);
  if (reminderWindow) {
    if ((newState.snoozeAllEnd && new Date(newState.snoozeAllEnd) > new Date())
      || newState.todos.findIndex(t => !t.complete && new Date(t.nextReminder) < new Date()) < 0) {
      if(reminderWindow.isVisible()) {
        reminderWindow.hide();
        mainWindow.hide();
      }
    } else {
      reminderWindow.showInactive();
      reminderWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  }
  return newState;
};


let store = createStore(
  reducerWrapper,
  compose(
    applyMiddleware(thunk, forwardToRenderer),
  ),
);

replayActionMain(store);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100, height: 680, title: 'JDO - Tasks', backgroundColor: '#424242',
  });
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000?todos"
      : `file://${path.join(__dirname, "../build/index.html?todos")}`
  );
  // mainWindow.on("closed", () => (mainWindow.hide()));
  mainWindow.on('close', (event) => {
    if (app.quitting) {
      mainWindow = null;
    } else {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  const display = electron.screen.getPrimaryDisplay();
  const width = display.bounds.width;
  const height = display.bounds.height;
  reminderWindow = new BrowserWindow({
    width: 400, height: 500,
    x: width - 400, y: height - 500,
    backgroundColor: '#424242',
    title: 'JDO - Reminders', show: false,
    minimizable: false, maximizable: false, closable: false,
  });
  reminderWindow.on("close", () => reminderWindow.hide());
  reminderWindow.loadURL(
    isDev
      ? "http://localhost:3000?reminders"
      : `file://${path.join(__dirname, "../build/index.html?reminders")}`
  );
  createTrayIcon();
}

function createTrayIcon() {
  const icon = path.join(__dirname, '/logo.png');
  tray = new Tray(icon);

  tray.on('click', () => {
    mainWindow.show();
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// app.on('ready-to-show', () => {mainWindow.show()});
app.on('before-quit', () => app.quitting = true);
app.dock.hide();
