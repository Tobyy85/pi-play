import type { BrowserWindow } from 'electron'

import { getHardwareControlActions } from '@main/utils/hardwareControlActions'
import { ARDUINO_CONFIG } from '@shared/config/arduino'

import ArduinoService from '@main/services/ArduinoService'
import CameraRecordingService from '@main/services/CameraRecordingService'
import GPSService from '@main/services/GpsService'
import HardwareControlsService from '@main/services/HardwareControlsService'
import MapService from '@main/services/MapService'
import SystemAudioService from '@main/services/SystemAudioService'

import BluetoothService from '@main/services/BluetoothService'
import CallService from '@main/services/CallService'
import MediaPlayerService from '@main/services/MediaPlayerService'
import PhoneBookService from '@main/services/PhoneBookService'

export interface Services {
    arduinoService: ArduinoService
    cameraRecordingService: CameraRecordingService
    gpsService: GPSService
    hardwareControlsService: HardwareControlsService
    bluetoothService: BluetoothService
    callService: CallService
    mediaPlayerService: MediaPlayerService
    phoneBookService: PhoneBookService
}

export const createServices = (getWindow: () => BrowserWindow | null): Services => {
    const gpsService = new GPSService(getWindow)
    const cameraRecordingService = new CameraRecordingService(getWindow)
    const systemAudioService = new SystemAudioService(getWindow)

    MapService.initialize()

    const bluetoothService = new BluetoothService(getWindow)
    const mediaPlayerService = new MediaPlayerService(getWindow)
    const callService = new CallService(getWindow)
    const phoneBookService = new PhoneBookService(getWindow)

    const hardwareControlsService = new HardwareControlsService(
        getHardwareControlActions(mediaPlayerService, callService, systemAudioService)
    )
    const arduinoService = new ArduinoService(getWindow, data => {
        hardwareControlsService.handleArduinoData(data)
    })

    bluetoothService.onConnectedDeviceChanged(async () => {
        await Promise.allSettled([
            mediaPlayerService.reload(),
            callService.reload(),
            phoneBookService.reload(),
        ])
    })
    return {
        arduinoService,
        cameraRecordingService,
        gpsService,
        hardwareControlsService,
        bluetoothService,
        callService,
        mediaPlayerService,
        phoneBookService,
    }
}

export const setupServices = (services: Services): void => {
    services.arduinoService.registerIpcHandlers()
    void services.arduinoService.connect(ARDUINO_CONFIG.boards, ARDUINO_CONFIG.baudRate)

    services.gpsService.registerIpcHandlers()
    services.gpsService.connect()

    services.bluetoothService.registerIpcHandlers()
    void services.bluetoothService.initialize()

    services.mediaPlayerService.registerIpcHandlers()
    void services.mediaPlayerService.initialize()

    services.callService.registerIpcHandlers()
    void services.callService.initialize()

    services.phoneBookService.registerIpcHandlers()
    void services.phoneBookService.initialize()

    services.cameraRecordingService.registerIpcHandlers()
    services.cameraRecordingService.initialize()

    MapService.registerIpcHandlers()
    MapService.initializeProtocol()

    SystemAudioService.registerIpcHandlers()
}

export const disconnectServices = (services: Services): void => {
    services.cameraRecordingService.disconnect()
    services.arduinoService.disconnect()
    services.gpsService.disconnect()
    services.mediaPlayerService.disconnect()
    services.callService.disconnect()
    void services.phoneBookService.disconnect()
    services.bluetoothService.disconnect()
    services.hardwareControlsService.disconnect()
}
