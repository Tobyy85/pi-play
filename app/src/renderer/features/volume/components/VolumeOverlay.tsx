import { useEffect, useRef, useState } from 'react'

import VolumeIcon from '@renderer/features/volume/components/VolumeIcon'

import useVolume from '@renderer/features/volume/hooks/useVolume'

const FADEOUT_DURATION_MS = 1500

const VolumeOverlay = () => {
    const [show, setShow] = useState<boolean>(false)
    const { data: volume, isLoading } = useVolume()

    const isFirstRender = useRef(true)

    useEffect(() => {
        if (isLoading) return
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        setShow(true)
        const timeout = setTimeout(() => setShow(false), FADEOUT_DURATION_MS)
        return () => clearTimeout(timeout)
    }, [volume?.isMuted, volume?.value, isLoading])

    return (
        <>
            <div className='fixed right-0 z-50 flex h-full items-center [&_*]:pointer-events-auto'>
                <div
                    onClick={() => setShow(false)}
                    className={`relative flex h-1/2 w-10 flex-col items-center justify-end gap-3
                        overflow-hidden rounded-full bg-neutral-400/40 backdrop-blur-sm
                        ${show ? '-translate-x-4' : 'translate-x-full'} transition-transform`}
                >
                    <div
                        className='w-full bg-white transition-all ease-linear'
                        style={{ height: `${volume?.value}%` }}
                    >
                        <VolumeIcon
                            value={volume?.value ?? 0}
                            isMuted={volume?.isMuted ?? false}
                            className='absolute bottom-2 left-1/2 size-7 -translate-x-1/2 text-neutral-700'
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
export default VolumeOverlay
