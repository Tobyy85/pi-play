import type { CameraDefinition } from '@shared/types/camera'

interface CameraConfig {
    ffmpegBinary: string
    recordingSegmentSeconds: number // Duration of each recorded segment in seconds
    cameras: CameraDefinition[]
}

export const reverseCamera: CameraDefinition = {
    name: 'rear',
    devicePath: '/dev/video0',
    deviceId: 'aee3140a5374e75e4830d3c243fa5bfe3abf9f1e848f92868da5f139d88a71a3',
    width: 1280,
    height: 720,
    fps: 20,
    isMirrored: true,
}

export const CAMERA_CONFIG: CameraConfig = {
    ffmpegBinary: 'ffmpeg',
    recordingSegmentSeconds: 300,
    cameras: [reverseCamera],
}
