import { useEffect, useRef, useState } from 'react'

interface CameraProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    deviceId: string
    isMirrored?: boolean
}

const Camera = ({ deviceId, isMirrored, ...videoProps }: CameraProps) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        deviceId: deviceId ? { exact: deviceId } : undefined, // eslint-disable-line no-undefined
                    },
                })

                if (!isMounted) {
                    stream.getTracks().forEach(track => track.stop())
                    return
                }

                streamRef.current = stream

                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                }
            } catch (err) {
                console.error('Error accessing camera:', err)
                if (isMounted) {
                    setError('Failed to load camera. Please check the connection.')
                }
            }
        }

        startCamera()

        return () => {
            isMounted = false
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
                streamRef.current = null
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null
            }
        }
    }, [deviceId])

    return (
        <>
            <div className='flex size-full items-center justify-center overflow-hidden'>
                {error ? (
                    <div className='text-xl font-medium text-red-500'>{error}</div>
                ) : (
                    <video
                        autoPlay
                        playsInline
                        muted
                        {...videoProps}
                        ref={videoRef}
                        className={`size-full object-contain ${isMirrored ? 'scale-x-[-1]' : ''}
                            ${videoProps.className || ''}`}
                    />
                )}
            </div>
        </>
    )
}
export default Camera
