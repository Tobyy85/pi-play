import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

import type { ArduinoData } from '@shared/types/arduino'
import type { GPSData } from '@shared/types/gps'
import type { Position, Status, TrackInfo } from '@shared/types/mediaPlayer'

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
    mediaPlayer: {
        connectionStatus: (): Promise<boolean> => {
            return ipcRenderer.invoke('mediaPlayer:connectionStatus')
        },
        subscribeToConnectionStatus: (callback: (connectionStatus: boolean) => void): (() => void) => {
            const handler = (_event: IpcRendererEvent, data: boolean) => {
                callback(data)
            }
            ipcRenderer.on('mediaPlayer:connectionStatus', handler)
            return () => {
                ipcRenderer.off('mediaPlayer:connectionStatus', handler)
            }
        },

        getTrackInfo: (): Promise<TrackInfo> => {
            return ipcRenderer.invoke('mediaPlayer:getTrackInfo')
        },
        subscribeToTrackInfo: (callback: (trackInfo: TrackInfo) => void): (() => void) => {
            const handler = (_event: IpcRendererEvent, data: TrackInfo) => {
                callback(data)
            }
            ipcRenderer.on('mediaPlayer:trackInfo', handler)
            return () => {
                ipcRenderer.off('mediaPlayer:trackInfo', handler)
            }
        },

        getPlaybackStatus: (): Promise<Status> => {
            return ipcRenderer.invoke('mediaPlayer:getPlaybackStatus')
        },
        subscribeToPlaybackStatus: (callback: (status: Status) => void): (() => void) => {
            const handler = (_event: IpcRendererEvent, data: Status) => {
                callback(data)
            }
            ipcRenderer.on('mediaPlayer:playbackStatus', handler)
            return () => {
                ipcRenderer.off('mediaPlayer:playbackStatus', handler)
            }
        },

        getPosition: (): Promise<Position> => {
            return ipcRenderer.invoke('mediaPlayer:getPosition')
        },
        subscribeToPosition: (callback: (position: Position) => void): (() => void) => {
            const handler = (_event: IpcRendererEvent, data: Position) => {
                callback(data)
            }
            ipcRenderer.on('mediaPlayer:position', handler)
            return () => {
                ipcRenderer.off('mediaPlayer:position', handler)
            }
        },
        play: async () => {
            await ipcRenderer.invoke('mediaPlayer:play')
        },
        pause: async () => {
            await ipcRenderer.invoke('mediaPlayer:pause')
        },
        next: async () => {
            await ipcRenderer.invoke('mediaPlayer:next')
        },
        previous: async () => {
            await ipcRenderer.invoke('mediaPlayer:previous')
        },
    },
}

export type ElectronApi = typeof electronApi

contextBridge.exposeInMainWorld('api', electronApi)
