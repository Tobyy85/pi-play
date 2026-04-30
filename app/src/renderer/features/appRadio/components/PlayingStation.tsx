import { FaArrowLeft, FaPause, FaPlay } from 'react-icons/fa6'

import FadeText from '@renderer/components/FadeText'

import { setIsPlaying, useIsPlaying } from '@renderer/features/appRadio/store/useRadioStore'
import type { RadioStation } from '@renderer/features/appRadio/types'

interface PlayingStationProps {
    station: RadioStation
    goBack: () => void
}

const PlayingStation = ({ station, goBack }: PlayingStationProps) => {
    const isPlaying = useIsPlaying()

    return (
        <div className='relative size-full'>
            <button
                className='absolute top-4 left-0 size-8'
                onClick={goBack}
            >
                <FaArrowLeft className='size-full text-white/80' />
            </button>
            <div className='flex size-full flex-col items-center justify-center gap-4'>
                <div className='relative size-24 overflow-hidden rounded-2xl'>
                    {station.icon && (
                        <img
                            className='size-full brightness-90'
                            src={station.icon}
                        />
                    )}
                    <button
                        className='absolute top-1/2 left-1/2 size-16 -translate-1/2 rounded-full'
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {isPlaying ? (
                            <FaPause className='size-full text-white' />
                        ) : (
                            <FaPlay className='size-full text-white' />
                        )}
                    </button>
                </div>
                <FadeText
                    fadeWidth={'4rem'}
                    className='text-center text-8xl/tight font-black text-white'
                >
                    {station.name}
                </FadeText>
            </div>
        </div>
    )
}
export default PlayingStation
