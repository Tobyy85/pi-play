import { ReadlineParser } from '@serialport/parser-readline'
import { BrowserWindow, ipcMain } from 'electron'
import { SerialPort } from 'serialport'

import type { ArduinoData, BoardInfo } from '@shared/types/arduino'

type PendingRequest = {
    resolve: (data: ArduinoData) => void
    reject: (error: Error) => void
    timeout: NodeJS.Timeout
}

const REQUEST_TIMEOUT = 5000

const parseJson = (line: string): unknown | null => {
    try {
        return JSON.parse(line.trim())
    } catch {
        return null
    }
}

const findArduinoPath = async (boardInfo: BoardInfo): Promise<string | null> => {
    const ports = await SerialPort.list()
    const arduinoPort = ports.find(
        port =>
            port.vendorId?.toLowerCase() === boardInfo.vendorId?.toLowerCase() &&
            port.productId?.toLowerCase() === boardInfo.productId?.toLowerCase()
    )
    return arduinoPort?.path ?? null
}

class ArduinoService {
    private port: SerialPort | null = null
    private parser: ReadlineParser | null = null
    private getWindow: () => BrowserWindow | null
    private pendingRequests: Map<string, PendingRequest[]> = new Map()

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
            const path = await findArduinoPath(boardInfo)
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
            const data = parseJson(line) as ArduinoData | null
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
     * Disconnect from the Arduino and clean up resources.
     */
    public disconnect(): void {
        // Reject all pending requests
        for (const [, requests] of this.pendingRequests) {
            for (const request of requests) {
                clearTimeout(request.timeout)
                request.reject(new Error('Arduino service disconnected'))
            }
        }
        this.pendingRequests.clear()

        this.parser?.removeAllListeners()
        this.parser = null

        if (this.port?.isOpen) {
            this.port.close()
        }
        this.port = null
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
                }, REQUEST_TIMEOUT),
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
}

export default ArduinoService
