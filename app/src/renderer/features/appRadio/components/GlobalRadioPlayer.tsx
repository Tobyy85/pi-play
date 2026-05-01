import { useEffect, useRef } from 'react'

import useCurrentStation from '@renderer/features/appRadio/hooks/useCurrentStation'
import useIsPlaying from '@renderer/features/appRadio/hooks/useIsPlaying'

const GlobalRadioPlayer = () => {
    const { data: currentStation } = useCurrentStation()
    const { data: isPlaying } = useIsPlaying()

    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        if (currentStation?.streamUrl) {
            audio.src = currentStation.streamUrl
            audio.preload = 'auto'
            audio.crossOrigin = 'anonymous'

            if (isPlaying) {
                const tryPlay = async () => {
                    try {
                        await audio.play()
                    } catch {
                        // Ignore autoplay rejection; user can start playback through UI later.
                    }
                }

                void tryPlay()
            }
        } else {
            audio.pause()
            audio.src = ''
        }

        return () => {
            audio.pause()
            audio.src = ''
        }
    }, [currentStation?.streamUrl, isPlaying])

    return (
        <audio
            ref={audioRef}
            data-testid='radio-audio'
            style={{ display: 'none' }}
            controls={false}
        />
    )
}

export default GlobalRadioPlayer
