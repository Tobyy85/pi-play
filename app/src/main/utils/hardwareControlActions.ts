import type CallService from '@main/services/CallService'
import type MediaPlayerService from '@main/services/MediaPlayerService'

export interface HardwareControlActions {
    onVolumeEncoder: (step: number) => Promise<void>
    onPlayPause: () => Promise<void>
    onPreviousTrack: () => Promise<void>
    onNextTrack: () => Promise<void>
    onAnswerCall: () => Promise<void>
    onHangup: () => Promise<void>
}

export const getHardwareControlActions = (
    mediaPlayerService: MediaPlayerService,
    callService: CallService
): HardwareControlActions => ({
    onVolumeEncoder: async step => {
        void step // TODO: Implement volume control
    },
    onPlayPause: async () => {
        await mediaPlayerService.togglePlayPause()
    },
    onPreviousTrack: async () => {
        await mediaPlayerService.previous()
    },
    onNextTrack: async () => {
        await mediaPlayerService.next()
    },
    onAnswerCall: async () => {
        await callService.answer()
    },
    onHangup: async () => {
        await callService.hangup()
    },
})
