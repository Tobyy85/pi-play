interface GPSConfig {
    path: string
    baudRate: number
}

export const GPS_CONFIG: GPSConfig = {
    path: 'COM6',
    baudRate: 9600,
}
