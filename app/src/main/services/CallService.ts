import type { CallInfo } from '@shared/types/call'
import { BrowserWindow, ipcMain } from 'electron'

import * as dbus from 'dbus-next'

/* eslint-disable new-cap */
class CallService {
    private getWindow: () => BrowserWindow | null

    private bus: dbus.MessageBus
    private ofonoManager: any // eslint-disable-line @typescript-eslint/no-explicit-any
    private voiceCallManager: any // eslint-disable-line @typescript-eslint/no-explicit-any
    private callInterface: any // eslint-disable-line @typescript-eslint/no-explicit-any

    constructor(getWindow: () => BrowserWindow | null) {
        this.getWindow = getWindow
        this.bus = dbus.systemBus()
    }

    public async initialize() {
        try {
            const obj = await this.bus.getProxyObject('org.ofono', '/')
            this.ofonoManager = obj.getInterface('org.ofono.Manager')

            this.ofonoManager.on('ModemAdded', (path: string) => {
                this.setupModem(path)
            })

            // Get existing modems on startup
            const modems = await this.ofonoManager.GetModems()
            if (modems.length > 0) {
                this.setupModem(modems[0][0])
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
        this.bus.disconnect()
    }

    private async setupModem(path: string) {
        const modemObj = await this.bus.getProxyObject('org.ofono', path)
        this.voiceCallManager = modemObj.getInterface('org.ofono.VoiceCallManager')
        if (!this.voiceCallManager) {
            throw new Error('Failed to get VoiceCallManager interface')
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.voiceCallManager.on('CallAdded', async (callPath: string, properties: any) => {
            const callObj = await this.bus.getProxyObject('org.ofono', callPath)
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
