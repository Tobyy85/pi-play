import { app, BrowserWindow } from 'electron'

import WindowManager from '@main/managers/windowManager'

import ArduinoService from '@main/services/ArduinoService'
import GPSService from '@main/services/GpsService'

import BluetoothService from '@main/services/BluetoothService'
import CallService from '@main/services/CallService'
import MediaPlayerService from '@main/services/MediaPlayerService'
import PhoneBookService from '@main/services/PhoneBookService'

import { ARDUINO_CONFIG } from '@shared/config/arduino'

const windowManager = new WindowManager()
const getWindow = () => windowManager.getWindow()

const arduinoService = new ArduinoService(getWindow)
const gpsService = new GPSService(getWindow)

const bluetoothService = new BluetoothService()
const mediaPlayerService = new MediaPlayerService(getWindow)
const callService = new CallService(getWindow)
const phoneBookService = new PhoneBookService()

app.whenReady().then(() => {
    windowManager.createWindow()

    arduinoService.registerIpcHandlers()
    arduinoService.connect(ARDUINO_CONFIG.boardInfo, ARDUINO_CONFIG.baudRate)

    gpsService.registerIpcHandlers()
    gpsService.connect()

    bluetoothService.configureProperties()

    mediaPlayerService.registerIpcHandlers()
    mediaPlayerService.initialize()

    callService.registerIpcHandlers()
    callService.initialize()

    phoneBookService.registerIpcHandlers()
    phoneBookService.initialize()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            windowManager.createWindow()
        }
    })
})

app.on('before-quit', () => {
    arduinoService.disconnect()
    gpsService.disconnect()
    mediaPlayerService.disconnect()
    callService.disconnect()
    phoneBookService.disconnect()
    bluetoothService.disconnect()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
