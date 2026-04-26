import 'dotenv/config'
import { app, BrowserWindow, ipcMain } from 'electron'

import WindowManager from '@main/managers/windowManager'
import type { WindowProvider } from '@main/types/window'

import { createServices, disconnectServices, setupServices } from '@main/bootstrap/services'

const windowManager = new WindowManager()
const getWindow: WindowProvider = () => windowManager.getWindow()

const services = createServices(getWindow)
let isQuitting = false

void app.whenReady().then(() => {
    void windowManager.createWindow()

    setupServices(services)

    ipcMain.handle('quit-app', () => {
        app.quit()
    })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            void windowManager.createWindow()
        }
    })
})

app.on('before-quit', event => {
    if (isQuitting) {
        return
    }

    event.preventDefault()
    isQuitting = true

    void (async () => {
        try {
            await disconnectServices(services)
        } finally {
            app.quit()
        }
    })()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
