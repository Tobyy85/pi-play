import React, { useRef } from 'react'

interface LongPressWrapperProps {
    children: React.ReactNode
    onLongPress: () => void
    pressDuration: number
}

const LongPressWrapper = ({ children, onLongPress, pressDuration: delay }: LongPressWrapperProps) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const triggeredRef = useRef(false)

    const start = () => {
        triggeredRef.current = false

        timerRef.current = setTimeout(() => {
            triggeredRef.current = true
            onLongPress()
        }, delay)
    }

    const stop = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }

    return (
        <div
            style={{ display: 'inline-block' }}
            onMouseDown={start}
            onMouseUp={stop}
            onMouseLeave={stop}
            onTouchStart={start}
            onTouchEnd={stop}
        >
            {children}
        </div>
    )
}

export default LongPressWrapper
