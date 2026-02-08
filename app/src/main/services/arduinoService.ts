import { ReadlineParser } from '@serialport/parser-readline'
import { BrowserWindow, ipcMain } from 'electron'
import { SerialPort } from 'serialport'

import type { ArduinoData, BoardInfo } from '@shared/types/arduino'

type PendingRequest = {
    resolve: (data: ArduinoData) => void
    reject: (error: Error) => void
    timeout: NodeJS.Timeout
}

class ArduinoService {
    private port: SerialPort | null = null
    private parser: ReadlineParser | null = null
    private getWindow: () => BrowserWindow | null
    private pendingRequests: Map<string, PendingRequest[]> = new Map()
    private readonly REQUEST_TIMEOUT = 5000 // eslint-disable-line no-magic-numbers

    constructor(getWindow: () => BrowserWindow | null) {
        this.getWindow = getWindow
    }

    /**
     * Connect to the Arduino board with the given BoardInfo and baud rate.
     * @param boardInfo - The BoardInfo containing vendorId and productId.
     * @param baudRate - The baud rate for the serial connection.
     */
    public async connect(boardInfo: BoardInfo, baudRate: number): Promise<void> {
        try {
            const path = await this.getArduinoPath(boardInfo)
            if (!path) {
                console.error('Arduino not found')
                return
            }
            this.port = new SerialPort({ path, baudRate })
            this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
            this.initListeners()
        } catch (error) {
            console.error('Error while connecting to Arduino: ', error)
        }
    }

    /**
     * Initialize event listeners for the serial port and parser.
     */
    private initListeners(): void {
        if (!this.parser) return

        this.parser.on('data', (line: string) => {
            const data = this.parseJson(line) as ArduinoData | null
            if (data) {
                const pendingRequests = this.pendingRequests.get(data.sensorId)
                if (pendingRequests && pendingRequests.length > 0) {
                    // Fulfill all pending requests for this sensorId
                    this.pendingRequests.delete(data.sensorId)
                    pendingRequests.forEach(request => {
                        clearTimeout(request.timeout)
                        request.resolve(data)
                    })
                } else {
                    this.getWindow()?.webContents.send('arduino:change', data)
                }
            }
        })

        this.port?.on('error', (err: Error) => {
            console.error('SerialPort Error: ', err.message)
        })
    }

    /**
     * Register IPC handlers for the Arduino service.
     */
    public registerIpcHandlers(): void {
        ipcMain.handle('arduino:requestSensorValue', (_event, sensorId: string) => {
            return this.requestSensorValue(sensorId)
        })
    }

    /**
     * Request the value of a sensor by its ID.
     * @param sensorId - The ID of the sensor to request.
     * @returns A promise that resolves with the ArduinoData.
     */
    public requestSensorValue(sensorId: string): Promise<ArduinoData> {
        return new Promise((resolve, reject) => {
            if (!this.port || !this.port.isOpen) {
                reject(new Error('Serial port is not connected'))
                return
            }

            const pendingRequest: PendingRequest = {
                resolve,
                reject,
                timeout: setTimeout(() => {
                    this.removePendingRequest(sensorId, pendingRequest)
                    reject(new Error(`Request timeout for sensor: ${sensorId}`))
                }, this.REQUEST_TIMEOUT),
            }

            const existingRequests = this.pendingRequests.get(sensorId)
            if (existingRequests) {
                existingRequests.push(pendingRequest)
                return
            }

            this.pendingRequests.set(sensorId, [pendingRequest])
            this.port.write(`${sensorId}\n`, err => {
                if (err) {
                    this.removePendingRequest(sensorId, pendingRequest)
                    clearTimeout(pendingRequest.timeout)
                    reject(new Error(`Failed to send request: ${err.message}`))
                }
            })
        })
    }

    /**
     * Remove a pending request for a given sensorId.
     * @param sensorId - The ID of the sensor.
     * @param request - The pending request to remove.
     */
    private removePendingRequest(sensorId: string, request: PendingRequest): void {
        const requests = this.pendingRequests.get(sensorId)
        if (!requests) return

        const index = requests.indexOf(request)
        if (index > -1) {
            requests.splice(index, 1)
            if (requests.length === 0) {
                this.pendingRequests.delete(sensorId)
            }
        }
    }

    /**
     * Parse a JSON string safely.
     * @param line - The JSON string to parse.
     * @returns The parsed object or null if parsing fails.
     */
    // eslint-disable-next-line class-methods-use-this
    private parseJson(line: string): unknown | null {
        try {
            return JSON.parse(line.trim())
        } catch {
            return null
        }
    }

    /**
     * Get the Arduino path based on BoardInfo.
     * @param boardInfo - The board information containing vendorId and productId.
     * @returns The path of the Arduino port or null if not found.
     */
    // eslint-disable-next-line class-methods-use-this
    private getArduinoPath = async (boardInfo: BoardInfo): Promise<string | null> => {
        const ports = await SerialPort.list()
        const arduinoPort = ports.find(
            port =>
                port.vendorId?.toLowerCase() === boardInfo.vendorId?.toLowerCase() &&
                port.productId?.toLowerCase() === boardInfo.productId?.toLowerCase()
        )
        return arduinoPort ? arduinoPort.path : null
    }
}

export default ArduinoService
