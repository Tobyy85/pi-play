import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile) // eslint-disable-line @typescript-eslint/strict-void-return

interface CommandResult {
    stdout: string
    stderr: string
}

export const runCommand = async (command: string, args: string[]): Promise<CommandResult | null> => {
    try {
        return await execFileAsync(command, args)
    } catch (error: unknown) {
        console.error(`Failed to run ${command} ${args.join(' ')}: `, error, '\n\n')
        return null
    }
}
