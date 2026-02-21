import { useEffect, useState } from 'react'

import NowPlaying from '@renderer/features/appMusic/components/NowPlaying'
import PlaybackControls from '@renderer/features/appMusic/components/PlaybackControls'
import PlaybackProgress from '@renderer/features/appMusic/components/PlaybackProgress'

import GradientBackground from '@renderer/features/appMusic/components/GradientBackground'

import type { Position, Status, TrackInfo } from '@shared/types/mediaPlayer'

export const AppMusicBackground = () => {
    const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null)

    useEffect(() => {
        window.api.mediaPlayer.trackInfo.get().then(setTrackInfo).catch(console.error)

        const unsubscribeTrackInfo = window.api.mediaPlayer.trackInfo.subscribe(setTrackInfo)
        return () => {
            unsubscribeTrackInfo()
        }
    }, [])

    return <GradientBackground trackInfo={trackInfo} />
}

export const AppMusicContent = () => {
    const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null)
    const [status, setStatus] = useState<Status | null>(null)
    const [position, setPosition] = useState<Position | null>(null)

    useEffect(() => {
        window.api.mediaPlayer.playbackStatus.get().then(setStatus).catch(console.error)
        window.api.mediaPlayer.trackInfo.get().then(setTrackInfo).catch(console.error)
        window.api.mediaPlayer.position.get().then(setPosition).catch(console.error)

        const unsubscribePlaybackStatus = window.api.mediaPlayer.playbackStatus.subscribe(setStatus)
        const unsubscribeTrackInfo = window.api.mediaPlayer.trackInfo.subscribe(setTrackInfo)
        const unsubscribePosition = window.api.mediaPlayer.position.subscribe(setPosition)

        return () => {
            unsubscribePlaybackStatus()
            unsubscribeTrackInfo()
            unsubscribePosition()
        }
    }, [])

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
