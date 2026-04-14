import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'

import type { ArduinoData } from '@shared/types/arduino'
import type { BluetoothDevice } from '@shared/types/bluetooth'
import type { CallInfo } from '@shared/types/call'
import type { GPSData } from '@shared/types/gps'
import type { MapDownloadRequest } from '@shared/types/maps'
import type { Position, Status, TrackInfo } from '@shared/types/mediaPlayer'
import type { CallHistoryEntry, Contact } from '@shared/types/phoneBook'
import type { Volume } from '@shared/types/systemAudio'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
const subscribeToChannel = <T>(channel: string, callback: (data: T) => void) => {
    const cb = (_event: IpcRendererEvent, data: T): void => {
        callback(data)
    }
    ipcRenderer.on(channel, cb)
    return () => {
        ipcRenderer.off(channel, cb)
    }
}

interface DataHandler<T> {
    get: () => Promise<T>
    subscribe: (callback: (data: T) => void) => () => void
}
const generateDataHandler = <T>(getChannel: string, subscribeChannel: string): DataHandler<T> => {
    return {
        get: async (): Promise<T> => {
            return await ipcRenderer.invoke(getChannel) // eslint-disable-line @typescript-eslint/no-unsafe-return
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
            const handler = (_event: IpcRendererEvent, data: ArduinoData): void => {
                if (data.sensorId === sensorId) {
                    callback(data.value)
                }
            }
            ipcRenderer.on('arduino:change', handler)
            return () => {
                ipcRenderer.off('arduino:change', handler)
            }
        },
        requestSensorValue: async (sensorId: string): Promise<ArduinoData> => {
            return await ipcRenderer.invoke('arduino:requestSensorValue', sensorId) // eslint-disable-line @typescript-eslint/no-unsafe-return
        },
    },
    gps: {
        subscribe: (callback: (gpsData: GPSData) => void): (() => void) => {
            return subscribeToChannel('gps:change', callback)
        },
        getData: async (): Promise<GPSData> => {
            return await ipcRenderer.invoke('gps:getData') // eslint-disable-line @typescript-eslint/no-unsafe-return
        },
        getConnectionStatus: async (): Promise<boolean> => {
            return await ipcRenderer.invoke('gps:getConnectionStatus') // eslint-disable-line @typescript-eslint/no-unsafe-return
        },
    },
    bluetooth: {
        connectedDevice: generateDataHandler<BluetoothDevice>(
            'bluetooth:getConnectedDevice',
            'bluetooth:connectedDevice'
        ),
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
    call: {
        answer: async () => {
            await ipcRenderer.invoke('call:answer')
        },
        hangup: async () => {
            await ipcRenderer.invoke('call:hangup')
        },
        dial: async (phoneNumber: string) => {
            await ipcRenderer.invoke('call:dial', phoneNumber)
        },
        callInfo: generateDataHandler<CallInfo>('call:getCallInfo', 'call:info'),
    },
    phoneBook: {
        contacts: generateDataHandler<Contact[]>('phoneBook:getContacts', 'phoneBook:contacts'),
        connectionStatus: generateDataHandler<boolean>(
            'phoneBook:getConnectionStatus',
            'phoneBook:connectionStatus'
        ),
        callHistory: generateDataHandler<CallHistoryEntry[]>(
            'phoneBook:getCallHistory',
            'phoneBook:callHistory'
        ),
        loadingContacts: generateDataHandler<boolean>(
            'phoneBook:getLoadingContacts',
            'phoneBook:loadingContacts'
        ),
        loadingCallHistory: generateDataHandler<boolean>(
            'phoneBook:getLoadingCallHistory',
            'phoneBook:loadingCallHistory'
        ),
    },
    camera: {
        getLatestFrame: async (cameraName: string): Promise<string | null> => {
            return await ipcRenderer.invoke('camera:getLatestFrame', cameraName) // eslint-disable-line @typescript-eslint/no-unsafe-return
        },
        subscribeToFrame: (cameraName: string, callback: (frameDataUrl: string) => void): (() => void) => {
            return subscribeToChannel(`camera:frame:${cameraName}`, callback)
        },
    },
    maps: {
        downloadArea: async (request: MapDownloadRequest) => {
            await ipcRenderer.invoke('maps:downloadArea', request)
        },
    },
    systemAudio: {
        volume: generateDataHandler<Volume>('systemAudio:getVolume', 'systemAudio:volume'),
    },
}

export type ElectronApi = typeof electronApi

contextBridge.exposeInMainWorld('api', electronApi)
