import { BrowserWindow, ipcMain } from 'electron'
import { readFileSync, unlinkSync } from 'fs'

import * as dbus from 'dbus-next'
import { parseVCards } from 'vcard4-ts'

import type { CallHistoryEntry, Contact } from '@shared/types/phoneBook'
import { formatPhoneNumber, normalizePhoneNumber } from '@shared/utils/phoneBook'

/* eslint-disable new-cap */
class PhoneBookService {
    private getWindow: () => BrowserWindow | null
    private connectionStatus: boolean = false

    private sessionBus: dbus.MessageBus
    private systemBus: dbus.MessageBus
    private sessionPath: string | null = null
    private watchedDevicePaths = new Set<string>()

    private contacts: Contact[] | null = null
    private loadingContacts: boolean = false
    private callHistory: CallHistoryEntry[] | null = null
    private loadingCallHistory: boolean = false

    constructor(getWindow: () => BrowserWindow | null) {
        this.getWindow = getWindow
        this.sessionBus = dbus.sessionBus()
        this.systemBus = dbus.systemBus()
    }

    public async initialize() {
        try {
            const deviceAddress = await this.getDeviceAddress()
            if (!deviceAddress) {
                this.updateConnectionStatus(false)
                this.updateContacts(null)
                this.updateCallHistory(null)
                return
            }

            this.sessionPath = await this.createSession(deviceAddress)

            this.updateLoadingContacts(true)
            this.updateLoadingCallHistory(true)
            await this.pullContacts()
            await this.pullHistory()
        } catch (err) {
            console.error('Failed to initialize PhoneBookService:', err)
        } finally {
            await this.removeSession()
        }
    }

    public async reload() {
        await this.initialize()
    }

    public registerIpcHandlers() {
        ipcMain.handle('phoneBook:getContacts', () => {
            return this.contacts
        })
        ipcMain.handle('phoneBook:getCallHistory', () => {
            return this.callHistory
        })
        ipcMain.handle('phoneBook:getConnectionStatus', () => {
            return this.connectionStatus
        })
        ipcMain.handle('phoneBook:getLoadingContacts', () => {
            return this.loadingContacts
        })
        ipcMain.handle('phoneBook:getLoadingCallHistory', () => {
            return this.loadingCallHistory
        })
    }

    public async disconnect() {
        await this.removeSession()
        this.sessionBus.disconnect()
        this.systemBus.disconnect()
    }

    private async pullContacts() {
        this.updateLoadingContacts(true)
        if (!this.sessionPath) throw new Error('No OBEX session established')

        const sessionObj = await this.sessionBus.getProxyObject('org.bluez.obex', this.sessionPath)
        const pbap = sessionObj.getInterface('org.bluez.obex.PhonebookAccess1')

        await pbap.Select('int', 'pb')

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [transferPath, properties]: [string, Record<string, any>] = await pbap.PullAll('', {})
        const filename: string = properties.Filename?.value

        if (!filename) {
            this.updateLoadingContacts(false)
            throw new Error('No filename in transfer properties')
        }
        await this.waitForTransferComplete(transferPath)

        const vcardData = readFileSync(filename, 'utf-8')
        const contacts = this.parseContactsVCards(vcardData)

        this.updateContacts(contacts)
        this.updateLoadingContacts(false)

        try {
            unlinkSync(filename)
        } catch (err) {
            console.error('Failed to remove temporary file:', err)
        }
    }

    private async pullHistory() {
        if (!this.sessionPath) throw new Error('No OBEX session established')
        this.updateLoadingCallHistory(true)

        const sessionObj = await this.sessionBus.getProxyObject('org.bluez.obex', this.sessionPath)
        const pbap = sessionObj.getInterface('org.bluez.obex.PhonebookAccess1')

        await pbap.Select('int', 'cch')

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [transferPath, properties]: [string, Record<string, any>] = await pbap.PullAll('', {})
        const filename: string = properties.Filename?.value

        if (!filename) {
            this.updateLoadingCallHistory(false)
            throw new Error('No filename in transfer properties')
        }
        await this.waitForTransferComplete(transferPath)

        const vcardData = readFileSync(filename, 'utf-8')
        const history = this.parseHistoryVCards(vcardData)

        this.updateCallHistory(history)
        this.updateLoadingCallHistory(false)
        try {
            unlinkSync(filename)
        } catch (err) {
            console.error('Failed to remove temporary file:', err)
        }
    }

    // eslint-disable-next-line class-methods-use-this
    private parseContactsVCards(vCardsData: string): Contact[] {
        const cards = parseVCards(vCardsData)

        if (!cards.vCards || cards.vCards.length === 0) {
            console.warn('No vCard objects found in data')
            return []
        }

        return cards.vCards
            .filter(card => Boolean(card.TEL?.[0]?.value))
            .map(card => {
                const name = card.FN[0]?.value
                const phoneNumber = card.TEL?.[0]?.value
                const photo = card.PHOTO?.[0]?.value
                return {
                    name: (name || formatPhoneNumber(phoneNumber ?? '')) ?? 'Unknown',
                    phoneNumber: normalizePhoneNumber(phoneNumber ?? ''),
                    photo: photo ?? undefined, // eslint-disable-line no-undefined
                }
            })
    }

    // eslint-disable-next-line class-methods-use-this
    private parseHistoryVCards(vCardsData: string): CallHistoryEntry[] {
        const cards = parseVCards(vCardsData)

        if (!cards.vCards || cards.vCards.length === 0) {
            console.warn('No vCard objects found in data')
            return []
        }

        return cards.vCards.map(card => {
            const name = card.FN[0]?.value
            const phoneNumber = card.TEL?.[0]?.value
            const irmcCallDateTime = card.unparseable?.find(line => line.startsWith('X-IRMC-CALL-DATETIME'))
            const extractedCallDateTime = irmcCallDateTime?.split(';')[1] ?? ''
            const [type, time] = extractedCallDateTime.split(':') as [CallHistoryEntry['type'], string]

            return {
                name: (name || formatPhoneNumber(phoneNumber ?? '')) ?? 'Unknown',
                phoneNumber: normalizePhoneNumber(phoneNumber ?? ''),
                dateTime: time,
                type,
            }
        })
    }

    private async waitForTransferComplete(transferPath: string): Promise<void> {
        const transferObj = await this.sessionBus.getProxyObject('org.bluez.obex', transferPath)
        const transferProps = transferObj.getInterface('org.freedesktop.DBus.Properties')

        return new Promise((resolve, reject) => {
            const TIMEOUT_DELAY = 30
            const timeout = setTimeout(() => {
                reject(new Error(`Transfer timeout after ${TIMEOUT_DELAY}s`))
            }, TIMEOUT_DELAY * 1000)

            const handleStatusUpdate = (status: string) => {
                if (status === 'complete') {
                    clearTimeout(timeout)
                    resolve()
                } else if (status === 'error') {
                    clearTimeout(timeout)
                    reject(new Error('Transfer failed'))
                }
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transferProps.Get('org.bluez.obex.Transfer1', 'Status').then((status: any) => {
                handleStatusUpdate(status?.value ?? status)
            })

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transferProps.on('PropertiesChanged', (_iface: string, changed: any) => {
                handleStatusUpdate(changed.Status?.value)
            })
        })
    }

    private async createSession(deviceAddress: string) {
        const client = await this.sessionBus.getProxyObject('org.bluez.obex', '/org/bluez/obex')
        const obexClient = client.getInterface('org.bluez.obex.Client1')

        const sessionPath: string = await obexClient.CreateSession(deviceAddress, {
            Target: new dbus.Variant('s', 'pbap'),
        })

        return sessionPath
    }

    private async removeSession() {
        if (!this.sessionPath) return

        try {
            const client = await this.sessionBus.getProxyObject('org.bluez.obex', '/org/bluez/obex')
            const obexClient = client.getInterface('org.bluez.obex.Client1')
            await obexClient.RemoveSession(this.sessionPath)
        } catch (err) {
            console.error('Failed to remove OBEX session:', err)
        } finally {
            this.sessionPath = null
        }
    }

    private async getDeviceAddress(): Promise<string | null> {
        const bluez = await this.systemBus.getProxyObject('org.bluez', '/')
        const objManager = bluez.getInterface('org.freedesktop.DBus.ObjectManager')
        const managedObjects = await objManager.GetManagedObjects()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const [path, interfaces] of Object.entries(managedObjects) as [string, Record<string, any>][]) {
            const deviceProps = interfaces['org.bluez.Device1']

            if (deviceProps) {
                const isConnected = deviceProps.Connected.value
                const address = deviceProps.Address.value
                const uuids = deviceProps.UUIDs?.value || []

                // check if contains PBAP UUID (0000112f-0000-1000-8000-00805f9b34fb)
                const supportsPBAP = uuids.some((uuid: string) => uuid.toLowerCase().includes('112f'))

                if (supportsPBAP) {
                    this.updateConnectionStatus(isConnected)
                    await this.watchDeviceConnection(path)
                    if (isConnected) {
                        return address
                    }
                }
            }
        }

        this.updateConnectionStatus(false)
        return null
    }

    private async watchDeviceConnection(devicePath: string) {
        if (this.watchedDevicePaths.has(devicePath)) {
            return
        }

        this.watchedDevicePaths.add(devicePath)

        const deviceObj = await this.systemBus.getProxyObject('org.bluez', devicePath)
        const propertiesInterface = deviceObj.getInterface('org.freedesktop.DBus.Properties')

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        propertiesInterface.on('PropertiesChanged', async (iface: string, changed: any) => {
            if (iface === 'org.bluez.Device1' && 'Connected' in changed) {
                const isConnected = changed.Connected.value
                if (isConnected) {
                    this.updateConnectionStatus(true)
                    await this.initialize()
                } else {
                    this.updateConnectionStatus(false)
                    this.updateContacts(null)
                    this.updateCallHistory(null)
                }
            }
        })
    }

    private updateConnectionStatus(isConnected: boolean) {
        this.connectionStatus = isConnected
        this.getWindow()?.webContents.send('phoneBook:connectionStatus', isConnected)
    }

    private updateContacts(contacts: Contact[] | null) {
        this.contacts = contacts
        this.getWindow()?.webContents.send('phoneBook:contacts', contacts)
    }

    private updateCallHistory(callHistory: CallHistoryEntry[] | null) {
        this.callHistory = callHistory
        this.getWindow()?.webContents.send('phoneBook:callHistory', callHistory)
    }

    private updateLoadingContacts(isLoading: boolean) {
        if (this.loadingContacts === isLoading) return
        this.loadingContacts = isLoading
        this.getWindow()?.webContents.send('phoneBook:loadingContacts', isLoading)
    }

    private updateLoadingCallHistory(isLoading: boolean) {
        if (this.loadingCallHistory === isLoading) return
        this.loadingCallHistory = isLoading
        this.getWindow()?.webContents.send('phoneBook:loadingCallHistory', isLoading)
    }
}
/* eslint-enable new-cap */

export default PhoneBookService
