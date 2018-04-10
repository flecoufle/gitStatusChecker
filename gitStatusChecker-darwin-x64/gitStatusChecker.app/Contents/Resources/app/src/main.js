const electron = require('electron')
const path = require('path')

const {app, BrowserWindow, Tray, ipcMain, Menu} = electron

let mainWindow, tray
let iconPath = path.join(__dirname, path.join('../', 'img'))

let icons = {clean: 'clean.png', dirty: 'dirty.png', unknown: 'unknown.png'}

app.on('ready', _ => {
    // Tray : Initialize tray
    tray = new Tray(path.join(iconPath, icons.unknown))
    tray.setToolTip('Open settings')
    tray.setContextMenu(Menu.buildFromTemplate([
        { label: 'Show App', click: _ => mainWindow.show() },
        { label: 'Quit', click: _ => { app.isQuiting = true; app.quit(); } }
    ]))
    tray.on('click', _ => {
        if (mainWindow.isVisible())
            mainWindow.hide()
        else
            mainWindow.show()
    })

    // MainWindow : Instanciate a new window and open it
    mainWindow = new BrowserWindow({
        height: 200,
        width: 450
    })
    mainWindow.loadURL(`file://${__dirname}/status.html`)

    // Tray : Minimize to tray when close or minimise
    mainWindow.on('minimize',function(event){
        event.preventDefault()
        mainWindow.hide()
    });
    mainWindow.on('close', function (event) {
        if( !app.isQuiting){
            event.preventDefault()
            mainWindow.hide()
        }
        return false;
    });

    // Clean : Clear the mainWindow on close
    app.on('close', _ => {
        mainWindow = null
    })
})

// IPC : hange the tray icon when a new status is detected in the git respository
ipcMain.on('status-change', (event, status) => {
    tray.setImage(path.join(iconPath, icons[status]))
})
