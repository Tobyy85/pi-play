import { BrowserWindow, app } from 'electron'
import path from 'path'

import { isDev } from '@main/utils/isDev'

class WindowManager {
    private browserWindow: BrowserWindow | null = null

    public async createWindow(): Promise<BrowserWindow> {
        this.browserWindow = new BrowserWindow({
            width: 1024,
            height: 600,
            fullscreen: !isDev,
            icon: path.join(__dirname, '..', '..', '..', 'assets', 'icon.png'),
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, '..', 'preload.js'),
                sandbox: false, // Disable sandbox to allow native module like serialport
            },
        })

        if (isDev) {
            await this.browserWindow.loadURL('http://localhost:3000')
            this.browserWindow.webContents.openDevTools()
        } else {
            const indexHtml = path.join(app.getAppPath(), 'dist', 'index.html')
            await this.browserWindow.loadFile(indexHtml)
        }

        this.browserWindow.on('closed', () => {
            this.browserWindow = null
        })

        return this.browserWindow
    }

    public getWindow(): BrowserWindow | null {
        return this.browserWindow
    }
}

export default WindowManager
