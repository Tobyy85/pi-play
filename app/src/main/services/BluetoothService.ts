import { BrowserWindow, ipcMain } from 'electron'

import * as dbus from 'dbus-next'

import type { BluetoothDevice } from '@shared/types/bluetooth'

/* eslint-disable new-cap */
class BluetoothService {
    private getWindow: () => BrowserWindow | null

    private systemBus: dbus.MessageBus
    private objectManager: dbus.ClientInterface | null = null

    private connectedDevice: BluetoothDevice | null = null
    private watchedDevicePaths = new Set<string>()

    constructor(getWindow: () => BrowserWindow | null) {
        this.getWindow = getWindow
        this.systemBus = dbus.systemBus()
    }

    public async initialize() {
        await this.configureProperties()

        const bluezProxyObject = await this.systemBus.getProxyObject('org.bluez', '/')
        this.objectManager = bluezProxyObject.getInterface('org.freedesktop.DBus.ObjectManager')

        this.updateConnectedDevice(await this.getConnectedDevice())
        await this.watchConnectedDevices()
    }

    public registerIpcHandlers() {
        ipcMain.handle('bluetooth:getConnectedDevice', () => {
            return this.connectedDevice
        })
    }

    public async configureProperties() {
        const bluezProxyObject = await this.systemBus.getProxyObject('org.bluez', '/org/bluez/hci0')
        const properties = bluezProxyObject.getInterface('org.freedesktop.DBus.Properties')

        await properties.Set('org.bluez.Adapter1', 'Alias', new dbus.Variant('s', 'PiPlay'))
        await properties.Set('org.bluez.Adapter1', 'Powered', new dbus.Variant('b', true))
        await properties.Set('org.bluez.Adapter1', 'Discoverable', new dbus.Variant('b', true))
        await properties.Set('org.bluez.Adapter1', 'Pairable', new dbus.Variant('b', true))
    }

    public disconnect() {
        this.systemBus.disconnect()
    }

    private async getConnectedDevice(): Promise<BluetoothDevice | null> {
        if (!this.objectManager) {
            console.error('ObjectManager not initialized')
            return null
        }

        const managedObjects = await this.objectManager.GetManagedObjects()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const [path, interfaces] of Object.entries(managedObjects) as [string, any][]) {
            const deviceProps = interfaces['org.bluez.Device1']
            if (deviceProps?.Connected?.value) {
                return {
                    path,
                    name: deviceProps.Name?.value ?? '',
                    address: deviceProps.Address?.value ?? '',
                }
            }
        }

        return null
    }

    private async watchConnectedDevices() {
        if (!this.objectManager) {
            console.error('ObjectManager not initialized')
            return null
        }
        const managedObjects = await this.objectManager.GetManagedObjects()

        const watchDevice = async (path: string) => {
            if (this.watchedDevicePaths.has(path)) {
                return
            }
            this.watchedDevicePaths.add(path)

            const deviceProxyObject = await this.systemBus.getProxyObject('org.bluez', path)
            const deviceProperties = deviceProxyObject.getInterface('org.freedesktop.DBus.Properties')

            deviceProperties.on('PropertiesChanged', async (iface: string) => {
                if (iface === 'org.bluez.Device1') {
                    this.updateConnectedDevice(await this.getConnectedDevice())
                }
            })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const [path, interfaces] of Object.entries(managedObjects) as [string, any][]) {
            if (interfaces['org.bluez.Device1']) {
                await watchDevice(path)
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.objectManager.on('InterfacesAdded', async (path: string, interfaces: any) => {
            if (interfaces['org.bluez.Device1']) {
                await watchDevice(path)
                this.updateConnectedDevice(await this.getConnectedDevice())
            }
        })

        this.objectManager.on('InterfacesRemoved', async (_path: string, interfaces: string[]) => {
            if (interfaces.includes('org.bluez.Device1')) {
                this.updateConnectedDevice(await this.getConnectedDevice())
            }
        })
    }

    private updateConnectedDevice(connectedDevice: BluetoothDevice | null) {
        this.connectedDevice = connectedDevice
        this.getWindow()?.webContents.send('bluetooth:connectedDevice', connectedDevice)
    }
}
/* eslint-enable new-cap */
export default BluetoothService
