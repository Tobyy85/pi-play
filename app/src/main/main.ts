import { app, BrowserWindow } from 'electron'

import { createWindow } from '@main/managers/windowManager'

const isDev = !app.isPackaged

app.whenReady().then(() => {
    createWindow(isDev)

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow(isDev)
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
