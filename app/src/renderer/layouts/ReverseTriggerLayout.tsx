import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { IS_REVERSE_SENSOR_ID } from '@renderer/features/arduino/constants/arduinoSensorIds'
import useArduinoSensor from '@renderer/features/arduino/hooks/useArduinoSensor'

const ReverseTriggerLayout = () => {
    const { value: isReversingString } = useArduinoSensor(IS_REVERSE_SENSOR_ID, null)
    const isReversing = Boolean(Number(isReversingString))
    const navigate = useNavigate()
    const location = useLocation()

    const previousPath = useRef<string | null>(null)

    const REVERSE_PATH = '/apps/reverse-camera'

    useEffect(() => {
        if (isReversing) {
            if (location.pathname !== REVERSE_PATH) {
                previousPath.current = location.pathname
                navigate(REVERSE_PATH, { replace: true })
            }
        } else if (location.pathname === REVERSE_PATH && previousPath.current) {
            navigate(previousPath.current, { replace: true })
            previousPath.current = null
        }
    }, [isReversing, navigate, location.pathname])

    return <Outlet />
}

export default ReverseTriggerLayout
