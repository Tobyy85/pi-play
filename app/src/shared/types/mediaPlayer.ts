export interface TrackInfo {
    title: string | null
    artist: string | null
    album: string | null
    duration: number | null
}
export type Status = 'playing' | 'paused'
export type Position = number
