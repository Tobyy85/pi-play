import { ipcMain } from 'electron'

import StorageService from '@main/services/StorageService'

import type { WindowProvider } from '@main/types/window'
import { RADIO_API_URL } from '@shared/config/radio'
import type { RadioStation, StoredRadioData } from '@shared/types/radio'

class RadioService {
    private static readonly STORAGE_KEY = 'radio'

    private readonly getWindow: WindowProvider

    private apiKey: string | null = null

    private stations: RadioStation[] | null = null
    private isPlaying = false
    private currentStation: RadioStation | null = null

    constructor(getWindow: WindowProvider) {
        this.getWindow = getWindow
    }

    public async initialize(): Promise<void> {
        const apiKey = RadioService.getApiKey()
        if (!apiKey) {
            console.warn('[RadioService]: RAPIDAPI_KEY is not set.')
        }
        this.apiKey = apiKey

        const storedData = await RadioService.getStoredData()
        if (storedData) {
            this.updateCurrentStation(storedData.currentStation)
            this.updateIsPlaying(storedData.isPlaying)
        }

        this.updateStations(await this.fetchStations())
    }

    public registerIpcHandlers(): void {
        ipcMain.handle('radio:getStations', () => {
            return this.stations
        })

        ipcMain.handle('radio:getCurrentStation', () => {
            return this.currentStation
        })

        ipcMain.handle('radio:getIsPlaying', () => {
            return this.isPlaying
        })

        ipcMain.handle('radio:setCurrentStation', (_event, station: RadioStation | null) => {
            this.updateCurrentStation(station)
            this.updateStoredData()
        })

        ipcMain.handle('radio:setIsPlaying', (_event, isPlaying: boolean) => {
            this.updateIsPlaying(isPlaying)
            this.updateStoredData()
        })
    }

    public play(): void {
        this.updateIsPlaying(true)
        this.updateStoredData()
    }

    public pause(): void {
        this.updateIsPlaying(false)
        this.updateStoredData()
    }

    public getIsPlaying(): boolean {
        return this.isPlaying
    }

    private readonly fetchStations = async (): Promise<RadioStation[] | null> => {
        try {
            const headers = new Headers({
                'X-RapidAPI-Key': this.apiKey ?? undefined, // eslint-disable-line no-undefined
            })

            const response = await fetch(RADIO_API_URL, { headers })
            if (!response.ok) {
                console.error(`[Radio]: Failed to fetch radio stations: ${response.statusText}`)
                return null
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-type-assertion
            const data = (await response.json()) as { data: any[] }
            const cleanedStations = data.data.map(RadioService.cleanRadioStationData)

            return cleanedStations.filter(station => station !== null)
        } catch (error: unknown) {
            console.error('[Radio]: Error fetching radio stations: ', error)
            return null
        }
    }

    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static cleanRadioStationData(stationData: any): RadioStation | null {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-shadow
        const stream = stationData.streams.find((stream: any) => stream.isHttps) ?? stationData.streams[0]

        if (!stream?.url) {
            return null
        }

        return {
            id: stationData.id,
            name: stationData.name,
            streamUrl: stream.url,
            icon: stationData.logo ?? null,
        }
    }

    private static getApiKey(): string | null {
        const apiKey = process.env.RAPIDAPI_KEY
        if (!apiKey) {
            return null
        }
        return apiKey
    }

    private static async getStoredData(): Promise<StoredRadioData | null> {
        const storedData = await StorageService.get<StoredRadioData>(RadioService.STORAGE_KEY)
        if (!storedData) {
            return null
        }
        return storedData
    }

    private updateStoredData(): void {
        StorageService.set(RadioService.STORAGE_KEY, {
            currentStation: this.currentStation,
            isPlaying: this.isPlaying,
        })
    }

    private updateStations(stations: RadioStation[] | null): void {
        if (!stations) return

        this.stations = stations
        this.getWindow()?.webContents.send('radio:stations', stations)
    }

    private updateCurrentStation(station: RadioStation | null): void {
        this.currentStation = station
        this.getWindow()?.webContents.send('radio:currentStation', station)
    }

    private updateIsPlaying(isPlaying: boolean): void {
        this.isPlaying = isPlaying
        this.getWindow()?.webContents.send('radio:isPlaying', isPlaying)
    }
}

export default RadioService
