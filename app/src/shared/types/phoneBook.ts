export interface Contact {
    name: string
    phoneNumber: string
    photo?: string
}

export interface CallHistoryEntry {
    name: string
    phoneNumber: string
    dateTime: string
    type: 'RECEIVED' | 'DIALED' | 'MISSED'
}
