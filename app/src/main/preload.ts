import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

import type { ArduinoData } from '@shared/types/arduino'
import type { GPSData } from '@shared/types/gps'

const electronApi = {
    arduino: {
        subscribeToData: (callback: (arduinoData: ArduinoData) => void): (() => void) => {
            const handler = (_event: IpcRendererEvent, data: ArduinoData) => {
                callback(data)
            }
            ipcRenderer.on('arduino:change', handler)
            return () => {
                ipcRenderer.off('arduino:change', handler)
            }
        },
        subscribeToSensorId: (
            sensorId: ArduinoData['sensorId'],
            callback: (value: ArduinoData['value']) => void
        ): (() => void) => {
            const handler = (_event: IpcRendererEvent, data: ArduinoData) => {
                if (data.sensorId === sensorId) {
                    callback(data.value)
                }
            }
            ipcRenderer.on('arduino:change', handler)
            return () => {
                ipcRenderer.off('arduino:change', handler)
            }
        },
        requestSensorValue: (sensorId: string): Promise<ArduinoData> => {
            return ipcRenderer.invoke('arduino:requestSensorValue', sensorId)
        },
    },
    gps: {
        subscribe: (callback: (gpsData: GPSData) => void): (() => void) => {
            const handler = (_event: IpcRendererEvent, data: GPSData) => {
                callback(data)
            }
            ipcRenderer.on('gps:change', handler)
            return () => {
                ipcRenderer.off('gps:change', handler)
            }
        },
        getData: (): Promise<GPSData> => {
            return ipcRenderer.invoke('gps:getData')
        },
        getConnectionStatus: (): Promise<boolean> => {
            return ipcRenderer.invoke('gps:getConnectionStatus')
        },
    },
}

export type ElectronApi = typeof electronApi

contextBridge.exposeInMainWorld('api', electronApi)
