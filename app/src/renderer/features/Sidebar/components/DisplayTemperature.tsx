import useArduinoSensor from '@renderer/hooks/useArduinoSensor'

interface DisplayTemperatureProps {
    sensorId: string
}

const DisplayTemperature = ({ sensorId }: DisplayTemperatureProps) => {
    const { value: temperature, isLoading, error } = useArduinoSensor(sensorId, null)

    if (isLoading) {
        return <>--</>
    }

    if (error || temperature === null) {
        console.error('DisplayTemperature error:', error)
        return <>ERR</>
    }

    return <>{parseInt(temperature)}</>
}
export default DisplayTemperature
