import { app, BrowserWindow } from 'electron'

import WindowManager from '@main/managers/windowManager'

app.whenReady().then(() => {
    const windowManager = new WindowManager()
    windowManager.createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            windowManager.createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
