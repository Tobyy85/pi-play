import { BrowserWindow, ipcMain } from 'electron'

import * as dbus from 'dbus-next'

/* eslint-disable new-cap */
class MediaPlayerService {
    private getWindow: () => BrowserWindow | null
    private bus: dbus.MessageBus
    private objects: any // eslint-disable-line @typescript-eslint/no-explicit-any
    private mediaPlayerProps: dbus.ClientInterface | null = null
    private mediaPlayerInterface: any = null // eslint-disable-line @typescript-eslint/no-explicit-any

    constructor(getWindow: () => BrowserWindow | null) {
        this.getWindow = getWindow
        this.bus = dbus.systemBus()
    }

    public async initialize() {
        this.configureProperties()

        const bluez = await this.bus.getProxyObject('org.bluez', '/')
        const objManager = bluez.getInterface('org.freedesktop.DBus.ObjectManager')
        this.objects = await objManager.GetManagedObjects()

        if (!this.isAnyDeviceConnected()) {
            console.warn('Žádné zařízení není připojeno. Čekám na připojení...')
            return
        }

        for (const path in this.objects) {
            if (this.objects[path]['org.bluez.MediaPlayer1']) {
                this.mediaPlayerHandler(path)
            }
        }
    }

    public registerIpcHandlers() {
        ipcMain.handle('mediaPlayer:getTrackInfo', async () => {
            const track = await this.mediaPlayerProps?.Get('org.bluez.MediaPlayer1', 'Track')
            return {
                title: track?.value?.Title?.value ?? null,
                artist: track?.value?.Artist?.value ?? null,
                album: track?.value?.Album?.value ?? null,
                duration: track?.value?.Duration?.value ?? null,
            }
        })

        ipcMain.handle('mediaPlayer:getPlaybackStatus', async () => {
            return (await this.mediaPlayerProps?.Get('org.bluez.MediaPlayer1', 'Status'))?.value ?? null
        })

        ipcMain.handle('mediaPlayer:getPosition', async () => {
            return (await this.mediaPlayerProps?.Get('org.bluez.MediaPlayer1', 'Position'))?.value ?? null
        })

        ipcMain.handle('mediaPlayer:play', async () => {
            await this.mediaPlayerInterface?.Play()
        })

        ipcMain.handle('mediaPlayer:pause', async () => {
            await this.mediaPlayerInterface?.Pause()
        })

        ipcMain.handle('mediaPlayer:next', async () => {
            await this.mediaPlayerInterface?.Next()
        })

        ipcMain.handle('mediaPlayer:previous', async () => {
            await this.mediaPlayerInterface?.Previous()
        })
    }

    public disconnect() {
        this.bus.disconnect()
    }

    private isAnyDeviceConnected(): boolean {
        const connectedDevices = Object.keys(this.objects).filter(path => {
            const device = this.objects[path]['org.bluez.Device1']
            return device && device.Connected.value === true
        })
        return connectedDevices.length > 0
    }

    private async configureProperties() {
        const bluezProxyObject = await this.bus.getProxyObject('org.bluez', '/org/bluez/hci0')
        const properties = bluezProxyObject.getInterface('org.freedesktop.DBus.Properties')

        await properties.Set('org.bluez.Adapter1', 'Alias', new dbus.Variant('s', 'PiPlay'))
        await properties.Set('org.bluez.Adapter1', 'Powered', new dbus.Variant('b', true))
        await properties.Set('org.bluez.Adapter1', 'Discoverable', new dbus.Variant('b', true))
        await properties.Set('org.bluez.Adapter1', 'Pairable', new dbus.Variant('b', true))
    }

    private async mediaPlayerHandler(path: string) {
        const mediaPlayerObject = await this.bus.getProxyObject('org.bluez', path)

        this.mediaPlayerInterface = mediaPlayerObject.getInterface('org.bluez.MediaPlayer1')
        // await this.mediaPlayerInterface.Play()

        this.mediaPlayerProps = mediaPlayerObject.getInterface('org.freedesktop.DBus.Properties')
        const allProperties = await this.mediaPlayerProps.GetAll('org.bluez.MediaPlayer1')
        this.sendMediaPlayerData(allProperties)

        this.mediaPlayerProps.on('PropertiesChanged', (iface, changed) => {
            this.sendMediaPlayerData(changed)
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private sendMediaPlayerData(data: any) {
        if (data.Track) {
            const track = data.Track.value
            this.getWindow()?.webContents.send('mediaPlayer:trackInfo', {
                title: track?.Title?.value ?? null,
                artist: track?.Artist?.value ?? null,
                album: track?.Album?.value ?? null,
                duration: track?.Duration?.value ?? null,
            })
        }
        if (data.Status) {
            this.getWindow()?.webContents.send('mediaPlayer:playbackStatus', data.Status.value)
        }
        if (data.Position) {
            this.getWindow()?.webContents.send('mediaPlayer:position', data.Position.value)
        }
    }
}

export default MediaPlayerService

/* eslint-enable new-cap */
