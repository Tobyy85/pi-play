import type { ArduinoData } from '@shared/types/arduino'

import { useCallback, useEffect, useState } from 'react'

type UseArduinoSensorReturn<T extends ArduinoData['value']> = {
    value: T | null
    isLoading: boolean
    error: string | null
    refresh: () => Promise<void>
}

const useArduinoSensor = <T extends ArduinoData['value']>(
    sensorId: ArduinoData['sensorId'],
    initialValue: T | null = null
): UseArduinoSensorReturn<T> => {
    const [value, setValue] = useState<T | null>(initialValue)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refresh = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await window.api.arduino.requestSensorValue(sensorId)
            setValue(data.value as T | null)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            setError(message)
            console.error(`Error requesting sensor value for ${sensorId}:`, err)
        } finally {
            setIsLoading(false)
        }
    }, [sensorId])

    // Initial fetch
    useEffect(() => {
        refresh()
    }, [refresh])

    useEffect(() => {
        const unsubscribe = window.api.arduino.subscribeToSensorId(sensorId, newValue => {
            setValue(newValue as T | null)
            setError(null)
        })
        return unsubscribe
    }, [sensorId])

    return { value, isLoading, error, refresh }
}

export default useArduinoSensor
