export interface RadioStation {
    id: string
    streamUrl: string
    name: string
    icon: string | null
}

export interface StoredRadioData {
    currentStation: RadioStation | null
    isPlaying: boolean
}
