import useIpcData, { type UseIpcDataReturn } from '@renderer/hooks/useIpcData'

import type { Position, Status, TrackInfo } from '@shared/types/mediaPlayer'

export const useTrackInfo = (): UseIpcDataReturn<TrackInfo> =>
    useIpcData<TrackInfo>(
        async () => await window.api.mediaPlayer.trackInfo.get(),
        callback => window.api.mediaPlayer.trackInfo.subscribe(callback)
    )

export const usePlaybackStatus = (): UseIpcDataReturn<Status> =>
    useIpcData<Status>(
        async () => await window.api.mediaPlayer.playbackStatus.get(),
        callback => window.api.mediaPlayer.playbackStatus.subscribe(callback)
    )

export const usePosition = (): UseIpcDataReturn<Position> =>
    useIpcData<Position>(
        async () => await window.api.mediaPlayer.position.get(),
        callback => window.api.mediaPlayer.position.subscribe(callback)
    )
