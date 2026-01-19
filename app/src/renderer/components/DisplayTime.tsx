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
        // Calculate milliseconds until the next minute starts
        // This ensures the time updates at the start of each minute
        const msToNextMinute = msInMinute - (Date.now() % msInMinute)

        const timeoutId = setTimeout(() => {
            setTime(getCurrentFormattedTime())

            const intervalId = setInterval(() => {
                setTime(getCurrentFormattedTime())
            }, msInMinute)

            return () => clearInterval(intervalId)
        }, msToNextMinute)

        return () => clearTimeout(timeoutId)
    }, [])

    return <>{time}</>
}
export default DisplayTime
