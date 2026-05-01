/* eslint-disable max-lines */

import { CAMERA_CONFIG } from '@shared/config/camera'
import { DASHCAM_RECORDINGS_PATH } from '@shared/config/storage'
import type { CameraDefinition } from '@shared/types/camera'
import { spawn, type ChildProcess } from 'child_process'
import { ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'

interface CameraRuntime {
    definition: CameraDefinition
    ffmpegProcess: ChildProcess | null
    pauseLocks: number
    shouldRecord: boolean
    isStopping: boolean
    operationQueue: Promise<void>
    tempFinalizeInterval: ReturnType<typeof setInterval> | null
}

const FORCE_KILL_TIMEOUT_MS = 3000
const FORCE_KILL_EXIT_GRACE_MS = 1000
const RESTART_DELAY_MS = 800
const TMP_SUFFIX = '.tmp'
const TEMP_FILE_FINALIZE_INTERVAL_MS = 1000
class CameraRecordingService {
    private readonly cameraRuntimes: Map<string, CameraRuntime> = new Map()

    constructor() {
        for (const camera of CAMERA_CONFIG.cameras) {
            this.cameraRuntimes.set(camera.name, {
                definition: camera,
                ffmpegProcess: null,
                pauseLocks: 0,
                shouldRecord: false,
                isStopping: false,
                operationQueue: Promise.resolve(),
                tempFinalizeInterval: null,
            })
        }
    }

    public registerIpcHandlers(): void {
        ipcMain.handle('camera:pauseRecording', async (_event, cameraName: string) => {
            await this.enqueueOperation(cameraName, async runtime => {
                runtime.pauseLocks += 1
                runtime.shouldRecord = false
                await CameraRecordingService.stopRecording(runtime)
            })
        })

        ipcMain.handle('camera:resumeRecording', async (_event, cameraName: string) => {
            await this.enqueueOperation(cameraName, runtime => {
                if (runtime.pauseLocks > 0) {
                    runtime.pauseLocks -= 1
                } else {
                    console.warn(
                        `[CameraRecordingService]: Resume called for camera ${cameraName} without active pause lock.`
                    )
                }

                if (runtime.pauseLocks > 0) {
                    return
                }

                runtime.shouldRecord = true
                this.startRecording(cameraName, runtime)
            })
        })
    }

    public initialize(): void {
        for (const camera of CAMERA_CONFIG.cameras) {
            void this.enqueueOperation(camera.name, runtime => {
                runtime.shouldRecord = true
                this.startRecording(camera.name, runtime)
            })
        }
    }

    public async disconnect(): Promise<void> {
        const stopTasks = Array.from(this.cameraRuntimes.keys()).map(async cameraName => {
            await this.enqueueOperation(cameraName, async runtime => {
                runtime.shouldRecord = false
                runtime.pauseLocks = 0
                await CameraRecordingService.stopRecording(runtime)
            })
        })

        await Promise.allSettled(stopTasks)
    }

    private startRecording(cameraName: string, runtime: CameraRuntime): void {
        if (!runtime.shouldRecord || runtime.pauseLocks > 0) {
            return
        }
        if (runtime.ffmpegProcess && !runtime.ffmpegProcess.killed) {
            return
        }
        const outputDirectory = CameraRecordingService.getOutputDirectory(cameraName)
        fs.mkdirSync(outputDirectory, { recursive: true })
        CameraRecordingService.promoteCompletedTempSegments(outputDirectory, true)
        const ffmpegArgs = CameraRecordingService.createFfmpegArgs(runtime.definition, outputDirectory)
        const ffmpegProcess = spawn(CAMERA_CONFIG.ffmpegBinary, ffmpegArgs, {
            stdio: ['ignore', 'ignore', 'pipe'],
        })
        runtime.ffmpegProcess = ffmpegProcess
        runtime.isStopping = false
        CameraRecordingService.startTempFinalizeLoop(runtime, outputDirectory)
        this.registerProcessHandlers(cameraName, runtime, outputDirectory, ffmpegProcess)
    }

    private registerProcessHandlers(
        cameraName: string,
        runtime: CameraRuntime,
        outputDirectory: string,
        ffmpegProcess: ChildProcess
    ): void {
        ffmpegProcess.stderr?.on('data', (data: Buffer) => {
            const errorMessage = data.toString().trim()
            if (!errorMessage) {
                return
            }
            console.error(
                `[CameraRecordingService]: Camera ${cameraName} ffmpeg error: `,
                errorMessage,
                '\n\n'
            )
        })
        ffmpegProcess.on('error', error => {
            CameraRecordingService.stopTempFinalizeLoop(runtime)
            runtime.ffmpegProcess = null
            console.error(`[CameraRecordingService]: Camera ${cameraName} process error: `, error, '\n\n')
        })

        ffmpegProcess.on('exit', (code, signal) => {
            CameraRecordingService.stopTempFinalizeLoop(runtime)
            runtime.ffmpegProcess = null
            const isStoppingExit = runtime.isStopping
            runtime.isStopping = false
            CameraRecordingService.promoteCompletedTempSegments(outputDirectory, true)
            if (code !== 0 && signal !== 'SIGTERM' && !isStoppingExit) {
                console.error(
                    `[CameraRecordingService]: Camera ${cameraName} ffmpeg exited with code ${code} and signal ${signal ?? 'none'}`
                )
            }

            if (!isStoppingExit && runtime.shouldRecord && runtime.pauseLocks === 0) {
                setTimeout(() => {
                    void this.enqueueOperation(cameraName, queuedRuntime => {
                        this.startRecording(cameraName, queuedRuntime)
                    })
                }, RESTART_DELAY_MS)
            }
        })
    }

    private static async stopRecording(runtime: CameraRuntime): Promise<void> {
        const { ffmpegProcess } = runtime
        if (!ffmpegProcess || ffmpegProcess.killed) {
            CameraRecordingService.stopTempFinalizeLoop(runtime)
            runtime.ffmpegProcess = null
            runtime.isStopping = false
            CameraRecordingService.promoteCompletedTempSegments(
                CameraRecordingService.getOutputDirectory(runtime.definition.name),
                true
            )
            return
        }

        runtime.isStopping = true
        CameraRecordingService.stopTempFinalizeLoop(runtime)

        await new Promise<void>(resolve => {
            let isSettled = false
            let forceKillTimer: ReturnType<typeof setTimeout> | null = null
            let exitGraceTimer: ReturnType<typeof setTimeout> | null = null

            const finalize = (): void => {
                if (isSettled) {
                    return
                }

                isSettled = true
                if (forceKillTimer) {
                    clearTimeout(forceKillTimer)
                }
                if (exitGraceTimer) {
                    clearTimeout(exitGraceTimer)
                }
                resolve()
            }

            forceKillTimer = setTimeout(() => {
                if (!ffmpegProcess.killed) {
                    ffmpegProcess.kill('SIGKILL')
                }
            }, FORCE_KILL_TIMEOUT_MS)

            exitGraceTimer = setTimeout(() => {
                finalize()
            }, FORCE_KILL_TIMEOUT_MS + FORCE_KILL_EXIT_GRACE_MS)

            ffmpegProcess.once('exit', () => {
                finalize()
            })
            ffmpegProcess.kill('SIGTERM')
        })

        CameraRecordingService.promoteCompletedTempSegments(
            CameraRecordingService.getOutputDirectory(runtime.definition.name),
            true
        )
    }

    private async enqueueOperation(
        cameraName: string,
        operation: (runtime: CameraRuntime) => Promise<void> | void
    ): Promise<void> {
        const runtime = this.getRuntime(cameraName)
        if (!runtime) {
            return
        }
        runtime.operationQueue = runtime.operationQueue
            .then(async () => {
                await operation(runtime)
            })
            .catch((error: unknown) => {
                console.error(
                    `[CameraRecordingService]: Camera ${cameraName} operation failed: `,
                    error,
                    '\n\n'
                )
            })

        await runtime.operationQueue
    }

    private static createFfmpegArgs(definition: CameraDefinition, outputDirectory: string): string[] {
        const segmentPattern = path.join(outputDirectory, `%Y%m%d-%H%M%S.mp4${TMP_SUFFIX}`)
        return [
            ...CameraRecordingService.createInputArgs(definition),
            ...CameraRecordingService.createRecordingArgs(segmentPattern),
        ]
    }

    private static startTempFinalizeLoop(runtime: CameraRuntime, outputDirectory: string): void {
        CameraRecordingService.stopTempFinalizeLoop(runtime)
        runtime.tempFinalizeInterval = setInterval(() => {
            CameraRecordingService.promoteCompletedTempSegments(outputDirectory, false)
        }, TEMP_FILE_FINALIZE_INTERVAL_MS)
    }

    private static stopTempFinalizeLoop(runtime: CameraRuntime): void {
        if (!runtime.tempFinalizeInterval) {
            return
        }
        clearInterval(runtime.tempFinalizeInterval)
        runtime.tempFinalizeInterval = null
    }

    private static promoteCompletedTempSegments(outputDirectory: string, includeNewest: boolean): void {
        let tempFiles: string[]
        try {
            tempFiles = fs
                .readdirSync(outputDirectory, { withFileTypes: true })
                .filter(entry => entry.isFile() && entry.name.endsWith(TMP_SUFFIX))
                .map(entry => entry.name)
        } catch {
            return
        }

        if (tempFiles.length === 0) {
            return
        }

        tempFiles.sort((a, b) => {
            const aPath = path.join(outputDirectory, a)
            const bPath = path.join(outputDirectory, b)
            const aTime = fs.statSync(aPath).mtimeMs
            const bTime = fs.statSync(bPath).mtimeMs
            return aTime - bTime
        })

        const filesToPromote = includeNewest ? tempFiles : tempFiles.slice(0, -1)
        for (const tempFileName of filesToPromote) {
            const tempFilePath = path.join(outputDirectory, tempFileName)
            const finalFilePath = path.join(outputDirectory, tempFileName.slice(0, -TMP_SUFFIX.length))
            try {
                if (fs.existsSync(finalFilePath)) {
                    fs.rmSync(tempFilePath, { force: true })
                } else {
                    fs.renameSync(tempFilePath, finalFilePath)
                }
            } catch (error: unknown) {
                console.error(
                    `[CameraRecordingService]: Failed to promote temp segment ${tempFilePath}: `,
                    error,
                    '\n\n'
                )
            }
        }
    }

    private static createInputArgs(definition: CameraDefinition): string[] {
        return [
            '-hide_banner',
            '-loglevel',
            'error',
            '-f',
            'v4l2',
            '-thread_queue_size',
            '1024',
            '-framerate',
            `${definition.fps}`,
            '-video_size',
            `${definition.width}x${definition.height}`,
            '-i',
            definition.devicePath,
            '-an',
        ]
    }

    private static createRecordingArgs(segmentPattern: string): string[] {
        return [
            '-map',
            '0:v',
            '-c:v',
            'libx264',
            '-preset',
            'ultrafast',
            '-tune',
            'zerolatency',
            '-pix_fmt',
            'yuv420p',
            '-f',
            'segment',
            '-segment_time',
            `${CAMERA_CONFIG.recordingSegmentSeconds}`,
            '-reset_timestamps',
            '1',
            '-strftime',
            '1',
            '-segment_format',
            'mp4',
            segmentPattern,
        ]
    }

    private getRuntime(cameraName: string): CameraRuntime | null {
        const runtime = this.cameraRuntimes.get(cameraName)
        if (!runtime) {
            console.error(`[CameraRecordingService]: Unknown camera name "${cameraName}"`)
            return null
        }
        return runtime
    }

    private static getOutputDirectory(cameraName: string): string {
        return path.join(DASHCAM_RECORDINGS_PATH, CameraRecordingService.sanitizeCameraName(cameraName))
    }

    private static sanitizeCameraName(cameraName: string): string {
        const sanitized = cameraName.replace(/[^a-zA-Z0-9_-]/gu, '_')
        return sanitized || 'camera'
    }
}

export default CameraRecordingService
