import SensorSector from '@renderer/features/appReverseCamera/components/SensorSector'

import { PARKING_SENSOR_IDS } from '@renderer/features/arduino/constants/arduinoSensorIds'
import useArduinoSensor from '@renderer/features/arduino/hooks/useArduinoSensor'

const SIDE_SENSOR_ANGLE = 20
const MID_SENSOR_ANGLE = 60
const SPACING = 2

const WIDTH = 400
const HEIGHT = 170
const SECTOR_HEIGHT = 70

const ParkingSensors = () => {
    const { value: leftSensorValue } = useArduinoSensor<number>(PARKING_SENSOR_IDS.left, 0)
    const { value: midSensorValue } = useArduinoSensor<number>(PARKING_SENSOR_IDS.mid, 0)
    const { value: rightSensorValue } = useArduinoSensor<number>(PARKING_SENSOR_IDS.right, 0)

    return (
        <div>
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className='h-full w-full'
            >
                <SensorSector
                    value={leftSensorValue ?? 0}
                    startAngle={-MID_SENSOR_ANGLE / 2 - SPACING - SIDE_SENSOR_ANGLE}
                    endAngle={-MID_SENSOR_ANGLE / 2 - SPACING}
                    centerX={WIDTH / 2}
                    centerY={HEIGHT + SECTOR_HEIGHT}
                />

                <SensorSector
                    value={midSensorValue ?? 0}
                    startAngle={-MID_SENSOR_ANGLE / 2}
                    endAngle={MID_SENSOR_ANGLE / 2}
                    centerX={WIDTH / 2}
                    centerY={HEIGHT + SECTOR_HEIGHT}
                />

                <SensorSector
                    value={rightSensorValue ?? 0}
                    startAngle={MID_SENSOR_ANGLE / 2 + SPACING}
                    endAngle={MID_SENSOR_ANGLE / 2 + SPACING + SIDE_SENSOR_ANGLE}
                    centerX={WIDTH / 2}
                    centerY={HEIGHT + SECTOR_HEIGHT}
                />
            </svg>
        </div>
    )
}
export default ParkingSensors
