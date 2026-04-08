import { ReadlineParser } from '@serialport/parser-readline'
import { ipcMain, type BrowserWindow } from 'electron'
import { SerialPort } from 'serialport'

import type { ArduinoData, BoardInfo } from '@shared/types/arduino'

interface PendingRequest {
    resolve: (data: Readonly<ArduinoData>) => void
    reject: (error: Readonly<Error>) => void
    timeout: NodeJS.Timeout
}

interface SerialConnection {
    port: SerialPort
    parser: ReadlineParser
}

class ArduinoService {
    private static readonly REQUEST_TIMEOUT = 5000

    private readonly getWindow: () => BrowserWindow | null

    private serialConnections: SerialConnection[] = []
    private readonly pendingRequests: Map<string, PendingRequest[]> = new Map()

    constructor(getWindow: () => BrowserWindow | null) {
        this.getWindow = getWindow
    }

    /**
     * Connect to the Arduino board with the given BoardInfo and baud rate.
     * @param boards - An array of BoardInfo objects representing the Arduino boards to connect to.
     * @param baudRate - The baud rate for the serial connection.
     */
    public async connect(boards: readonly Readonly<BoardInfo>[], baudRate: number): Promise<void> {
        try {
            const paths = await ArduinoService.findArduinoPaths(boards)

            if (paths.length === 0) {
                console.error('[ArduinoService]: No Arduino boards found')
                return
            }
            if (paths.length !== boards.length) {
                console.warn(
                    `[ArduinoService]: Not all Arduino boards found. Connected ${paths.length} of ${boards.length} configured boards.`
                )
            }

            for (const path of paths) {
                const port = new SerialPort({ path, baudRate })
                const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
                this.serialConnections.push({ port, parser })
            }
            this.initListeners()
        } catch (error) {
            console.error('[ArduinoService]: Error while connecting to Arduinos: ', error, '\n\n')
        }
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

        for (const { port, parser } of this.serialConnections) {
            parser.removeAllListeners()
            if (port.isOpen) {
                port.close()
            }
        }
        this.serialConnections = []
    }

    /**
     * Register IPC handlers for the Arduino service.
     */
    public registerIpcHandlers(): void {
        ipcMain.handle('arduino:requestSensorValue', async (_event, sensorId: string) => {
            return await this.requestSensorValue(sensorId)
        })
    }

    /**
     * Find the serial port paths for the given Arduino boards.
     * @param boards - An array of BoardInfo objects representing the Arduino boards to find.
     * @returns A promise that resolves with an array of serial port paths for the found boards.
     */
    private static async findArduinoPaths(boards: readonly Readonly<BoardInfo>[]): Promise<string[]> {
        const usedPaths: Set<string> = new Set()
        const ports = await SerialPort.list()
        const foundPaths: string[] = []

        for (const board of boards) {
            const foundPort = ports.find(
                port =>
                    !usedPaths.has(port.path) &&
                    port.vendorId?.toLowerCase() === board.vendorId.toLowerCase() &&
                    port.productId?.toLowerCase() === board.productId.toLowerCase()
            )
            if (foundPort) {
                foundPaths.push(foundPort.path)
                usedPaths.add(foundPort.path)
            }
        }
        return foundPaths
    }

    /**
     * Initialize event listeners for the serial port and parser.
     */
    private initListeners(): void {
        for (const { port, parser } of this.serialConnections) {
            parser.on('data', (line: string) => {
                const data = ArduinoService.parseJson(line) as ArduinoData | null // eslint-disable-line @typescript-eslint/no-unsafe-type-assertion
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
                } else {
                    console.warn(`[ArduinoService]: Ignored non-JSON line: ${line}`)
                }
            })

            port.on('error', (err: Readonly<Error>) => {
                console.error(`[ArduinoService]: SerialPort Error: ${err.message}`)
            })
        }
    }

    /**
     * Request the value of a sensor by its ID.
     * @param sensorId - The ID of the sensor to request.
     * @returns A promise that resolves with the ArduinoData.
     */
    public async requestSensorValue(sensorId: string): Promise<ArduinoData> {
        return await new Promise((resolve, reject) => {
            if (this.serialConnections.length === 0) {
                reject(new Error('No serial connections available'))
                return
            }

            const pendingRequest: PendingRequest = {
                resolve,
                reject,
                timeout: setTimeout(() => {
                    this.removePendingRequest(sensorId, pendingRequest)
                    reject(new Error(`Request timeout for sensor: ${sensorId}`))
                }, ArduinoService.REQUEST_TIMEOUT),
            }

            const existingRequests = this.pendingRequests.get(sensorId)
            if (existingRequests) {
                existingRequests.push(pendingRequest)
                return
            }

            this.pendingRequests.set(sensorId, [pendingRequest])
            // Send the request to all connected boards (could be optimized to target specific boards if needed)
            for (const { port } of this.serialConnections) {
                port.write(`${sensorId}\n`, err => {
                    if (err) {
                        this.removePendingRequest(sensorId, pendingRequest)
                        clearTimeout(pendingRequest.timeout)
                        reject(new Error(`Failed to send request: ${err.message}`))
                    }
                })
            }
        })
    }

    /**
     * Remove a pending request for a given sensorId.
     * @param sensorId - The ID of the sensor.
     * @param request - The pending request to remove.
     */
    private removePendingRequest(sensorId: string, request: Readonly<PendingRequest>): void {
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

    private static parseJson(line: string): unknown {
        try {
            return JSON.parse(line.trim())
        } catch {
            return null
        }
    }
}

export default ArduinoService
