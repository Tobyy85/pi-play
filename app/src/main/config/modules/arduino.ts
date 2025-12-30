import { EnvConfig } from '@main/config/types'
import { BoardInfo } from '@shared/types/arduino'

export interface ArduinoConfig {
    boardInfo: BoardInfo
    baudRate: number
}

export const ARDUINO_CONFIG: EnvConfig<ArduinoConfig> = {
    dev: {
        boardInfo: {
            vendorId: '2341',
            productId: '1002',
        },
        baudRate: 115200,
    },
    prod: {
        boardInfo: {
            vendorId: '2341',
            productId: '1002',
        },
        baudRate: 115200,
    },
}
