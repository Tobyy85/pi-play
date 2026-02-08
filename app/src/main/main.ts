import { app, BrowserWindow } from 'electron'

import WindowManager from '@main/managers/windowManager'
import ArduinoService from '@main/services/arduinoService'
import GPSService from '@main/services/gpsService'
import { ARDUINO_CONFIG } from '@shared/config/arduino'

const windowManager = new WindowManager()
const getWindow = () => windowManager.getWindow()

const arduinoService = new ArduinoService(getWindow)
const gpsService = new GPSService(getWindow)

app.whenReady().then(() => {
    windowManager.createWindow()

    // Arduino Service
    arduinoService.connect(ARDUINO_CONFIG.boardInfo, ARDUINO_CONFIG.baudRate)
    arduinoService.registerIpcHandlers()

    // GPS Service
    gpsService.connect()
    gpsService.registerIpcHandlers()

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
