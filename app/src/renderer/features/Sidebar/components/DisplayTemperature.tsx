import { useEffect, useState } from 'react'

interface DisplayTemperatureProps {
    sensorType: string
}

const DisplayTemperature = ({ sensorType }: DisplayTemperatureProps) => {
    const [temperature, setTemperature] = useState<string>('')

    useEffect(() => {
        try {
            window.api.arduino.subscribeToType(sensorType, newTemperature => {
                setTemperature(newTemperature)
            })
        } catch (error) {
            console.error('Error fetching temperature:', error)
        }
    }, [sensorType])

    return <>{parseInt(temperature)}</>
}
export default DisplayTemperature
