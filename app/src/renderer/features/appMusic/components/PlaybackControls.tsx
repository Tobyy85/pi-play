import { FaBackwardStep, FaForwardStep, FaPause, FaPlay } from 'react-icons/fa6'

import type { Status } from '@shared/types/mediaPlayer'

interface PlaybackControlsProps {
    status: Status | null
    onPlay: () => void
    onPause: () => void
    onNext: () => void
    onPrevious: () => void
}

const PlaybackControls = ({ status, onPlay, onPause, onNext, onPrevious }: PlaybackControlsProps) => {
    return (
        <div className='flex justify-center gap-24'>
            <button
                className='size-24'
                onClick={onPrevious}
            >
                <FaBackwardStep className='size-full fill-white' />
            </button>
            <button
                className='size-24'
                onClick={status === 'playing' ? onPause : onPlay}
            >
                {status === 'playing' ? (
                    <FaPause className='size-full fill-white' />
                ) : (
                    <FaPlay className='size-full fill-white' />
                )}
            </button>
            <button
                className='size-24'
                onClick={onNext}
            >
                <FaForwardStep className='size-full fill-white' />
            </button>
        </div>
    )
}
export default PlaybackControls
