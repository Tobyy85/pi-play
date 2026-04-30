import { RADIO_API_URL } from '@shared/config/radio'

import type { RadioStation } from '@renderer/features/appRadio/types'

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cleanRadioStationData = (stationData: any): RadioStation | null => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-shadow
    const stream = stationData.streams.find((stream: any) => stream.isHttps) ?? stationData.streams[0]

    if (!stream?.url) {
        return null
    }

    return {
        id: stationData.id,
        name: stationData.name,
        streamUrl: stream.url,
        icon: stationData.logo ?? null,
    }
}
/* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

export const fetchRadioStations = async (): Promise<RadioStation[] | null> => {
    try {
        const headers = new Headers({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
        })

        const response = await fetch(RADIO_API_URL, { headers })
        if (!response.ok) {
            console.error(`[Radio]: Failed to fetch radio stations: ${response.statusText}`)
            return null
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-type-assertion
        const data = (await response.json()) as { data: any[] }
        const cleanedStations = data.data.map(cleanRadioStationData)

        return cleanedStations.filter(station => station !== null)
    } catch (error: unknown) {
        console.error('[Radio]: Error fetching radio stations: ', error)
        return null
    }
}
