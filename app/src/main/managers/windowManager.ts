import { app, BrowserWindow } from 'electron'
import path from 'path'

export const createWindow = (isDev: boolean) => {
    const mainWindow = new BrowserWindow({
        width: 1024,
        height: 600,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    })

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000')
        mainWindow.webContents.openDevTools()
    } else {
        const indexHtml = path.join(app.getAppPath(), 'dist', 'index.html')
        mainWindow.loadFile(indexHtml)
    }
}
