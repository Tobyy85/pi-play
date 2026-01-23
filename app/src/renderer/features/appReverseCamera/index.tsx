import Camera from '@renderer/features/appReverseCamera/Camera'

import { CAMERA_CONFIG } from '@shared/config/camera'

export const AppReverseCameraBackground = () => {
    return (
        <div className='size-full bg-black/50'>
            <div className='size-full blur-3xl'>
                <Camera
                    deviceId={CAMERA_CONFIG.reverseCameraId}
                    isMirrored={true}
                />
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
