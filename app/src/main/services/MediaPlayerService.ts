import { ipcMain, type BrowserWindow } from 'electron'

import type { TrackInfo } from '@shared/types/mediaPlayer'

import * as dbus from 'dbus-next'

/* eslint-disable new-cap, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
class MediaPlayerService {
    private readonly getWindow: () => BrowserWindow | null
    private connectionStatus = false

    private readonly systemBus: dbus.MessageBus
    private objManager: dbus.ClientInterface | null = null
    private objects: any // eslint-disable-line @typescript-eslint/no-explicit-any

    private mediaPlayerProps: dbus.ClientInterface | null = null
    private mediaPlayerInterface: any = null // eslint-disable-line @typescript-eslint/no-explicit-any
    private mediaPlayerPath: string | null = null

    private isInitialized = false

    constructor(getWindow: () => BrowserWindow | null) {
        this.getWindow = getWindow
        this.systemBus = dbus.systemBus()
    }

    public async initialize(): Promise<void> {
        const bluez = await this.systemBus.getProxyObject('org.bluez', '/')
        this.objManager = bluez.getInterface('org.freedesktop.DBus.ObjectManager')
        if (!this.isInitialized) {
            this.listenForConnectionChanges()
            this.isInitialized = true
        }

        await this.reload()
    }

    public async reload(): Promise<void> {
        if (!this.objManager) {
            return
        }

        this.resetMediaPlayerState()
        this.objects = await this.objManager.GetManagedObjects()

        for (const path in this.objects) {
            if (this.objects[path]['org.bluez.MediaPlayer1']) {
                await this.mediaPlayerHandler(path)
                break
            }
        }
    }

    public registerIpcHandlers(): void {
        ipcMain.handle('mediaPlayer:getConnectionStatus', () => {
            return this.connectionStatus
        })

        ipcMain.handle('mediaPlayer:getTrackInfo', async () => {
            const track = await this.mediaPlayerProps?.Get('org.bluez.MediaPlayer1', 'Track')
            return MediaPlayerService.extractTrackInfo(track)
        })

        ipcMain.handle('mediaPlayer:getPlaybackStatus', async () => {
            const status = await this.mediaPlayerProps?.Get('org.bluez.MediaPlayer1', 'Status')
            const value: string | undefined = status?.value
            return value ?? null
        })

        ipcMain.handle('mediaPlayer:getPosition', async () => {
            const position = await this.mediaPlayerProps?.Get('org.bluez.MediaPlayer1', 'Position')
            const value: number | undefined = position?.value
            return value ?? null
        })

        ipcMain.handle('mediaPlayer:play', async () => {
            await this.play()
        })

        ipcMain.handle('mediaPlayer:pause', async () => {
            await this.pause()
        })

        ipcMain.handle('mediaPlayer:next', async () => {
            await this.next()
        })

        ipcMain.handle('mediaPlayer:previous', async () => {
            await this.previous()
        })
    }

    public async play(): Promise<void> {
        await this.mediaPlayerInterface?.Play()
    }

    public async pause(): Promise<void> {
        await this.mediaPlayerInterface?.Pause()
    }

    public async next(): Promise<void> {
        await this.mediaPlayerInterface?.Next()
    }

    public async previous(): Promise<void> {
        await this.mediaPlayerInterface?.Previous()
    }

    public async togglePlayPause(): Promise<void> {
        const status = await this.mediaPlayerProps?.Get('org.bluez.MediaPlayer1', 'Status')
        const value: string | undefined = status?.value

        if (value === 'playing') {
            await this.pause()
        } else {
            await this.play()
        }
    }

    public disconnect(): void {
        this.systemBus.disconnect()
    }

    private setConnected(connected: boolean): void {
        if (this.connectionStatus !== connected) {
            this.connectionStatus = connected
            this.getWindow()?.webContents.send('mediaPlayer:connectionStatus', connected)
        }
    }

    private listenForConnectionChanges(): void {
        if (!this.objManager) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.objManager.on('InterfacesAdded', (path: string, interfaces: any) => {
            if (interfaces['org.bluez.MediaPlayer1']) {
                this.mediaPlayerHandler(path).catch((err: unknown) => {
                    console.error(
                        '[MediaPlayerService]: Failed to handle MediaPlayer interface addition: ',
                        err,
                        '\n\n'
                    )
                })
            }
        })

        this.objManager.on('InterfacesRemoved', (_path: string, interfaces: string[]) => {
            if (interfaces.includes('org.bluez.MediaPlayer1')) {
                this.reload().catch((err: unknown) => {
                    console.error('[MediaPlayerService]: Failed to reload MediaPlayerService: ', err, '\n\n')
                })
            }
        })
    }

    private async mediaPlayerHandler(path: string): Promise<void> {
        if (this.mediaPlayerPath === path && this.mediaPlayerProps && this.mediaPlayerInterface) {
            return
        }

        if (this.mediaPlayerProps) {
            this.mediaPlayerProps.removeAllListeners('PropertiesChanged')
        }

        const mediaPlayerObject = await this.systemBus.getProxyObject('org.bluez', path)

        this.mediaPlayerInterface = mediaPlayerObject.getInterface('org.bluez.MediaPlayer1')
        this.mediaPlayerPath = path
        this.setConnected(true)

        this.mediaPlayerProps = mediaPlayerObject.getInterface('org.freedesktop.DBus.Properties')
        const allProperties = await this.mediaPlayerProps.GetAll('org.bluez.MediaPlayer1')
        this.sendMediaPlayerData(allProperties)

        this.mediaPlayerProps.on('PropertiesChanged', (iface, changed) => {
            this.sendMediaPlayerData(changed)
        })
    }

    private resetMediaPlayerState(): void {
        if (this.mediaPlayerProps) {
            this.mediaPlayerProps.removeAllListeners('PropertiesChanged')
        }

        this.mediaPlayerPath = null
        this.mediaPlayerInterface = null
        this.mediaPlayerProps = null
        this.setConnected(false)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private sendMediaPlayerData(data: any): void {
        if (data.Track) {
            const track = data.Track
            this.getWindow()?.webContents.send(
                'mediaPlayer:trackInfo',
                MediaPlayerService.extractTrackInfo(track)
            )
        }
        if (data.Status) {
            this.getWindow()?.webContents.send('mediaPlayer:playbackStatus', data.Status.value)
        }
        if (data.Position) {
            this.getWindow()?.webContents.send('mediaPlayer:position', data.Position.value)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static extractTrackInfo(track: any): TrackInfo {
        const title = track?.value?.Title?.value ?? null
        const artist = track?.value?.Artist?.value ?? null
        const album = track?.value?.Album?.value ?? null
        const duration = track?.value?.Duration?.value ?? null

        return MediaPlayerService.cleanTrackInfo({
            title,
            artist,
            album,
            duration,
        })
    }

    /**
     * This is a hack to handle weird track info formats from certain players (like Spotify's "Listening on ...").
     */
    private static cleanTrackInfo(trackInfo: TrackInfo): TrackInfo {
        const cleanTrackInfo = { ...trackInfo }

        if (trackInfo.artist?.toLowerCase().includes('listening on')) {
            const titleSegments = trackInfo.title?.split('•')
            cleanTrackInfo.title = titleSegments?.[0]?.trim() ?? trackInfo.title
            cleanTrackInfo.artist = titleSegments?.[1]?.trim() ?? trackInfo.artist
            return cleanTrackInfo
        }

        if (cleanTrackInfo.artist?.toLowerCase().includes('shuffle')) {
            const artistSegments = cleanTrackInfo.artist.split('•')
            cleanTrackInfo.artist = artistSegments[0]?.trim() ?? cleanTrackInfo.artist
            return cleanTrackInfo
        }

        if (cleanTrackInfo.artist?.toLowerCase().includes('video')) {
            const artistSegments = cleanTrackInfo.artist.split('•')
            cleanTrackInfo.artist = artistSegments[0]?.trim() ?? cleanTrackInfo.artist
            return cleanTrackInfo
        }

        return trackInfo
    }
}

export default MediaPlayerService
