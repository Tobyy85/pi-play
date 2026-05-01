import { useState } from 'react'

import Camera from '@renderer/features/appReverseCamera/components/Camera'
import ParkingSensors from '@renderer/features/appReverseCamera/components/ParkingSensors'

import { reverseCamera } from '@shared/config/camera'

const isReverseCameraMirrored = reverseCamera.isMirrored ?? false

export const AppReverseCameraBackground = () => {
    const [error, setError] = useState<string | null>(null)

    if (error) {
        return null
    }

    return (
        <div className='size-full'>
            <Camera
                cameraName={reverseCamera.name}
                cameraDeviceId={reverseCamera.deviceId}
                isMirrored={isReverseCameraMirrored}
                setError={setError}
                className='size-full object-cover'
            />
            <div className='absolute top-0 left-0 size-full bg-black/10 backdrop-blur-md'></div>
        </div>
    )
}

export const AppReverseCameraContent = () => {
    const [error, setError] = useState<string | null>(null)

    return (
        <>
            <div className='size-full overflow-hidden'>
                <Camera
                    cameraName={reverseCamera.name}
                    cameraDeviceId={reverseCamera.deviceId}
                    isMirrored={isReverseCameraMirrored}
                    setError={setError}
                />
                {error && (
                    <div className='flex size-full items-center justify-center'>
                        <p className='text-2xl text-white'>{error}</p>
                    </div>
                )}
            </div>
            <div
                className='pointer-events-none absolute bottom-0 left-1/2 w-1/2 -translate-x-1/2 scale-x-[-1]
                    scale-y-[-1] opacity-50'
            >
                <ParkingSensors />
            </div>
        </>
    )
}
