// Modules to control application life and create native browser window
const { app, session, BrowserWindow } = require('electron')
const path = require('path')
const settings = require('electron-settings');

let mainWindow;
let loggedIn = false;

async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    icon: './unnamed.png'
  })

  loggedIn = await getLoggedIn();
  if (!loggedIn) {
    mainWindow.loadURL("https://instagram.com")
    mainWindow.webContents.once('did-navigate-in-page', (e, url) => {
      setLoggedIn(true);
      setupRedirect();
    });
  } else {
    mainWindow.loadURL("https://instagram.com/direct");
    setupRedirect();
  }
}

function setupRedirect() {
  mainWindow.webContents.on('did-navigate-in-page', (e, url) => {
    if (!url.includes('/direct') && loggedIn) {
      mainWindow.loadURL("https://instagram.com/direct")
    }
  });
}

async function setLoggedIn(logged) {
  await settings.set('loggedIn', logged);
  loggedIn = logged;
}

async function getLoggedIn() {
  return await settings.get('loggedIn');
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async function () {
  await session.defaultSession.clearStorageData();
  await setLoggedIn(false);
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

