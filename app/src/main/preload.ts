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

const generateDataHandler = <T>(getChannel: string, subscribeChannel: string) => {
    return {
        get: (): Promise<T> => {
            return ipcRenderer.invoke(getChannel)
        },
        subscribe: (callback: (data: T) => void): (() => void) => {
            return subscribeToChannel(subscribeChannel, callback)
        },
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
        connectionStatus: generateDataHandler<boolean>(
            'mediaPlayer:getConnectionStatus',
            'mediaPlayer:connectionStatus'
        ),
        trackInfo: generateDataHandler<TrackInfo>('mediaPlayer:getTrackInfo', 'mediaPlayer:trackInfo'),
        playbackStatus: generateDataHandler<Status>(
            'mediaPlayer:getPlaybackStatus',
            'mediaPlayer:playbackStatus'
        ),
        position: generateDataHandler<Position>('mediaPlayer:getPosition', 'mediaPlayer:position'),
        actions: {
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
    },
}

export type ElectronApi = typeof electronApi

contextBridge.exposeInMainWorld('api', electronApi)
