import useArduinoSensor from '@renderer/features/arduino/hooks/useArduinoSensor'

interface DisplayTemperatureProps {
    sensorId: string
}

const DisplayTemperature = ({ sensorId }: DisplayTemperatureProps) => {
    const { value: temperature, isLoading, error } = useArduinoSensor<number>(sensorId, null)

    if (isLoading) {
        return <>- -°C</>
    }

    if (error || temperature === null) {
        console.error('DisplayTemperature error:', error)
        return <>ERR</>
    }

    return <>{temperature.toFixed(0)}°C</>
}
export default DisplayTemperature
