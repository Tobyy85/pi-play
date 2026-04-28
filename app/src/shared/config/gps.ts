interface GPSConfig {
    path: string
    baudRate: number
}

export const GPS_CONFIG: GPSConfig = {
    path: '/dev/ttyAMA0',
    baudRate: 9600,
}
