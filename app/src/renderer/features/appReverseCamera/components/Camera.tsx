import { useEffect, useRef, useState } from 'react'

interface CameraProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'onError'> {
    deviceId: string
    isMirrored?: boolean
    setError?: (error: string | null) => void
}

const Camera = ({ deviceId, isMirrored, setError, ...videoProps }: CameraProps) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const [isError, setIsError] = useState<boolean>(false)

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
                setError?.(null)
                setIsError(false)
            } catch (err) {
                console.error('Error accessing camera:', err)
                if (isMounted) {
                    setError?.('Failed to load camera.')
                    setIsError(true)
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
                videoRef.current.srcObject = null // eslint-disable-line react-hooks/exhaustive-deps
            }
        }
    }, [deviceId, setError])

    if (isError) return null

    return (
        <>
            <div className='flex size-full items-center justify-center overflow-hidden'>
                <video
                    autoPlay
                    playsInline
                    muted
                    {...videoProps}
                    ref={videoRef}
                    className={`size-full object-contain ${isMirrored ? 'scale-x-[-1]' : ''}
                        ${videoProps.className || ''}`}
                />
            </div>
        </>
    )
}
export default Camera
