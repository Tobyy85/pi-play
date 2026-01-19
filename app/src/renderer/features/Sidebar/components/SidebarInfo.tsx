import DisplayTemperature from '@renderer/components/DisplayTemperature'
import DisplayTime from '@renderer/components/DisplayTime'

import { TEMPERATURE_SENSOR_ID } from '@renderer/features/arduino/constants/arduinoSensorIds'

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

interface SidebarInfoTextProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode
    props?: React.HTMLAttributes<HTMLSpanElement>
}
const SidebarInfoText = ({ children, ...props }: SidebarInfoTextProps) => {
    return (
        <span className={`text-center text-2xl font-bold text-white ${props.className ?? ''}`}>
            {children}
        </span>
    )
}
