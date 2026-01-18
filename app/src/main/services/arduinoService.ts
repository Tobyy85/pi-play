import { ReadlineParser } from '@serialport/parser-readline'
import { BrowserWindow } from 'electron'
import { SerialPort } from 'serialport'

import type { ArduinoData, BoardInfo } from '@shared/types/arduino'

type PendingRequest = {
    resolve: (data: ArduinoData) => void
    reject: (error: Error) => void
    timeout: NodeJS.Timeout
}

export class ArduinoService {
    private port: SerialPort | null = null
    private parser: ReadlineParser | null = null
    private window: BrowserWindow
    private pendingRequests: Map<string, PendingRequest[]> = new Map()
    private readonly REQUEST_TIMEOUT = 5000 // eslint-disable-line no-magic-numbers

    constructor(window: BrowserWindow) {
        this.window = window
    }

    public async connect(boardInfo: BoardInfo, baudRate: number) {
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

    private initListeners() {
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
                    this.window.webContents.send('arduino:change', data)
                }
            }
        })

        this.port?.on('error', (err: Error) => {
            console.error('SerialPort Error: ', err.message)
        })
    }

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

    // eslint-disable-next-line class-methods-use-this
    private parseJson(line: string): unknown | null {
        try {
            return JSON.parse(line.trim())
        } catch {
            return null
        }
    }

    // eslint-disable-next-line class-methods-use-this
    private getArduinoPath = async (boardInfo: BoardInfo): Promise<string | null> => {
        const ports = await SerialPort.list()
        const arduinoPort = ports.find(
            port => port.vendorId === boardInfo.vendorId && port.productId === boardInfo.productId
        )
        return arduinoPort ? arduinoPort.path : null
    }
}
