import 'dotenv/config'
import { app, BrowserWindow } from 'electron'

import WindowManager from '@main/managers/windowManager'

import { createServices, disconnectServices, setupServices } from '@main/bootstrap/services'

const windowManager = new WindowManager()
const getWindow = (): BrowserWindow | null => windowManager.getWindow()

const services = createServices(getWindow)

void app.whenReady().then(() => {
    void windowManager.createWindow()

    setupServices(services)

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            void windowManager.createWindow()
        }
    })
})

app.on('before-quit', () => {
    disconnectServices(services)
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
