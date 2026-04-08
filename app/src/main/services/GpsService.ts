import { ReadlineParser } from '@serialport/parser-readline'
import { ipcMain, type BrowserWindow } from 'electron'
import * as nmea from 'nmea-simple'
import { SerialPort } from 'serialport'

import { GPS_CONFIG } from '@shared/config/gps'
import type { GPSData } from '@shared/types/gps'

const KNOTS_TO_KMH = 1.852
const ROUND_PRECISION = 100

const knotsToKmh = (knots: number | null): number | null => {
    if (knots === null) return null
    return Math.round(knots * KNOTS_TO_KMH * ROUND_PRECISION) / ROUND_PRECISION
}

const formatTimestamp = (datetime: Date | null): string | null => {
    if (!datetime) return null
    return datetime.toISOString()
}

const DEFAULT_GPS_DATA: GPSData = {
    latitude: null,
    longitude: null,
    altitude: null,
    speed: null,
    course: null,
    timestamp: null,
    fix: false,
    satellites: 0,
}

class GPSService {
    private port: SerialPort | null = null
    private parser: ReadlineParser | null = null
    private readonly getWindow: () => BrowserWindow | null
    private isConnected = false
    private readonly currentData: GPSData = { ...DEFAULT_GPS_DATA }

    constructor(getWindow: () => BrowserWindow | null) {
        this.getWindow = getWindow
    }

    /**
     * Connect to the GPS module using the configured serial port.
     */
    public connect(): void {
        try {
            this.port = new SerialPort({
                path: GPS_CONFIG.path,
                baudRate: GPS_CONFIG.baudRate,
            })

            this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
            this.initListeners()

            this.port.on('open', () => {
                this.isConnected = true
            })
        } catch (error) {
            console.error('[GpsService]: GPS: Error while connecting: ', error, '\n\n')
            this.isConnected = false
        }
    }

    /**
     * Disconnect from the GPS module and clean up resources.
     */
    public disconnect(): void {
        this.parser?.removeAllListeners()
        this.parser = null

        if (this.port?.isOpen) {
            this.port.close()
        }
        this.port = null
        this.isConnected = false
    }

    /**
     * Register IPC handlers for the GPS service.
     */
    public registerIpcHandlers(): void {
        ipcMain.handle('gps:getData', () => {
            return this.getData()
        })

        ipcMain.handle('gps:getConnectionStatus', () => {
            return this.getConnectionStatus()
        })
    }

    public getData(): GPSData {
        return { ...this.currentData }
    }

    public getConnectionStatus(): boolean {
        return this.isConnected && (this.port?.isOpen ?? false)
    }

    /**
     * Initialize event listeners for the serial port and parser.
     */
    private initListeners(): void {
        if (!this.parser || !this.port) return

        this.parser.on('data', (line: string) => {
            this.parseNMEA(line)
        })

        this.port.on('error', (err: Readonly<Error>) => {
            console.error('[GpsService]: GPS: SerialPort Error: ', err.message, '\n\n')
            this.isConnected = false
        })

        this.port.on('close', () => {
            this.isConnected = false
        })
    }

    /**
     * Parse an NMEA sentence and update the current GPS data.
     * @param sentence - The NMEA sentence to parse.
     */
    private parseNMEA(sentence: string): void {
        try {
            if (!sentence.startsWith('$')) return

            const parsed = nmea.parseNmeaSentence(sentence)
            const hasDataChanged = this.handleParsedSentence(parsed)

            if (hasDataChanged) {
                this.getWindow()?.webContents.send('gps:change', { ...this.currentData })
            }
        } catch (error) {
            // Invalid NMEA sentence - silently ignore
            console.warn(
                `[GpsService]: GPS: Failed to parse NMEA sentence: ${sentence}, error: `,
                error,
                '\n\n'
            )
        }
    }

    /**
     * Handle a parsed NMEA sentence and update the current GPS data.
     * @param parsed - The parsed NMEA packet.
     * @returns True if data changed, false otherwise.
     */
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    private handleParsedSentence(parsed: nmea.Packet): boolean {
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        switch (parsed.sentenceId) {
            case 'GGA':
                return this.handleGGA(parsed)
            case 'RMC':
                return this.handleRMC(parsed)
            default:
                return false
        }
    }

    /**
     * Handle GGA (Global Positioning System Fix Data) sentence.
     * @return True if data changed, false otherwise.
     */
    private handleGGA(gga: Readonly<nmea.GGAPacket>): boolean {
        if (gga.fixType === 'none') {
            this.currentData.fix = false
            this.currentData.satellites = gga.satellitesInView
            return false
        }

        this.currentData.latitude = gga.latitude
        this.currentData.longitude = gga.longitude
        this.currentData.altitude = gga.altitudeMeters
        this.currentData.satellites = gga.satellitesInView
        this.currentData.fix = true
        this.currentData.timestamp = formatTimestamp(gga.time)
        return true
    }

    /**
     * Handle RMC (Recommended Minimum Navigation Information) sentence.
     * @return True if data changed, false otherwise.
     */
    private handleRMC(rmc: Readonly<nmea.RMCPacket>): boolean {
        if (rmc.status !== 'valid') {
            this.currentData.fix = false
            return false
        }

        this.currentData.latitude = rmc.latitude
        this.currentData.longitude = rmc.longitude
        this.currentData.speed = knotsToKmh(rmc.speedKnots)
        this.currentData.course = rmc.trackTrue
        this.currentData.timestamp = formatTimestamp(rmc.datetime)
        this.currentData.fix = true
        return true
    }
}

export default GPSService
