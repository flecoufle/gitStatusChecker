const electron = require('electron')
const path = require('path')

const { app, BrowserWindow, Tray, ipcMain, Menu } = electron

let mainWindow, tray
let iconPath = path.join(__dirname, path.join('../', 'img'))

let icons = { clean: 'clean.png', dirty: 'dirty.png', unknown: 'unknown.png' }

app.on('ready', _ => {
  // Tray : Initialize tray
  tray = new Tray(path.join(iconPath, icons.unknown))
  tray.setToolTip('Git command')
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Stage all changes',
      click: _ => {
        mainWindow.show()
        mainWindow.webContents.send('stageRequest', 'A')
      }
    },
    { label: 'Commit...', click: _ => mainWindow.webContents.send('commitRequest', 'B') },
    { label: 'Commit+Push...', click: _ => mainWindow.webContents.send('commitPushRequest', 'C') },
    { label: 'Push', click: _ => mainWindow.webContents.send('pushRequest', 'D') },
    { label: 'Stage+Commit+Push...', click: _ => mainWindow.webContents.send('stageCommitPushRequest', 'E') },
    { label: 'Test', click: _ => mainWindow.webContents.send('testRequest', 'F') },
    { label: 'Git',
      click: _ => {
        mainWindow.show()
        mainWindow.webContents.send('commitRequest', 'B')
      }
    },
    { label: 'Config', click: _ => mainWindow.show() },
    { label: 'Close', click: _ => { app.isQuiting = true; app.quit() } }
  ]))
  tray.on('click', _ => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })

  // MainWindow : Instanciate a new window and open it
  mainWindow = new BrowserWindow({
    height: 200,
    width: 500,
    center: true,
    alwaysOnTop: false
    /* skipTaskbar: false,
    title: 'Git status',
    show: false,
    frame: false,
    disableAutoHideCursor: true,
    titleBarStyle: 'hidden' */
  })
  // mainWindow.hide()
  mainWindow.loadURL(`file://${__dirname}/status.html`)

  // Tray : Minimize to tray when close or minimise
  mainWindow.on('minimize', function (event) {
    event.preventDefault()
    mainWindow.hide()
  })
  mainWindow.on('close', function (event) {
    if (!app.isQuiting) {
      event.preventDefault()
      mainWindow.hide()
    }
    return false
  })

  // Clean : Clear the mainWindow on close
  app.on('close', _ => {
    mainWindow = null
  })
})

// IPC : hange the tray icon when a new status is detected in the git respository
ipcMain.on('status-change', (event, status) => {
  tray.setImage(path.join(iconPath, icons[status]))
})

ipcMain.on('repo-name', (event, name) => {
  tray.setToolTip(name)
})
