import { useEffect, useRef, useState } from 'react'

interface CameraProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'onError'> {
    cameraName: string
    cameraDeviceId: string
    isMirrored?: boolean
    setError?: (error: string | null) => void
}

const Camera = ({ cameraName, cameraDeviceId, isMirrored, setError, ...videoProps }: CameraProps) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const [isError, setIsError] = useState<boolean>(false)

    useEffect(() => {
        let isMounted = true
        const videoElement = videoRef.current

        const startCamera = async (): Promise<void> => {
            try {
                try {
                    await window.api.camera.pauseRecording(cameraName)
                } catch (pauseError) {
                    console.error('[Camera]: Failed to pause recording before preview: ', pauseError)
                }

                let stream: MediaStream
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: cameraDeviceId
                            ? {
                                  deviceId: { exact: cameraDeviceId },
                              }
                            : true,
                    })
                } catch (cameraError) {
                    if (!cameraDeviceId) {
                        throw cameraError
                    }

                    // Some platforms do not expose stable IDs matching the configured device path.
                    stream = await navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: true,
                    })
                }

                if (!isMounted) {
                    stream.getTracks().forEach(track => track.stop())
                    return
                }

                streamRef.current = stream

                if (videoElement) {
                    videoElement.srcObject = stream
                }

                setError?.(null)
                setIsError(false)
            } catch (err) {
                console.error('[Camera]: Error starting camera stream: ', err)
                if (isMounted) {
                    setError?.('Failed to load camera stream.')
                    setIsError(true)
                }
            }
        }

        void startCamera()

        return () => {
            isMounted = false
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
                streamRef.current = null
            }
            if (videoElement) {
                videoElement.srcObject = null
            }

            void window.api.camera.resumeRecording(cameraName).catch((resumeError: unknown) => {
                console.error('[Camera]: Failed to resume recording after preview: ', resumeError)
            })
        }
    }, [cameraDeviceId, cameraName, setError])

    if (isError) return null

    return (
        <div className='flex size-full items-center justify-center overflow-hidden'>
            <video
                autoPlay
                playsInline
                muted
                {...videoProps}
                ref={videoRef}
                className={`size-full object-contain ${isMirrored ? 'scale-x-[-1]' : ''}
                    ${videoProps.className ?? ''}`}
            />
        </div>
    )
}
export default Camera
