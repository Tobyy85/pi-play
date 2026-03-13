import { BrowserWindow, ipcMain } from 'electron'

import type { TrackInfo } from '@shared/types/mediaPlayer'

import * as dbus from 'dbus-next'

/* eslint-disable new-cap */
class MediaPlayerService {
    private getWindow: () => BrowserWindow | null
    private connectionStatus: boolean = false

    private systemBus: dbus.MessageBus
    private objManager: dbus.ClientInterface | null = null
    private objects: any // eslint-disable-line @typescript-eslint/no-explicit-any

    private mediaPlayerProps: dbus.ClientInterface | null = null
    private mediaPlayerInterface: any = null // eslint-disable-line @typescript-eslint/no-explicit-any

    constructor(getWindow: () => BrowserWindow | null) {
        this.getWindow = getWindow
        this.systemBus = dbus.systemBus()
    }

    public async initialize() {
        const bluez = await this.systemBus.getProxyObject('org.bluez', '/')
        this.objManager = bluez.getInterface('org.freedesktop.DBus.ObjectManager')
        this.objects = await this.objManager.GetManagedObjects()

        this.listenForConnectionChanges()

        for (const path in this.objects) {
            if (this.objects[path]['org.bluez.MediaPlayer1']) {
                this.mediaPlayerHandler(path)
            }
        }
    }

    public registerIpcHandlers() {
        ipcMain.handle('mediaPlayer:getConnectionStatus', () => {
            return this.connectionStatus
        })

        ipcMain.handle('mediaPlayer:getTrackInfo', async () => {
            const track = await this.mediaPlayerProps?.Get('org.bluez.MediaPlayer1', 'Track')
            return this.extractTrackInfo(track)
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
        this.systemBus.disconnect()
    }

    private setConnected(connected: boolean) {
        if (this.connectionStatus !== connected) {
            this.connectionStatus = connected
            this.getWindow()?.webContents.send('mediaPlayer:connectionStatus', connected)
        }
    }

    private listenForConnectionChanges() {
        if (!this.objManager) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.objManager.on('InterfacesAdded', (path: string, interfaces: any) => {
            if (interfaces['org.bluez.MediaPlayer1']) {
                this.mediaPlayerHandler(path)
            }
        })

        this.objManager.on('InterfacesRemoved', (path: string, interfaces: string[]) => {
            if (interfaces.includes('org.bluez.MediaPlayer1')) {
                this.mediaPlayerInterface = null
                this.mediaPlayerProps = null
                this.setConnected(false)
            }
        })
    }

    private async mediaPlayerHandler(path: string) {
        const mediaPlayerObject = await this.systemBus.getProxyObject('org.bluez', path)

        this.mediaPlayerInterface = mediaPlayerObject.getInterface('org.bluez.MediaPlayer1')
        this.setConnected(true)

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
            const track = data.Track
            this.getWindow()?.webContents.send('mediaPlayer:trackInfo', this.extractTrackInfo(track))
        }
        if (data.Status) {
            this.getWindow()?.webContents.send('mediaPlayer:playbackStatus', data.Status.value)
        }
        if (data.Position) {
            this.getWindow()?.webContents.send('mediaPlayer:position', data.Position.value)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private extractTrackInfo(track: any): TrackInfo {
        const title = track?.value?.Title?.value ?? null
        const artist = track?.value?.Artist?.value ?? null
        const album = track?.value?.Album?.value ?? null
        const duration = track?.value?.Duration?.value ?? null

        return this.cleanTrackInfo({
            title,
            artist,
            album,
            duration,
        })
    }

    /**
     * This is a hack to handle weird track info formats from certain players (like Spotify's "Listening on ...").
     */
    // eslint-disable-next-line class-methods-use-this
    private cleanTrackInfo(trackInfo: TrackInfo): TrackInfo {
        const cleanTrackInfo = trackInfo

        if (trackInfo.artist?.toLowerCase().includes('listening on')) {
            const titleSegments = trackInfo.title?.split('•')
            cleanTrackInfo.title = titleSegments?.[0]?.trim() ?? trackInfo.title
            cleanTrackInfo.artist = titleSegments?.[1]?.trim() ?? trackInfo.artist
            return cleanTrackInfo
        }

        if (cleanTrackInfo.artist?.toLowerCase().includes('shuffle')) {
            const artistSegments = cleanTrackInfo.artist.split('•')
            cleanTrackInfo.artist = artistSegments?.[0]?.trim() ?? cleanTrackInfo.artist
            return cleanTrackInfo
        }

        if (cleanTrackInfo.artist?.toLowerCase().includes('video')) {
            const artistSegments = cleanTrackInfo.artist.split('•')
            cleanTrackInfo.artist = artistSegments?.[0]?.trim() ?? cleanTrackInfo.artist
            return cleanTrackInfo
        }

        return trackInfo
    }
}

export default MediaPlayerService

/* eslint-enable new-cap */
