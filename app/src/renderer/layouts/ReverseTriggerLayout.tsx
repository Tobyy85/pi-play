import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { IS_REVERSE_SENSOR_ID } from '@renderer/features/arduino/constants/arduinoSensorIds'
import useArduinoSensor from '@renderer/features/arduino/hooks/useArduinoSensor'

const ReverseTriggerLayout = () => {
    const { value: isReversing } = useArduinoSensor<boolean>(IS_REVERSE_SENSOR_ID, null)
    const navigate = useNavigate()
    const location = useLocation()

    const previousPath = useRef<string | null>(null)

    const REVERSE_PATH = '/apps/reverse-camera'

    useEffect(() => {
        if (isReversing) {
            if (location.pathname !== REVERSE_PATH) {
                previousPath.current = location.pathname
                void navigate(REVERSE_PATH, { replace: true })
            }
        } else if (location.pathname === REVERSE_PATH && previousPath.current) {
            void navigate(previousPath.current, { replace: true })
            previousPath.current = null
        }
    }, [isReversing, navigate, location.pathname])

    return <Outlet />
}

export default ReverseTriggerLayout
