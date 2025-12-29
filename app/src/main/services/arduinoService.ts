import { ReadlineParser } from '@serialport/parser-readline'
import { BrowserWindow } from 'electron'
import { SerialPort } from 'serialport'

import type { ArduinoData } from '@shared/types/arduino'

export class ArduinoService {
    private port: SerialPort | null = null
    private parser: ReadlineParser | null = null
    private window: BrowserWindow

    constructor(window: BrowserWindow) {
        this.window = window
    }

    public connect(path: string, baudRate: number) {
        try {
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
                this.window.webContents.send('arduino:change', data)
            }
        })

        this.port?.on('error', (err: Error) => {
            console.error('SerialPort Error: ', err.message)
        })
    }

    // eslint-disable-next-line class-methods-use-this
    private parseJson(line: string): unknown | null {
        try {
            return JSON.parse(line.trim())
        } catch {
            return null
        }
    }
}
