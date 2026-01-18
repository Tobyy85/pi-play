import type { ArduinoData } from '@shared/types/arduino'

import { useCallback, useEffect, useState } from 'react'

type UseArduinoSensorReturn = {
    value: ArduinoData['value'] | null
    isLoading: boolean
    error: string | null
    refresh: () => Promise<void>
}

const useArduinoSensor = (
    sensorId: ArduinoData['sensorId'],
    initialValue: ArduinoData['value'] | null = null
): UseArduinoSensorReturn => {
    const [value, setValue] = useState<ArduinoData['value'] | null>(initialValue)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refresh = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await window.api.arduino.requestSensorValue(sensorId)
            setValue(data.value)
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
        window.api.arduino.subscribeToSensorId(sensorId, newValue => {
            setValue(newValue)
            setError(null)
        })
        // TODO: Unsubscribe on unmount
    }, [sensorId])

    return { value, isLoading, error, refresh }
}

export default useArduinoSensor
