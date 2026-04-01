import { useEffect, useState } from 'react'

const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

const getCurrentFormattedTime = () => {
    return formatTime(new Date())
}

const msInMinute = 60_000
const DisplayTime = () => {
    const [time, setTime] = useState(getCurrentFormattedTime())

    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval> | undefined

        // Calculate milliseconds until the next minute starts
        // This ensures the time updates at the start of each minute
        const msToNextMinute = msInMinute - (Date.now() % msInMinute)

        const timeoutId = setTimeout(() => {
            setTime(getCurrentFormattedTime())

            intervalId = setInterval(() => {
                setTime(getCurrentFormattedTime())
            }, msInMinute)
        }, msToNextMinute)

        return () => {
            clearTimeout(timeoutId)
            if (intervalId) {
                clearInterval(intervalId)
            }
        }
    }, [])

    return <>{time}</>
}
export default DisplayTime
