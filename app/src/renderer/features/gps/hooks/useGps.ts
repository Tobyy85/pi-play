import { useCallback, useEffect, useState } from 'react'

import type { GPSData } from '@shared/types/gps'

type UseGpsReturn = {
    data: GPSData | null
    isLoading: boolean
    error: string | null
}

const useGps = (): UseGpsReturn => {
    const [gpsData, setGpsData] = useState<GPSData | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const refresh = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await window.api.gps.getData()
            setGpsData(data)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            setError(message)
            console.error('Error fetching GPS data:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    useEffect(() => {
        const unsubscribe = window.api.gps.subscribe(newGpsData => {
            setGpsData(newGpsData)
            setError(null)
        })
        return unsubscribe
    }, [])

    return { data: gpsData, isLoading, error }
}
export default useGps
