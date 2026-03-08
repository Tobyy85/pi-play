import { BrowserWindow, ipcMain } from 'electron'
import { readFileSync, unlinkSync } from 'fs'

import * as dbus from 'dbus-next'
import { parseVCards } from 'vcard4-ts'

import type { Contact } from '@shared/types/phoneBook'
import { formatPhoneNumber, normalizePhoneNumber } from '@shared/utils/phoneBook'

/* eslint-disable new-cap */
class PhoneBookService {
    private getWindow: () => BrowserWindow | null
    private connectionStatus: boolean = false

    private sessionBus: dbus.MessageBus
    private systemBus: dbus.MessageBus
    private sessionPath: string | null = null

    private contacts: Contact[] | null = null

    constructor(getWindow: () => BrowserWindow | null) {
        this.getWindow = getWindow
        this.sessionBus = dbus.sessionBus()
        this.systemBus = dbus.systemBus()
    }

    public async initialize() {
        try {
            const deviceAddress = await this.getDeviceAddress()
            if (!deviceAddress) {
                return
            }

            this.sessionPath = await this.createSession(deviceAddress)
            await this.pullContacts()
        } catch (err) {
            console.error('Failed to initialize PhoneBookService:', err)
        } finally {
            this.removeSession()
        }
    }

    public registerIpcHandlers() {
        ipcMain.handle('phoneBook:getContacts', () => {
            return this.contacts
        })
        ipcMain.handle('phoneBook:getConnectionStatus', () => {
            return this.connectionStatus
        })
    }

    public async disconnect() {
        await this.removeSession()
        this.sessionBus.disconnect()
        this.systemBus.disconnect()
    }

    private async pullContacts() {
        if (!this.sessionPath) throw new Error('No OBEX session established')

        const sessionObj = await this.sessionBus.getProxyObject('org.bluez.obex', this.sessionPath)
        const pbap = sessionObj.getInterface('org.bluez.obex.PhonebookAccess1')

        await pbap.Select('int', 'pb')

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [transferPath, properties]: [string, Record<string, any>] = await pbap.PullAll('', {})
        const filename: string = properties.Filename?.value

        if (!filename) throw new Error('No filename in transfer properties')
        await this.waitForTransferComplete(transferPath)

        const vcardData = readFileSync(filename, 'utf-8')
        const contacts = this.parseVCards(vcardData)

        this.updateContacts(contacts)

        try {
            unlinkSync(filename)
        } catch (err) {
            console.error('Failed to remove temporary file:', err)
        }
    }

    // eslint-disable-next-line class-methods-use-this
    private parseVCards(vCardsData: string): Contact[] {
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
        const deviceObj = await this.systemBus.getProxyObject('org.bluez', devicePath)
        const propertiesInterface = deviceObj.getInterface('org.freedesktop.DBus.Properties')

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        propertiesInterface.on('PropertiesChanged', async (iface: string, changed: any) => {
            if (iface === 'org.bluez.Device1' && 'Connected' in changed) {
                const isConnected = changed.Connected.value
                if (isConnected) {
                    await this.initialize()
                } else {
                    this.updateConnectionStatus(false)
                    this.updateContacts(null)
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
}
/* eslint-enable new-cap */

export default PhoneBookService
