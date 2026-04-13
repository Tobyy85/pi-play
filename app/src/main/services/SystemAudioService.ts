import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile) // eslint-disable-line @typescript-eslint/strict-void-return

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class SystemAudioService {
    private static readonly STEP_SIZE = 2
    private static readonly DEFAULT_AUDIO_SINK = '@DEFAULT_AUDIO_SINK@'

    public static async stepVolume(stepPercent: number): Promise<void> {
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
    }

    public static async toggleMute(): Promise<void> {
        await SystemAudioService.runCommand('wpctl', [
            'set-mute',
            SystemAudioService.DEFAULT_AUDIO_SINK,
            'toggle',
        ])
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
