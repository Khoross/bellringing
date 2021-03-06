const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const log = require('electron-log');
log.info("TEST")

const path = require('path');
const url = require('url');

/*************************************************************
 * py process
 *************************************************************/

const PY_DIST_FOLDER = 'dist'
const PY_FOLDER = 'python'
const PY_MODULE = 'websocket-server' // without .py suffix

let pyProc = null
let pyPort = null

const guessPackaged = () => {
  const fullPath = path.join(__dirname, '..', PY_DIST_FOLDER)
  return require('fs').existsSync(fullPath)
}

const getScriptPath = () => {
  if (!guessPackaged()) {
    return path.join(__dirname, '..', PY_FOLDER, PY_MODULE + '.py')
  }
  if (process.platform === 'win32') {
    return path.join(__dirname, '..', PY_DIST_FOLDER, PY_MODULE, PY_MODULE + '.exe')
  }
  return path.join(__dirname, '..', PY_DIST_FOLDER, PY_MODULE, PY_MODULE)
}

const selectPort = () => {
  pyPort = 8765
  return pyPort
}

const createPyProc = () => {
  let script = getScriptPath()
  let port = '' + selectPort()

  if (guessPackaged()) {
    pyProc = require('child_process').execFile(script)
  } else {
    pyProc = require('child_process').spawn('python', [script])
  }
 
  if (pyProc != null) {
    //console.log(pyProc)
    console.log('child process success on port ' + port)
    pyProc.stderr.on('data', function(data) {
      console.log("py stderr: " + data.toString());
      if (mainWindow) {
        try {
          mainWindow.webContents.send('stdout', {text: "py stderr:" + data.toString()})
        } catch (error) {
          console.log("couldn't send stdout message to main window, likely already destroyed")
        }
      }
    });
    pyProc.stdout.on('data', function(data) {
      console.log("py stdout:" + data.toString());
      if (mainWindow) {
        try {
          mainWindow.webContents.send('stdout', {text: "py stdout:" + data.toString()})
        } catch (error) {
          console.log("couldn't send stdout message to main window, likely already destroyed")
        }
      }
    });
  }
}

const exitPyProc = () => {
  log.info('EXIT PY')
  pyProc.kill()
  pyProc = null
  pyPort = null
  log.info('EXIT PY FINISHED')
}

app.on('ready', createPyProc)
app.on('will-quit', exitPyProc)

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600});

    // and load the index.html of the app.
    const startUrl = process.env.ELECTRON_START_URL || url.format({
            pathname: path.join(__dirname, '/../build/index.html'),
            protocol: 'file:',
            slashes: true
        });
    mainWindow.loadURL(startUrl);
    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        log.info('EXIT APP')
        app.quit()
        log.info('APP QUIT COMPLETE')
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.