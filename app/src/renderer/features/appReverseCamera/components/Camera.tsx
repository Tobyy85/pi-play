import { useEffect, useRef, useState } from 'react'

interface CameraProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onError' | 'src'> {
    cameraName: string
    isMirrored?: boolean
    setError?: (error: string | null) => void
}

const Camera = ({ cameraName, isMirrored, setError, ...imageProps }: CameraProps) => {
    const unsubscribeRef = useRef<(() => void) | null>(null)

    const [isError, setIsError] = useState<boolean>(false)
    const [frameDataUrl, setFrameDataUrl] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const startCamera = async (): Promise<void> => {
            try {
                const latestFrame = await window.api.camera.getLatestFrame(cameraName)

                if (!isMounted) {
                    return
                }

                if (latestFrame) {
                    setFrameDataUrl(latestFrame)
                }

                unsubscribeRef.current = window.api.camera.subscribeToFrame(cameraName, frame => {
                    setFrameDataUrl(frame)
                    setError?.(null)
                    setIsError(false)
                })

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
            unsubscribeRef.current?.()
            unsubscribeRef.current = null
        }
    }, [cameraName, setError])

    if (isError) return null

    return (
        <div className='flex size-full items-center justify-center overflow-hidden'>
            {frameDataUrl ? (
                <img
                    {...imageProps}
                    alt={imageProps.alt ?? `${cameraName} camera stream`}
                    src={frameDataUrl}
                    className={`size-full object-contain ${isMirrored ? 'scale-x-[-1]' : ''}
                        ${imageProps.className ?? ''}`}
                />
            ) : (
                <div className='text-lg text-white/70'>Loading camera stream...</div>
            )}
        </div>
    )
}
export default Camera
