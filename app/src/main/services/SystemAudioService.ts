import { ipcMain } from 'electron'

import type { WindowProvider } from '@main/types/window'
import { runCommand } from '@main/utils/runCommand'
import type { Volume } from '@shared/types/systemAudio'

class SystemAudioService {
    private static readonly STEP_SIZE = 5
    private static readonly DEFAULT_AUDIO_SINK = '@DEFAULT_AUDIO_SINK@'

    private readonly getWindow: WindowProvider

    constructor(getWindow: WindowProvider) {
        this.getWindow = getWindow
    }

    public static registerIpcHandlers(): void {
        ipcMain.handle('systemAudio:getVolume', async () => {
            return await SystemAudioService.getVolume()
        })
    }

    public async stepVolume(stepPercent: number): Promise<void> {
        const roundedStep = Math.trunc(stepPercent)
        const absoluteStep = Math.abs(roundedStep)

        if (absoluteStep === 0) {
            return
        }

        const direction = roundedStep > 0 ? '+' : '-'
        await runCommand('wpctl', [
            'set-volume',
            SystemAudioService.DEFAULT_AUDIO_SINK,
            `${absoluteStep * SystemAudioService.STEP_SIZE}%${direction}`,
            '--limit=1.0',
        ])
        await runCommand('wpctl', ['set-mute', SystemAudioService.DEFAULT_AUDIO_SINK, '0'])
        await this.sendVolumeUpdate()
    }

    public async toggleMute(): Promise<void> {
        await runCommand('wpctl', ['set-mute', SystemAudioService.DEFAULT_AUDIO_SINK, 'toggle'])
        await this.sendVolumeUpdate()
    }

    private static async getVolume(): Promise<Volume | null> {
        try {
            const commandResult = await runCommand('wpctl', [
                'get-volume',
                SystemAudioService.DEFAULT_AUDIO_SINK,
            ])

            if (commandResult === null) {
                console.warn('[SystemAudioService]: No output from wpctl get-volume command')
                return null
            }

            const isMuted = commandResult.stdout.includes('MUTED')
            const numericValue = /[\d.]+/u.exec(commandResult.stdout)
            const volumePercent = numericValue ? parseFloat(numericValue[0]) : NaN
            if (isNaN(volumePercent)) {
                console.warn(
                    `[SystemAudioService]: Unable to parse volume from output: ${commandResult.stdout}`
                )
                return null
            }

            return {
                value: Math.round(volumePercent * 100),
                isMuted,
            }
        } catch (error: unknown) {
            console.error('[SystemAudioService]: Failed to get volume: ', error)
            return null
        }
    }

    private async sendVolumeUpdate(): Promise<void> {
        const volume = await SystemAudioService.getVolume()
        if (volume !== null) {
            this.getWindow()?.webContents.send('systemAudio:volume', volume)
        }
    }
}

export default SystemAudioService
