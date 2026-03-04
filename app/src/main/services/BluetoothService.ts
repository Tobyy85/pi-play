import * as dbus from 'dbus-next'

/* eslint-disable new-cap */
class BluetoothService {
    private bus: dbus.MessageBus

    constructor() {
        this.bus = dbus.systemBus()
    }

    public async configureProperties() {
        const bluezProxyObject = await this.bus.getProxyObject('org.bluez', '/org/bluez/hci0')
        const properties = bluezProxyObject.getInterface('org.freedesktop.DBus.Properties')

        await properties.Set('org.bluez.Adapter1', 'Alias', new dbus.Variant('s', 'PiPlay'))
        await properties.Set('org.bluez.Adapter1', 'Powered', new dbus.Variant('b', true))
        await properties.Set('org.bluez.Adapter1', 'Discoverable', new dbus.Variant('b', true))
        await properties.Set('org.bluez.Adapter1', 'Pairable', new dbus.Variant('b', true))
    }

    public disconnect() {
        this.bus.disconnect()
    }
}
/* eslint-enable new-cap */
export default BluetoothService
