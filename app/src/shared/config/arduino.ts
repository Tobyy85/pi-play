import type { BoardInfo } from '@shared/types/arduino'

interface ArduinoConfig {
    boards: BoardInfo[]
    baudRate: number
}

export const ARDUINO_CONFIG: ArduinoConfig = {
    boards: [
        {
            vendorId: '1A86',
            productId: '7523',
        },
        {
            vendorId: '1A86',
            productId: '7523',
        },
    ],
    baudRate: 115200,
}
