import {
    usePlaybackStatus,
    usePosition,
    useTrackInfo,
} from '@renderer/features/appMusic/hooks/useMediaPlayerData'

import NowPlaying from '@renderer/features/appMusic/components/NowPlaying'
import PlaybackControls from '@renderer/features/appMusic/components/PlaybackControls'
import PlaybackProgress from '@renderer/features/appMusic/components/PlaybackProgress'

import GradientBackground from '@renderer/features/appMusic/components/GradientBackground'

export const AppMusicBackground = () => {
    const { data: trackInfo, isLoading } = useTrackInfo()

    if (isLoading) {
        return null
    }

    return <GradientBackground trackInfo={trackInfo} />
}

export const AppMusicContent = () => {
    const { data: trackInfo } = useTrackInfo()
    const { data: status } = usePlaybackStatus()
    const { data: position } = usePosition()

    return (
        <div className='flex size-full flex-col items-center justify-center py-2 pr-8'>
            <NowPlaying trackInfo={trackInfo} />
            <div className='flex w-full flex-col items-center justify-end gap-8'>
                <PlaybackControls
                    status={status}
                    onPlay={window.api.mediaPlayer.actions.play}
                    onPause={window.api.mediaPlayer.actions.pause}
                    onNext={window.api.mediaPlayer.actions.next}
                    onPrevious={window.api.mediaPlayer.actions.previous}
                />
                <PlaybackProgress
                    position={position}
                    duration={trackInfo ? trackInfo.duration : null}
                    status={status}
                />
            </div>
        </div>
    )
}
