import { app, BrowserWindow, ipcMain } from 'electron'

import WindowManager from '@main/managers/windowManager'
import { ArduinoService } from '@main/services/arduinoService'
import { GPSService } from '@main/services/gpsService'
import { ARDUINO_CONFIG } from '@shared/config/arduino'

app.whenReady().then(() => {
    const windowManager = new WindowManager()
    let mainWindow = windowManager.createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWindow = windowManager.createWindow()
        }
    })

    // Arduino Service
    const arduinoService = new ArduinoService(mainWindow)
    arduinoService.connect(ARDUINO_CONFIG.boardInfo, ARDUINO_CONFIG.baudRate)

    ipcMain.handle('arduino:requestSensorValue', (_event, sensorId: string) => {
        return arduinoService.requestSensorValue(sensorId)
    })

    // GPS Service
    const gpsService = new GPSService(mainWindow)
    gpsService.connect()

    ipcMain.handle('gps:getData', () => {
        return gpsService.getData()
    })

    ipcMain.handle('gps:getConnectionStatus', () => {
        return gpsService.getConnectionStatus()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
