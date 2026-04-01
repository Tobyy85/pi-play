import type { CallInfo } from '@shared/types/call'
import { ipcMain, type BrowserWindow } from 'electron'

import * as dbus from 'dbus-next'

/* eslint-disable new-cap, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
class CallService {
    private readonly getWindow: () => BrowserWindow | null

    private readonly systemBus: dbus.MessageBus
    private ofonoManager: any // eslint-disable-line @typescript-eslint/no-explicit-any
    private voiceCallManager: any // eslint-disable-line @typescript-eslint/no-explicit-any
    private callInterface: any // eslint-disable-line @typescript-eslint/no-explicit-any

    private isInitialized = false
    private readonly watchedModemPaths: Set<string> = new Set()

    constructor(getWindow: () => BrowserWindow | null) {
        this.getWindow = getWindow
        this.systemBus = dbus.systemBus()
    }

    public async initialize(): Promise<void> {
        try {
            if (!this.ofonoManager) {
                const obj = await this.systemBus.getProxyObject('org.ofono', '/')
                this.ofonoManager = obj.getInterface('org.ofono.Manager')
            }

            if (!this.isInitialized) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.ofonoManager.on('ModemAdded', (path: string, properties: any) => {
                    this.handleModem(path, properties).catch((err: unknown) => {
                        console.error('Failed to handle added modem:', err)
                    })
                })
                this.isInitialized = true
            }

            await this.reload()
        } catch (err) {
            console.error('Failed to initialize CallService:', err)
        }
    }

    public async reload(): Promise<void> {
        if (!this.ofonoManager) {
            return
        }

        try {
            const modems = await this.ofonoManager.GetModems()

            if (!modems?.length) {
                this.voiceCallManager = undefined // eslint-disable-line no-undefined
                this.callInterface = undefined // eslint-disable-line no-undefined
                this.getWindow()?.webContents.send('call:info', CallService.createDisconnectedCallInfo())
                return
            }

            for (const [path, properties] of modems) {
                await this.handleModem(path, properties)
            }
        } catch (err) {
            console.error('Failed to reload CallService:', err)
        }
    }

    public registerIpcHandlers(): void {
        ipcMain.handle('call:getCallInfo', async () => {
            const properties = await this.callInterface?.GetProperties()
            const callInfo: CallInfo = properties
                ? CallService.extractCallInfo(properties)
                : CallService.createDisconnectedCallInfo()
            return callInfo
        })
        ipcMain.handle('call:answer', async () => {
            await this.callInterface?.Answer()
            const properties = await this.callInterface?.GetProperties()
            this.getWindow()?.webContents.send('call:info', CallService.extractCallInfo(properties))
        })
        ipcMain.handle('call:hangup', async () => {
            await this.callInterface?.Hangup()
        })
        ipcMain.handle('call:dial', async (event, phoneNumber: string) => {
            await this.voiceCallManager?.Dial(phoneNumber, 'default')
        })
    }

    public disconnect(): void {
        this.systemBus.disconnect()
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async handleModem(path: string, properties: any): Promise<void> {
        await this.watchModemProperties(path)
        const isOnline = properties?.Online?.value
        const hasVoiceCallManager = properties?.Interfaces?.value?.includes('org.ofono.VoiceCallManager')

        if (isOnline || hasVoiceCallManager) {
            await this.setupModem(path)
        }
    }

    private async setupModem(path: string): Promise<void> {
        const modemObj = await this.systemBus.getProxyObject('org.ofono', path)
        this.voiceCallManager = modemObj.getInterface('org.ofono.VoiceCallManager')
        if (!this.voiceCallManager) {
            throw new Error('Failed to get VoiceCallManager interface')
        }

        await Promise.all([
            this.voiceCallManager?.removeAllListeners('CallAdded'),
            this.voiceCallManager?.removeAllListeners('CallRemoved'),
            this.callInterface?.removeAllListeners('PropertyChanged'),
        ])

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.voiceCallManager.on('CallAdded', async (callPath: string, properties: any) => {
            const callObj = await this.systemBus.getProxyObject('org.ofono', callPath)
            this.callInterface = callObj.getInterface('org.ofono.VoiceCall')

            const callInfo = CallService.extractCallInfo(properties)
            this.getWindow()?.webContents.send('call:info', callInfo)

            this.listenToCallPropertyChanges()
        })

        this.voiceCallManager.on('CallRemoved', () => {
            this.callInterface = undefined // eslint-disable-line no-undefined
            this.getWindow()?.webContents.send('call:info', CallService.createDisconnectedCallInfo())
        })
    }

    private async watchModemProperties(path: string): Promise<void> {
        if (this.watchedModemPaths.has(path)) {
            return
        }
        this.watchedModemPaths.add(path)

        const modemObj = await this.systemBus.getProxyObject('org.ofono', path)
        try {
            const modemInterface = modemObj.getInterface('org.ofono.Modem')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            modemInterface.on('PropertyChanged', (property: string, value: any) => {
                void (async () => {
                    await this.handleModemPropertyChanged(path, { [property]: value })
                })()
            })
        } catch (err) {
            console.warn(`org.ofono.Modem signal watcher unavailable on ${path}:`, err)
        }

        try {
            const propertiesInterface = modemObj.getInterface('org.freedesktop.DBus.Properties')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            propertiesInterface.on('PropertiesChanged', (iface: string, changed: any) => {
                if (iface !== 'org.ofono.Modem') {
                    return
                }

                void (async () => {
                    await this.handleModemPropertyChanged(path, changed)
                })()
            })
        } catch (err) {
            console.warn(`No modem property watcher available for ${path}:`, err)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async handleModemPropertyChanged(path: string, changed: any): Promise<void> {
        const isOnline = changed?.Online?.value
        const hasVoiceCallManager = changed?.Interfaces?.value?.includes('org.ofono.VoiceCallManager')

        if (isOnline || hasVoiceCallManager) {
            await this.setupModem(path)
        }
    }

    private listenToCallPropertyChanges(): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.callInterface.on('PropertyChanged', async (property: string, value: any) => {
            let callInfo: CallInfo
            if (property === 'State' && value.value === 'disconnected') {
                callInfo = CallService.createDisconnectedCallInfo()
            } else {
                const properties = await this.callInterface.GetProperties()
                callInfo = CallService.extractCallInfo(properties)
            }
            this.getWindow()?.webContents.send('call:info', callInfo)
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static extractCallInfo(data: any): CallInfo {
        return {
            state: data?.State?.value,
            lineIdentification: data?.LineIdentification?.value,
            startTime: data?.StartTime ? data.StartTime.value : undefined, //eslint-disable-line no-undefined
        }
    }

    private static createDisconnectedCallInfo(): CallInfo {
        return {
            state: 'disconnected',
            lineIdentification: undefined, // eslint-disable-line no-undefined
            startTime: undefined, // eslint-disable-line no-undefined
        }
    }
}

export default CallService
