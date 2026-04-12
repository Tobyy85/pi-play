import 'dotenv/config'
import { app, BrowserWindow } from 'electron'

import WindowManager from '@main/managers/windowManager'

import ArduinoService from '@main/services/ArduinoService'
import CameraRecordingService from '@main/services/CameraRecordingService'
import GPSService from '@main/services/GpsService'
import HardwareControlsService from '@main/services/HardwareControlsService'
import MapService from '@main/services/MapService'

import BluetoothService from '@main/services/BluetoothService'
import CallService from '@main/services/CallService'
import MediaPlayerService from '@main/services/MediaPlayerService'
import PhoneBookService from '@main/services/PhoneBookService'

import { getHardwareControlActions } from '@main/utils/hardwareControlActions'
import { ARDUINO_CONFIG } from '@shared/config/arduino'

const windowManager = new WindowManager()
const getWindow = (): BrowserWindow | null => windowManager.getWindow()

const gpsService = new GPSService(getWindow)
const cameraRecordingService = new CameraRecordingService(getWindow)

MapService.initialize()

const bluetoothService = new BluetoothService(getWindow)
const mediaPlayerService = new MediaPlayerService(getWindow)
const callService = new CallService(getWindow)
const phoneBookService = new PhoneBookService(getWindow)

const hardwareControlsService = new HardwareControlsService(
    getHardwareControlActions(mediaPlayerService, callService)
)
const arduinoService = new ArduinoService(getWindow, data => {
    hardwareControlsService.handleArduinoData(data)
})

bluetoothService.onConnectedDeviceChanged(async () => {
    await Promise.allSettled([mediaPlayerService.reload(), callService.reload(), phoneBookService.reload()])
})

/* eslint-disable @typescript-eslint/no-floating-promises */
app.whenReady().then(() => {
    windowManager.createWindow()

    arduinoService.registerIpcHandlers()
    arduinoService.connect(ARDUINO_CONFIG.boards, ARDUINO_CONFIG.baudRate)

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

    cameraRecordingService.registerIpcHandlers()
    cameraRecordingService.initialize()

    MapService.registerIpcHandlers()
    MapService.initializeProtocol()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            windowManager.createWindow()
        }
    })
})

app.on('before-quit', () => {
    cameraRecordingService.disconnect()
    arduinoService.disconnect()
    gpsService.disconnect()
    mediaPlayerService.disconnect()
    callService.disconnect()
    phoneBookService.disconnect()
    bluetoothService.disconnect()
    hardwareControlsService.disconnect()
})
/* eslint-enable @typescript-eslint/no-floating-promises */

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
