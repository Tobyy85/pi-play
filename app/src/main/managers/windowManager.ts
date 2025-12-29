import { BrowserWindow, app } from 'electron'
import path from 'path'

import { isDev } from '@main/utils/isDev'

class WindowManager {
    // eslint-disable-next-line class-methods-use-this
    public createWindow(): BrowserWindow {
        const mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, '..', 'preload.js'),
            },
        })

        if (isDev) {
            mainWindow.loadURL('http://localhost:3000')
            mainWindow.webContents.openDevTools()
        } else {
            const indexHtml = path.join(app.getAppPath(), 'dist', 'index.html')
            mainWindow.loadFile(indexHtml)
        }

        return mainWindow
    }
}

export default WindowManager
