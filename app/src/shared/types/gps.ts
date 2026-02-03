export interface GPSData {
    latitude: number | null
    longitude: number | null
    altitude: number | null
    speed: number | null // km/h
    course: number | null // degrees
    timestamp: string | null
    fix: boolean
    satellites: number
}
