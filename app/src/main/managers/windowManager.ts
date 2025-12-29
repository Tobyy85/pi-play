import { BrowserWindow, app } from 'electron'
import path from 'path'

import { isDev } from '@main/utils/isDev'

class WindowManager {
    private browserWindow: BrowserWindow | null = null

    public createWindow(): BrowserWindow {
        this.browserWindow = new BrowserWindow({
            width: 800,
            height: 600,
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, '..', 'preload.js'),
            },
        })

        if (isDev) {
            this.browserWindow.loadURL('http://localhost:3000')
            this.browserWindow.webContents.openDevTools()
        } else {
            const indexHtml = path.join(app.getAppPath(), 'dist', 'index.html')
            this.browserWindow.loadFile(indexHtml)
        }

        return this.browserWindow
    }
}

export default WindowManager
