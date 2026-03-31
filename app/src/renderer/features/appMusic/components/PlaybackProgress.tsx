import { useEffect, useState } from 'react'

import { formatTime } from '@renderer/features/appMusic/utils/formatTime'
import type { Status } from '@shared/types/mediaPlayer'

const UPDATE_INTERVAL = 1000

interface PlaybackProgressProps {
    position: number | null
    duration: number | null
    status: Status | null
}

const PlaybackProgress = ({ position, duration, status }: PlaybackProgressProps) => {
    const [currentPosition, setCurrentPosition] = useState<number | null>(position)

    useEffect(() => {
        setCurrentPosition(position)

        if (status === 'playing') {
            const interval = setInterval(() => {
                setCurrentPosition(prev => {
                    if (prev === null || duration === null) return prev
                    return Math.min(prev + UPDATE_INTERVAL, duration)
                })
            }, UPDATE_INTERVAL)
            return () => clearInterval(interval)
        }

        setCurrentPosition(position)
    }, [position, status, duration])

    return (
        <div className='flex w-full items-center justify-center gap-4'>
            <span className='text-xl font-bold text-white/75'>{formatTime(currentPosition ?? 0)}</span>
            <div className='h-3 w-full overflow-hidden rounded-full bg-white/25'>
                {currentPosition !== null && duration !== null && (
                    <div
                        className='h-full rounded-full bg-white'
                        style={{
                            width: `${(currentPosition / duration) * 100}%`,
                            transition: `width ${UPDATE_INTERVAL}ms linear`,
                        }}
                    ></div>
                )}
            </div>
            <span className='text-xl font-bold text-white/75'>{formatTime(duration ?? 0)}</span>
        </div>
    )
}
export default PlaybackProgress
