import type { BoardInfo } from '@shared/types/arduino'

export interface ArduinoConfig {
    boardInfo: BoardInfo
    baudRate: number
}

export const ARDUINO_CONFIG: ArduinoConfig = {
    boardInfo: {
        vendorId: '1A86',
        productId: '7523',
    },
    baudRate: 115200,
}
