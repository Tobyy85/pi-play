import { EnvConfig } from '@main/config/types'
import { BoardInfo } from '@shared/types/arduino'

export interface ArduinoConfig {
    boardInfo: BoardInfo
    baudRate: number
}

export const ARDUINO_CONFIG: EnvConfig<ArduinoConfig> = {
    dev: {
        boardInfo: {
            vendorId: '1A86',
            productId: '7523',
        },
        baudRate: 115200,
    },
    prod: {
        boardInfo: {
            vendorId: '1A86',
            productId: '7523',
        },
        baudRate: 115200,
    },
}
