import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

import type { ArduinoData } from '@shared/types/arduino'
import type { GPSData } from '@shared/types/gps'
import type { Position, Status, TrackInfo } from '@shared/types/mediaPlayer'

const subscribeToChannel = <T>(channel: string, callback: (data: T) => void) => {
    const cb = (_event: IpcRendererEvent, data: T) => {
        callback(data)
    }
    ipcRenderer.on(channel, cb)
    return () => {
        ipcRenderer.off(channel, cb)
    }
}

const electronApi = {
    arduino: {
        subscribeToData: (callback: (arduinoData: ArduinoData) => void): (() => void) => {
            return subscribeToChannel('arduino:change', callback)
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
            return subscribeToChannel('gps:change', callback)
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
            return subscribeToChannel('mediaPlayer:connectionStatus', callback)
        },

        getTrackInfo: (): Promise<TrackInfo> => {
            return ipcRenderer.invoke('mediaPlayer:getTrackInfo')
        },
        subscribeToTrackInfo: (callback: (trackInfo: TrackInfo) => void): (() => void) => {
            return subscribeToChannel('mediaPlayer:trackInfo', callback)
        },

        getPlaybackStatus: (): Promise<Status> => {
            return ipcRenderer.invoke('mediaPlayer:getPlaybackStatus')
        },
        subscribeToPlaybackStatus: (callback: (status: Status) => void): (() => void) => {
            return subscribeToChannel('mediaPlayer:playbackStatus', callback)
        },

        getPosition: (): Promise<Position> => {
            return ipcRenderer.invoke('mediaPlayer:getPosition')
        },
        subscribeToPosition: (callback: (position: Position) => void): (() => void) => {
            return subscribeToChannel('mediaPlayer:position', callback)
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
