import Camera from '@renderer/features/appReverseCamera/components/Camera'

import { CAMERA_CONFIG } from '@shared/config/camera'

export const AppReverseCameraBackground = () => {
    return (
        <div className='size-full bg-black/50'>
            <div className='size-full'>
                <Camera
                    deviceId={CAMERA_CONFIG.reverseCameraId}
                    isMirrored={true}
                    className='size-full object-cover'
                />
                <div className='absolute top-0 left-0 size-full bg-black/10 backdrop-blur-md'></div>
            </div>
        </div>
    )
}

export const AppReverseCameraContent = () => {
    return (
        <div className='size-full overflow-hidden rounded-md'>
            <Camera
                deviceId={CAMERA_CONFIG.reverseCameraId}
                isMirrored={true}
            />
        </div>
    )
}
