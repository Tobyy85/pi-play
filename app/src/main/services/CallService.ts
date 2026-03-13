import type { CallInfo } from '@shared/types/call'
import { BrowserWindow, ipcMain } from 'electron'

import * as dbus from 'dbus-next'

/* eslint-disable new-cap */
class CallService {
    private getWindow: () => BrowserWindow | null

    private systemBus: dbus.MessageBus
    private ofonoManager: any // eslint-disable-line @typescript-eslint/no-explicit-any
    private voiceCallManager: any // eslint-disable-line @typescript-eslint/no-explicit-any
    private callInterface: any // eslint-disable-line @typescript-eslint/no-explicit-any

    constructor(getWindow: () => BrowserWindow | null) {
        this.getWindow = getWindow
        this.systemBus = dbus.systemBus()
    }

    public async initialize() {
        try {
            const obj = await this.systemBus.getProxyObject('org.ofono', '/')
            this.ofonoManager = obj.getInterface('org.ofono.Manager')

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.ofonoManager.on('ModemAdded', (path: string, properties: any) => {
                this.handleModem(path, properties)
            })

            // Get existing modems on startup
            const modems = await this.ofonoManager.GetModems()
            for (const [path, properties] of modems) {
                await this.handleModem(path, properties)
            }
        } catch (err) {
            console.error('Failed to initialize CallService:', err)
        }
    }

    public registerIpcHandlers() {
        ipcMain.handle('call:getCallInfo', async () => {
            const properties = await this.callInterface?.GetProperties()
            const callInfo: CallInfo = properties
                ? this.extractCallInfo(properties)
                : this.createDisconnectedCallInfo()
            return callInfo
        })
        ipcMain.handle('call:answer', async () => {
            await this.callInterface?.Answer()
            const properties = await this.callInterface?.GetProperties()
            this.getWindow()?.webContents.send('call:info', this.extractCallInfo(properties))
        })
        ipcMain.handle('call:hangup', async () => {
            await this.callInterface?.Hangup()
        })
        ipcMain.handle('call:dial', async (event, phoneNumber: string) => {
            await this.voiceCallManager?.Dial(phoneNumber, 'default')
        })
    }

    public disconnect() {
        this.systemBus.disconnect()
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async handleModem(path: string, properties: any) {
        await this.watchModemProperties(path)
        const isOnline = properties?.Online?.value
        const hasVoiceCallManager = properties?.Interfaces?.value?.includes('org.ofono.VoiceCallManager')

        if (isOnline || hasVoiceCallManager) {
            await this.setupModem(path)
        }
    }

    private async setupModem(path: string) {
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

            const callInfo = this.extractCallInfo(properties)
            this.getWindow()?.webContents.send('call:info', callInfo)

            this.listenToCallPropertyChanges()
        })

        this.voiceCallManager.on('CallRemoved', () => {
            this.callInterface = undefined // eslint-disable-line no-undefined
            this.getWindow()?.webContents.send('call:info', this.createDisconnectedCallInfo())
        })
    }

    private async watchModemProperties(path: string) {
        const modemObj = await this.systemBus.getProxyObject('org.ofono', path)
        try {
            const modemInterface = modemObj.getInterface('org.ofono.Modem')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            modemInterface.on('PropertyChanged', async (property: string, value: any) => {
                await this.handleModemPropertyChanged(path, { [property]: value })
            })
        } catch (err) {
            console.warn(`org.ofono.Modem signal watcher unavailable on ${path}:`, err)
        }

        try {
            const propertiesInterface = modemObj.getInterface('org.freedesktop.DBus.Properties')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            propertiesInterface.on('PropertiesChanged', async (iface: string, changed: any) => {
                if (iface !== 'org.ofono.Modem') {
                    return
                }

                await this.handleModemPropertyChanged(path, changed)
            })
        } catch (err) {
            console.warn(`No modem property watcher available for ${path}:`, err)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async handleModemPropertyChanged(path: string, changed: any) {
        const isOnline = changed?.Online?.value
        const hasVoiceCallManager = changed?.Interfaces?.value?.includes('org.ofono.VoiceCallManager')

        if (isOnline || hasVoiceCallManager) {
            await this.setupModem(path)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, class-methods-use-this
    private extractCallInfo(data: any): CallInfo {
        return {
            state: data?.State?.value,
            lineIdentification: data?.LineIdentification?.value,
            startTime: data?.StartTime ? data.StartTime.value : undefined, //eslint-disable-line no-undefined
        }
    }

    // eslint-disable-next-line class-methods-use-this
    private createDisconnectedCallInfo(): CallInfo {
        return {
            state: 'disconnected',
            lineIdentification: undefined, // eslint-disable-line no-undefined
            startTime: undefined, // eslint-disable-line no-undefined
        }
    }

    private listenToCallPropertyChanges() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.callInterface.on('PropertyChanged', async (property: string, value: any) => {
            let callInfo: CallInfo
            if (property === 'State' && value.value === 'disconnected') {
                callInfo = this.createDisconnectedCallInfo()
            } else {
                const properties = await this.callInterface.GetProperties()
                callInfo = this.extractCallInfo(properties)
            }
            this.getWindow()?.webContents.send('call:info', callInfo)
        })
    }
}
/* eslint-enable new-cap */

export default CallService
