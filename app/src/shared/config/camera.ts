import type { CameraDefinition } from '@shared/types/camera'

export const reverseCameraName = 'rear'

interface CameraConfig {
    ffmpegBinary: string
    recordingSegmentSeconds: number // Duration of each recorded segment in seconds
    cameras: CameraDefinition[]
}

export const CAMERA_CONFIG: CameraConfig = {
    ffmpegBinary: 'ffmpeg',
    recordingSegmentSeconds: 300,
    cameras: [
        {
            name: reverseCameraName,
            devicePath: '/dev/video0',
            width: 1280,
            height: 720,
            fps: 20,
            isMirrored: true,
        },
    ],
}
