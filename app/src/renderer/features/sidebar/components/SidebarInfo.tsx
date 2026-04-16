import DisplayTemperature from '@renderer/components/DisplayTemperature'
import DisplayTime from '@renderer/components/DisplayTime'
import SidebarInfoText from '@renderer/features/sidebar/components/SidebarInfoText'

import { TEMPERATURE_SENSOR_ID } from '@shared/config/arduinoSensorIds'

const SidebarInfo = () => {
    return (
        <>
            <div className='align-center flex flex-col'>
                <SidebarInfoText>
                    <DisplayTime />
                </SidebarInfoText>
                <SidebarInfoText className='my-[-0.25rem]'>
                    <DisplayTemperature sensorId={TEMPERATURE_SENSOR_ID} />
                </SidebarInfoText>
            </div>
        </>
    )
}
export default SidebarInfo
