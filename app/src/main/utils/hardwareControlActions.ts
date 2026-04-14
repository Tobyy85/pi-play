import type CallService from '@main/services/CallService'
import type MediaPlayerService from '@main/services/MediaPlayerService'
import type SystemAudioService from '@main/services/SystemAudioService'

export interface HardwareControlActions {
    onVolumeChange: (step: number) => Promise<void>
    onMuteToggle: () => Promise<void>
    onPlayPause: () => Promise<void>
    onPreviousTrack: () => Promise<void>
    onNextTrack: () => Promise<void>
    onAnswerCall: () => Promise<void>
    onHangup: () => Promise<void>
}

export const getHardwareControlActions = (
    mediaPlayerService: MediaPlayerService,
    callService: CallService,
    systemAudioService: SystemAudioService
): HardwareControlActions => ({
    onVolumeChange: async step => {
        await systemAudioService.stepVolume(step)
    },
    onMuteToggle: async () => {
        await systemAudioService.toggleMute()
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
