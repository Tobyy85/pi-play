import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

import type { ArduinoData } from '@shared/types/arduino'

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
}

export type ElectronApi = typeof electronApi

contextBridge.exposeInMainWorld('api', electronApi)
