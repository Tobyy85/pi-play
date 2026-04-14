import { LIGHT_SENSOR_ID } from '@renderer/features/arduino/constants/arduinoSensorIds'
import useArduinoSensor from '@renderer/features/arduino/hooks/useArduinoSensor'

import { getOpacityFromLightLevel } from '@renderer/features/brightness/utils/brightness'

const BrightnessOverlay = () => {
    const { value: lightLevel } = useArduinoSensor<number>(LIGHT_SENSOR_ID, null)

    if (lightLevel === null) {
        return null
    }

    return (
        <>
            <div
                className='pointer-events-none fixed top-0 left-0 z-[9999] size-full bg-black
                    transition-opacity duration-[2000ms] [&_*]:pointer-events-auto'
                style={{ opacity: getOpacityFromLightLevel(lightLevel) }}
            ></div>
        </>
    )
}
export default BrightnessOverlay
