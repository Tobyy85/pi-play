import { useEffect, useState } from 'react'

interface DisplayTemperatureProps {
    sensorId: string
}

const DisplayTemperature = ({ sensorId }: DisplayTemperatureProps) => {
    const [temperature, setTemperature] = useState<string>('')

    useEffect(() => {
        try {
            window.api.arduino.subscribeToSensorId(sensorId, newTemperature => {
                setTemperature(newTemperature)
            })
        } catch (error) {
            console.error('Error fetching temperature:', error)
        }
    }, [sensorId])

    return <>{parseInt(temperature)}</>
}
export default DisplayTemperature
