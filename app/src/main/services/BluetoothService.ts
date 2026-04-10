import { ipcMain, type BrowserWindow } from 'electron'

import * as dbus from 'dbus-next'

import type { BluetoothDevice } from '@shared/types/bluetooth'

type ConnectedDeviceListener = (
    connectedDevice: BluetoothDevice | null,
    previousDevice: BluetoothDevice | null
) => void | Promise<void>

/* eslint-disable new-cap, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
class BluetoothService {
    private readonly getWindow: () => BrowserWindow | null

    private readonly systemBus: dbus.MessageBus
    private objectManager: dbus.ClientInterface | null = null

    private connectedDevice: BluetoothDevice | null = null
    private readonly watchedDevicePaths: Set<string> = new Set()
    private readonly deviceChangeListeners: Set<ConnectedDeviceListener> = new Set()

    constructor(getWindow: () => BrowserWindow | null) {
        this.getWindow = getWindow
        this.systemBus = dbus.systemBus()
    }

    public async initialize(): Promise<void> {
        await this.configureProperties()

        const bluezProxyObject = await this.systemBus.getProxyObject('org.bluez', '/')
        this.objectManager = bluezProxyObject.getInterface('org.freedesktop.DBus.ObjectManager')

        this.updateConnectedDevice(await this.getConnectedDevice())
        await this.watchConnectedDevices()
    }

    public registerIpcHandlers(): void {
        ipcMain.handle('bluetooth:getConnectedDevice', () => {
            return this.connectedDevice
        })
    }

    public onConnectedDeviceChanged(listener: ConnectedDeviceListener) {
        this.deviceChangeListeners.add(listener)

        return () => {
            this.deviceChangeListeners.delete(listener)
        }
    }

    public async configureProperties(): Promise<void> {
        const bluezProxyObject = await this.systemBus.getProxyObject('org.bluez', '/org/bluez/hci0')
        const properties = bluezProxyObject.getInterface('org.freedesktop.DBus.Properties')

        await properties.Set('org.bluez.Adapter1', 'Alias', new dbus.Variant('s', 'PiPlay'))
        await properties.Set('org.bluez.Adapter1', 'Powered', new dbus.Variant('b', true))
        await properties.Set('org.bluez.Adapter1', 'Discoverable', new dbus.Variant('b', true))
        await properties.Set('org.bluez.Adapter1', 'Pairable', new dbus.Variant('b', true))
    }

    public disconnect(): void {
        this.systemBus.disconnect()
    }

    private async getConnectedDevice(): Promise<BluetoothDevice | null> {
        if (!this.objectManager) {
            console.error('[BluetoothService]: ObjectManager not initialized')
            return null
        }

        const managedObjects = await this.objectManager.GetManagedObjects()

        for (const [path, interfaces] of Object.entries(managedObjects)) {
            // @ts-expect-error - The type of 'interfaces' is not well-defined, so we disable type checking here
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

    private async watchConnectedDevices(): Promise<void> {
        if (!this.objectManager) {
            console.error('[BluetoothService]: ObjectManager not initialized')
            return
        }
        const managedObjects = await this.objectManager.GetManagedObjects()

        const watchDevice = async (path: string): Promise<void> => {
            if (this.watchedDevicePaths.has(path)) {
                return
            }
            this.watchedDevicePaths.add(path)

            const deviceProxyObject = await this.systemBus.getProxyObject('org.bluez', path)
            const deviceProperties = deviceProxyObject.getInterface('org.freedesktop.DBus.Properties')

            deviceProperties.on('PropertiesChanged', (iface: string) => {
                if (iface === 'org.bluez.Device1') {
                    void (async () => {
                        this.updateConnectedDevice(await this.getConnectedDevice())
                    })()
                }
            })
        }

        for (const [path, interfaces] of Object.entries(managedObjects)) {
            // @ts-expect-error - The type of 'interfaces' is not well-defined, so we disable type checking here
            if (interfaces['org.bluez.Device1']) {
                await watchDevice(path)
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.objectManager.on('InterfacesAdded', (path: string, interfaces: any) => {
            if (interfaces['org.bluez.Device1']) {
                void (async () => {
                    await watchDevice(path)
                    this.updateConnectedDevice(await this.getConnectedDevice())
                })()
            }
        })

        this.objectManager.on('InterfacesRemoved', (_path: string, interfaces: string[]) => {
            if (interfaces.includes('org.bluez.Device1')) {
                void (async () => {
                    this.updateConnectedDevice(await this.getConnectedDevice())
                })()
            }
        })
    }

    private updateConnectedDevice(connectedDevice: BluetoothDevice | null): void {
        const previousDevice = this.connectedDevice
        if (BluetoothService.areDevicesEqual(previousDevice, connectedDevice)) {
            return
        }

        this.connectedDevice = connectedDevice
        this.getWindow()?.webContents.send('bluetooth:connectedDevice', connectedDevice)
        this.notifyConnectedDeviceChanged(connectedDevice, previousDevice).catch((err: unknown) => {
            console.error('[BluetoothService]: Failed to notify connected device change: ', err, '\n\n')
        })
    }

    private async notifyConnectedDeviceChanged(
        connectedDevice: BluetoothDevice | null,
        previousDevice: BluetoothDevice | null
    ): Promise<void> {
        for (const listener of this.deviceChangeListeners) {
            try {
                await listener(connectedDevice, previousDevice)
            } catch (err) {
                console.error('[BluetoothService]: Bluetooth device change listener failed: ', err, '\n\n')
            }
        }
    }

    private static areDevicesEqual(
        deviceA: BluetoothDevice | null,
        deviceB: BluetoothDevice | null
    ): boolean {
        if (!deviceA || !deviceB) {
            return false
        }

        return (
            deviceA.path === deviceB.path &&
            deviceA.address === deviceB.address &&
            deviceA.name === deviceB.name
        )
    }
}
export default BluetoothService
