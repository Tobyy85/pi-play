import { contextBridge, ipcRenderer } from 'electron'

import type { ArduinoData } from '@shared/types/arduino'

const electronApi = {
    arduino: {
        subscribeToData: (callback: (arduinoData: ArduinoData) => void) => {
            ipcRenderer.on('arduino:change', (_event, data: ArduinoData) => {
                callback(data)
            })
        },
        subscribeToType: (type: ArduinoData['type'], callback: (value: ArduinoData['value']) => void) => {
            ipcRenderer.on('arduino:change', (_event, data: ArduinoData) => {
                if (data.type === type) {
                    callback(data.value)
                }
            })
        },
    },
}

export type ElectronApi = typeof electronApi

contextBridge.exposeInMainWorld('api', electronApi)
