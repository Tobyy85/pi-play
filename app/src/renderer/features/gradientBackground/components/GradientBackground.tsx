import { useEffect, useMemo, useRef } from 'react'
import { createNoise3D } from 'simplex-noise'

import * as constants from '@renderer/features/gradientBackground/constants'
import type { BlobConfig } from '@renderer/features/gradientBackground/types'
import { createRng, drawBlob, hashString } from '@renderer/features/gradientBackground/utils'

export interface GradientBackgroundProps {
    seed?: number | string
    hueRange: [number, number]
    saturationRange: [number, number]
    lightnessRange: [number, number]
}

const GradientBackground = ({
    seed: seedProp,
    hueRange,
    saturationRange,
    lightnessRange,
}: GradientBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const config = useMemo(() => {
        let numericSeed: number
        if (typeof seedProp === 'string') {
            numericSeed = hashString(seedProp) + constants.HASH_PRIME
        } else if (typeof seedProp === 'number') {
            numericSeed = seedProp
        } else {
            numericSeed = Math.floor(Math.random() * constants.RNG_MOD) // eslint-disable-line react-hooks/purity
        }

        const rng = createRng(numericSeed)

        const blobs: BlobConfig[] = Array.from({ length: constants.NUM_BLOBS }, () => {
            let hue = hueRange[0] + Math.floor(rng() * (hueRange[1] - hueRange[0]))
            hue = ((hue % constants.HUE_FULL) + constants.HUE_FULL) % constants.HUE_FULL
            return {
                hue,
                sat: saturationRange[0] + Math.floor(rng() * (saturationRange[1] - saturationRange[0])),
                light: lightnessRange[0] + Math.floor(rng() * (lightnessRange[1] - lightnessRange[0])),
                noiseOff: rng() * constants.NOISE_OFFSET_SPREAD,
                baseX: constants.POSITION_MIN + rng() * (constants.POSITION_MAX - constants.POSITION_MIN),
                baseY: constants.POSITION_MIN + rng() * (constants.POSITION_MAX - constants.POSITION_MIN),
            }
        })

        let bgHue = Math.floor((hueRange[0] + hueRange[1]) / 2)
        bgHue = ((bgHue % constants.HUE_FULL) + constants.HUE_FULL) % constants.HUE_FULL

        const bgColor = `hsl(${bgHue}, ${saturationRange[0]}%, 50%)`
        const noise = createNoise3D(rng)

        return { blobs, bgColor, noise }
    }, [seedProp, hueRange, saturationRange, lightnessRange])

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) {
            return
        }

        let frameId = 0

        const resize = () => {
            canvas.width = Math.round(canvas.clientWidth * constants.RENDER_SCALE)
            canvas.height = Math.round(canvas.clientHeight * constants.RENDER_SCALE)
        }
        resize()

        const observer = new ResizeObserver(resize)
        observer.observe(canvas)

        const animate = (ms: number) => {
            const time = ms / constants.TIME_DIV
            const { width: cw, height: ch } = canvas
            ctx.globalAlpha = 1
            ctx.fillStyle = config.bgColor
            ctx.fillRect(0, 0, cw, ch)

            for (const blob of config.blobs) {
                drawBlob(ctx, config.noise, blob, time, cw, ch)
            }
            ctx.globalAlpha = 1
            frameId = requestAnimationFrame(animate)
        }

        frameId = requestAnimationFrame(animate)
        return () => {
            cancelAnimationFrame(frameId)
            observer.disconnect()
        }
    }, [config])

    return (
        <div className='relative size-full overflow-hidden'>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    filter: `blur(${constants.BLUR_PX}px)`,
                    transform: 'scale(1.4)',
                }}
            />
        </div>
    )
}

export default GradientBackground
