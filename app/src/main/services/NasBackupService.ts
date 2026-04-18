import { spawn } from 'node:child_process'

import { NAS_DESTINATION_PATH } from '@shared/config/nasBackup'
import { DASHCAM_RECORDINGS_PATH } from '@shared/config/storage'
import type { NasBackupCredentials } from '@shared/types/nasBackup'

class NasBackupService {
    private readonly credentials: NasBackupCredentials

    private rsyncProcess: ReturnType<typeof spawn> | null = null

    constructor() {
        const credentials = NasBackupService.getNasCredentials()
        if (!credentials) {
            throw new Error('NAS credentials are not set. Please check environment variables.')
        }
        this.credentials = credentials
    }

    public initialize(): void {
        this.startRsyncBackup()
    }

    public disconnect(): void {
        this.rsyncProcess?.kill()
    }

    private startRsyncBackup(): void {
        this.rsyncProcess = spawn('rsync', this.getRsyncArguments())

        this.rsyncProcess.on('close', code => {
            if (code !== 0) {
                console.error(`[NasBackupService]: rsync process exited with code ${code}`)
            }
        })

        this.rsyncProcess.on('error', err => {
            console.error(`[NasBackupService]: Failed to start rsync process: ${err}`)
        })

        this.rsyncProcess.stderr?.on('data', data => {
            console.error(`[NasBackupService]: Rsync error: ${data}`)
        })
    }

    private getRsyncArguments(): string[] {
        const destination = `${this.credentials.username}@${this.credentials.host}:${NAS_DESTINATION_PATH}`
        return [
            '-avz',
            '--timeout=30',
            '--delay-updates',
            '--remove-source-files',
            '--exclude=*.tmp',
            '-e',
            'ssh -o ConnectTimeout=30 -o BatchMode=yes',
            DASHCAM_RECORDINGS_PATH,
            destination,
        ]
    }

    private static getNasCredentials(): NasBackupCredentials | null {
        const host = process.env.NAS_HOST
        const username = process.env.NAS_USERNAME

        if (!host || !username) {
            return null
        }

        return { host, username }
    }
}

export default NasBackupService
