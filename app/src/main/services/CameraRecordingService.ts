import { spawn, type ChildProcessByStdio } from 'child_process'
import { ipcMain, type BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'
import type { Readable } from 'stream'

import { CAMERA_CONFIG } from '@shared/config/camera'
import { STORAGE_PATH } from '@shared/config/storage'
import type { CameraDefinition } from '@shared/types/camera'

interface CameraRuntime {
    definition: Readonly<CameraDefinition>
    ffmpegProcess: ChildProcessByStdio<null, Readable, Readable> | null
    streamBuffer: Buffer
    latestFrame: string | null
}

const FORCE_KILL_TIMEOUT_MS = 3000

class CameraRecordingService {
    private readonly getWindow: () => BrowserWindow | null
    private readonly cameraRuntimes: Map<string, CameraRuntime> = new Map()

    constructor(getWindow: () => BrowserWindow | null) {
        this.getWindow = getWindow

        for (const camera of CAMERA_CONFIG.cameras) {
            this.cameraRuntimes.set(camera.name, {
                definition: camera,
                ffmpegProcess: null,
                streamBuffer: Buffer.alloc(0),
                latestFrame: null,
            })
        }
    }

    public registerIpcHandlers(): void {
        ipcMain.handle('camera:getLatestFrame', (_event, cameraName: string) => {
            return this.getRuntime(cameraName).latestFrame
        })
    }

    public initialize(): void {
        for (const camera of CAMERA_CONFIG.cameras) {
            try {
                this.startRecording(camera.name)
            } catch (error) {
                console.error(
                    `[CameraRecordingService]: Failed to start camera "${camera.name}": `,
                    error,
                    '\n\n'
                )
            }
        }
    }

    public disconnect(): void {
        const stopTasks = Array.from(this.cameraRuntimes.keys()).map(async cameraName => {
            await this.stopRecording(cameraName)
        })

        void Promise.allSettled(stopTasks)
    }

    private startRecording(cameraName: string): void {
        const runtime = this.getRuntime(cameraName)
        if (runtime.ffmpegProcess && !runtime.ffmpegProcess.killed) {
            return
        }

        const outputDirectory = CameraRecordingService.getOutputDirectory(cameraName)
        fs.mkdirSync(outputDirectory, { recursive: true })

        const ffmpegArgs = CameraRecordingService.createFfmpegArgs(runtime.definition, outputDirectory)
        const ffmpegProcess = spawn(CAMERA_CONFIG.ffmpegBinary, ffmpegArgs, {
            stdio: ['ignore', 'pipe', 'pipe'],
        })

        runtime.ffmpegProcess = ffmpegProcess
        runtime.streamBuffer = Buffer.alloc(0)

        ffmpegProcess.stdout.on('data', (chunk: Readonly<Buffer>) => {
            this.processFrameChunk(cameraName, chunk)
        })

        ffmpegProcess.stderr.on('data', (data: Readonly<Buffer>) => {
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
            runtime.ffmpegProcess = null
            console.error(`[CameraRecordingService]: Camera ${cameraName} process error: `, error, '\n\n')
        })

        ffmpegProcess.on('exit', (code, signal) => {
            runtime.ffmpegProcess = null
            runtime.streamBuffer = Buffer.alloc(0)

            if (code !== 0 && signal !== 'SIGTERM') {
                console.error(
                    `[CameraRecordingService]: Camera ${cameraName} ffmpeg exited with code ${code} and signal ${signal ?? 'none'}`
                )
            }
        })
    }

    private async stopRecording(cameraName: string): Promise<void> {
        const { ffmpegProcess } = this.getRuntime(cameraName)
        if (!ffmpegProcess || ffmpegProcess.killed) {
            return
        }

        await new Promise<void>(resolve => {
            const forceKillTimer = setTimeout(() => {
                if (!ffmpegProcess.killed) {
                    ffmpegProcess.kill('SIGKILL')
                }
                resolve()
            }, FORCE_KILL_TIMEOUT_MS)

            ffmpegProcess.once('exit', () => {
                clearTimeout(forceKillTimer)
                resolve()
            })

            ffmpegProcess.kill('SIGTERM')
        })
    }

    private processFrameChunk(cameraName: string, chunk: Readonly<Buffer>): void {
        const JPEG_MARKER_SIZE = 2
        const JPEG_START_MARKER = Buffer.from('ffd8', 'hex')
        const JPEG_END_MARKER = Buffer.from('ffd9', 'hex')
        const MAX_STREAM_BUFFER_SIZE = 5242880

        const runtime = this.getRuntime(cameraName)
        runtime.streamBuffer = Buffer.concat([runtime.streamBuffer, chunk])

        while (runtime.streamBuffer.length > 0) {
            const frameStartIndex = runtime.streamBuffer.indexOf(JPEG_START_MARKER)
            if (frameStartIndex === -1) {
                if (runtime.streamBuffer.length > MAX_STREAM_BUFFER_SIZE) {
                    runtime.streamBuffer = Buffer.alloc(0)
                }
                return
            }

            const frameEndIndex = runtime.streamBuffer.indexOf(
                JPEG_END_MARKER,
                frameStartIndex + JPEG_MARKER_SIZE
            )

            if (frameEndIndex === -1) {
                if (frameStartIndex > 0) {
                    runtime.streamBuffer = runtime.streamBuffer.subarray(frameStartIndex)
                }
                return
            }

            const frame = runtime.streamBuffer.subarray(frameStartIndex, frameEndIndex + JPEG_MARKER_SIZE)
            runtime.streamBuffer = runtime.streamBuffer.subarray(frameEndIndex + JPEG_MARKER_SIZE)
            this.publishFrame(cameraName, frame)
        }
    }

    private publishFrame(cameraName: string, frameBuffer: Readonly<Buffer>): void {
        const runtime = this.getRuntime(cameraName)
        runtime.latestFrame = `data:image/jpeg;base64,${frameBuffer.toString('base64')}`

        this.getWindow()?.webContents.send(
            CameraRecordingService.getFrameChannel(cameraName),
            runtime.latestFrame
        )
    }

    private static createFfmpegArgs(
        definition: Readonly<CameraDefinition>,
        outputDirectory: string
    ): string[] {
        const segmentPattern = path.join(outputDirectory, '%Y%m%d-%H%M%S.mp4')
        return [
            ...CameraRecordingService.createInputArgs(definition),
            ...CameraRecordingService.createRecordingArgs(segmentPattern),
            ...CameraRecordingService.createStreamingArgs(),
        ]
    }

    private static createInputArgs(definition: Readonly<CameraDefinition>): string[] {
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

    private static createStreamingArgs(): string[] {
        return ['-map', '0:v', '-c:v', 'mjpeg', '-q:v', '6', '-f', 'image2pipe', 'pipe:1']
    }

    private getRuntime(cameraName: string): CameraRuntime {
        const runtime = this.cameraRuntimes.get(cameraName)
        if (!runtime) {
            throw new Error(`Unknown camera name "${cameraName}"`)
        }
        return runtime
    }

    private static getOutputDirectory(cameraName: string): string {
        return path.join(STORAGE_PATH, 'dashcams', CameraRecordingService.sanitizeCameraName(cameraName))
    }

    private static getFrameChannel(cameraName: string): string {
        return `camera:frame:${cameraName}`
    }

    private static sanitizeCameraName(cameraName: string): string {
        const sanitized = cameraName.replace(/[^a-zA-Z0-9_-]/gu, '_')
        return sanitized || 'camera'
    }
}

export default CameraRecordingService
