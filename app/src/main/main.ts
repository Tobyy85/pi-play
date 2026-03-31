import 'dotenv/config'
import { app, BrowserWindow } from 'electron'

import WindowManager from '@main/managers/windowManager'

import ArduinoService from '@main/services/ArduinoService'
import GPSService from '@main/services/GpsService'

import BluetoothService from '@main/services/BluetoothService'
import CallService from '@main/services/CallService'
import MapService from '@main/services/MapService'
import MediaPlayerService from '@main/services/MediaPlayerService'
import PhoneBookService from '@main/services/PhoneBookService'

import { ARDUINO_CONFIG } from '@shared/config/arduino'

const windowManager = new WindowManager()
const getWindow = (): BrowserWindow | null => windowManager.getWindow()

const arduinoService = new ArduinoService(getWindow)
const gpsService = new GPSService(getWindow)

MapService.initialize()

const bluetoothService = new BluetoothService(getWindow)
const mediaPlayerService = new MediaPlayerService(getWindow)
const callService = new CallService(getWindow)
const phoneBookService = new PhoneBookService(getWindow)

bluetoothService.onConnectedDeviceChanged(async () => {
    await Promise.allSettled([mediaPlayerService.reload(), callService.reload(), phoneBookService.reload()])
})

/* eslint-disable @typescript-eslint/no-floating-promises */
app.whenReady().then(() => {
    windowManager.createWindow()

    arduinoService.registerIpcHandlers()
    arduinoService.connect(ARDUINO_CONFIG.boardInfo, ARDUINO_CONFIG.baudRate)

    gpsService.registerIpcHandlers()
    gpsService.connect()

    bluetoothService.registerIpcHandlers()
    bluetoothService.initialize()

    mediaPlayerService.registerIpcHandlers()
    mediaPlayerService.initialize()

    callService.registerIpcHandlers()
    callService.initialize()

    phoneBookService.registerIpcHandlers()
    phoneBookService.initialize()

    MapService.registerIpcHandlers()
    MapService.initializeProtocol()

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
/* eslint-enable @typescript-eslint/no-floating-promises */

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
