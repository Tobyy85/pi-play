import { useCallback } from 'react'

import useIpcData from '@renderer/hooks/useIpcData'

import type { ArduinoData } from '@shared/types/arduino'

interface UseArduinoSensorReturn<T> {
    value: T | null
    isLoading: boolean
    error: string | null
    refresh: () => Promise<void>
}

const useArduinoSensor = <T extends ArduinoData['value']>(
    sensorId: ArduinoData['sensorId'],
    initialValue: T | null = null
): UseArduinoSensorReturn<T> => {
    const getData = useCallback(async () => {
        const data = await window.api.arduino.requestSensorValue(sensorId)
        return data.value as T // eslint-disable-line @typescript-eslint/no-unsafe-type-assertion
    }, [sensorId])

    const subscribe = useCallback(
        (callback: (value: T) => void) =>
            window.api.arduino.subscribeToSensorId(sensorId, newValue => callback(newValue as T)), // eslint-disable-line @typescript-eslint/no-unsafe-type-assertion
        [sensorId]
    )

    const {
        data: value,
        isLoading,
        error,
        refresh,
    } = useIpcData<T>(getData, subscribe, initialValue, [sensorId])

    return { value, isLoading, error, refresh }
}

export default useArduinoSensor
