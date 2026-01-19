import { app, BrowserWindow, ipcMain } from 'electron'

import CONFIG from '@main/config'
import WindowManager from '@main/managers/windowManager'
import { ArduinoService } from '@main/services/arduinoService'

app.whenReady().then(() => {
    const windowManager = new WindowManager()
    let mainWindow = windowManager.createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWindow = windowManager.createWindow()
        }
    })

    const arduinoService = new ArduinoService(mainWindow)
    arduinoService.connect(CONFIG.arduino.boardInfo, CONFIG.arduino.baudRate)

    ipcMain.handle('arduino:requestSensorValue', (_event, sensorId: string) => {
        return arduinoService.requestSensorValue(sensorId)
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
