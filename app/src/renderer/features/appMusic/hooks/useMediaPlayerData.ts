import useIpcData from '@renderer/hooks/useIpcData'

import type { Position, Status, TrackInfo } from '@shared/types/mediaPlayer'

export const useTrackInfo = () =>
    useIpcData<TrackInfo>(
        () => window.api.mediaPlayer.trackInfo.get(),
        callback => window.api.mediaPlayer.trackInfo.subscribe(callback)
    )

export const usePlaybackStatus = () =>
    useIpcData<Status>(
        () => window.api.mediaPlayer.playbackStatus.get(),
        callback => window.api.mediaPlayer.playbackStatus.subscribe(callback)
    )

export const usePosition = () =>
    useIpcData<Position>(
        () => window.api.mediaPlayer.position.get(),
        callback => window.api.mediaPlayer.position.subscribe(callback)
    )
