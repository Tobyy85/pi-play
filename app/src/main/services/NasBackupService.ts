import { spawn } from 'node:child_process'
import { readdir } from 'node:fs/promises'

import { runCommand } from '@main/utils/runCommand'
import { NAS_DESTINATION_PATH } from '@shared/config/nasBackup'
import { DASHCAM_RECORDINGS_PATH } from '@shared/config/storage'
import type { NasBackupCredentials } from '@shared/types/nasBackup'

class NasBackupService {
    private static readonly WIFI_CHECK_MS = 30000

    private readonly credentials: NasBackupCredentials | null
    private readonly allowedSsids: string[]

    private rsyncProcess: ReturnType<typeof spawn> | null = null
    private wifiCheckInterval: NodeJS.Timeout | null = null

    private isBackupActive = false

    constructor() {
        const credentials = NasBackupService.getNasCredentials()
        if (!credentials) {
            console.warn(
                '[NasBackupService]: NAS credentials are not set. Please check environment variables.'
            )
        }
        this.credentials = credentials

        const allowedSsids = NasBackupService.getAllowedSsids()
        if (allowedSsids.length === 0) {
            console.warn(
                '[NasBackupService]: No allowed SSIDs configured. NAS backup over Wi-Fi will be disabled.'
            )
        }
        this.allowedSsids = allowedSsids
    }

    public initialize(): void {
        void this.backupIfAllowed()

        this.wifiCheckInterval = setInterval(() => {
            void this.backupIfAllowed()
        }, NasBackupService.WIFI_CHECK_MS)
    }

    public disconnect(): void {
        this.rsyncProcess?.kill()
        this.rsyncProcess = null
        this.isBackupActive = false

        if (this.wifiCheckInterval) {
            clearInterval(this.wifiCheckInterval)
            this.wifiCheckInterval = null
        }
    }

    private async backupIfAllowed(): Promise<void> {
        const activeSsid = await NasBackupService.getActiveWifiSsid()
        const isAllowedSsid = activeSsid && this.allowedSsids.includes(activeSsid)

        if (!isAllowedSsid) return

        if (!(await NasBackupService.hasFilesToBackup())) return

        this.startRsyncBackup()
    }

    private startRsyncBackup(): void {
        if (this.isBackupActive) {
            return
        }

        const rsyncArgs = this.getRsyncArguments()
        if (!rsyncArgs) {
            return
        }
        this.rsyncProcess = spawn('rsync', rsyncArgs)
        this.isBackupActive = true

        this.rsyncProcess.on('close', code => {
            this.isBackupActive = false
            if (code !== 0) {
                console.error(`[NasBackupService]: rsync process exited with code ${code}`)
            }
        })

        this.rsyncProcess.on('error', err => {
            this.isBackupActive = false
            console.error(`[NasBackupService]: Failed to start rsync process: ${err}`)
        })

        this.rsyncProcess.stderr?.on('data', data => {
            console.error(`[NasBackupService]: Rsync error: ${data}`)
        })
    }

    private getRsyncArguments(): string[] | null {
        if (!this.credentials) {
            console.error(
                '[NasBackupService]: Cannot get rsync arguments because NAS credentials are missing.'
            )
            return null
        }

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

    private static async hasFilesToBackup(): Promise<boolean> {
        try {
            const entries = await readdir(DASHCAM_RECORDINGS_PATH, {
                withFileTypes: true,
                recursive: true,
            })

            for (const entry of entries) {
                if (entry.isFile() && !entry.name.endsWith('.tmp')) {
                    return true
                }
            }

            return false
        } catch (error) {
            console.error(`[NasBackupService]: Failed to read dashcam recordings directory: ${String(error)}`)
            return false
        }
    }

    private static getNasCredentials(): NasBackupCredentials | null {
        const host = process.env.NAS_HOST
        const username = process.env.NAS_USERNAME

        if (!host || !username) {
            return null
        }

        return { host, username }
    }

    private static getAllowedSsids(): string[] {
        const configuredSsids = process.env.NAS_BACKUP_ALLOWED_SSIDS
        if (!configuredSsids) {
            console.warn(
                '[NasBackupService]: NAS_BACKUP_ALLOWED_SSIDS is not set. NAS backup over Wi-Fi is disabled.'
            )
            return []
        }

        return configuredSsids
            .split(',')
            .map(ssid => ssid.trim())
            .filter(ssid => ssid.length > 0)
    }

    private static async getActiveWifiSsid(): Promise<string | null> {
        const commandResult = await runCommand('nmcli', ['-t', '-f', 'ACTIVE,SSID', 'dev', 'wifi'])
        if (!commandResult || commandResult.stderr) {
            console.error('[NasBackupService]: Failed to get current Wi-Fi SSID via nmcli.')
            return null
        }

        const activeWifiLine = commandResult.stdout.split('\n').find(line => line.startsWith('yes:'))
        if (!activeWifiLine) {
            console.warn('[NasBackupService]: No active Wi-Fi connection found.')
            return null
        }

        const ssid = activeWifiLine.split(':')[1].trim()
        return ssid
    }
}

export default NasBackupService
