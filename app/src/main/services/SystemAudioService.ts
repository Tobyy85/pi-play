import { type BrowserWindow, ipcMain } from 'electron'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import type { Volume } from '@shared/types/systemAudio'

const execFileAsync = promisify(execFile) // eslint-disable-line @typescript-eslint/strict-void-return

class SystemAudioService {
    private static readonly STEP_SIZE = 5
    private static readonly DEFAULT_AUDIO_SINK = '@DEFAULT_AUDIO_SINK@'

    private readonly getWindow: () => BrowserWindow | null

    constructor(getWindow: () => BrowserWindow | null) {
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
        await SystemAudioService.runCommand('wpctl', [
            'set-volume',
            SystemAudioService.DEFAULT_AUDIO_SINK,
            `${absoluteStep * SystemAudioService.STEP_SIZE}%${direction}`,
            '--limit=1.0',
        ])
        await SystemAudioService.runCommand('wpctl', ['set-mute', SystemAudioService.DEFAULT_AUDIO_SINK, '0'])
        await this.sendVolumeUpdate()
    }

    public async toggleMute(): Promise<void> {
        await SystemAudioService.runCommand('wpctl', [
            'set-mute',
            SystemAudioService.DEFAULT_AUDIO_SINK,
            'toggle',
        ])
        await this.sendVolumeUpdate()
    }

    private static async getVolume(): Promise<Volume | null> {
        try {
            const { stdout } = await execFileAsync('wpctl', [
                'get-volume',
                SystemAudioService.DEFAULT_AUDIO_SINK,
            ])

            const isMuted = stdout.includes('MUTED')
            const numericValue = /[\d.]+/u.exec(stdout)
            const volumePercent = numericValue ? parseFloat(numericValue[0]) : NaN
            if (isNaN(volumePercent)) {
                console.warn(`[SystemAudioService]: Unable to parse volume from output: ${stdout}`)
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

    private static async runCommand(command: string, args: string[]): Promise<void> {
        try {
            await execFileAsync(command, args)
        } catch (error: unknown) {
            console.error(`[SystemAudioService]: Failed to run ${command} ${args.join(' ')}: `, error)
        }
    }
}

export default SystemAudioService
