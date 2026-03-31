import type { TrackInfo } from '@shared/types/mediaPlayer'
import { useEffect, useMemo, useRef } from 'react'
import { createNoise3D, type NoiseFunction3D } from 'simplex-noise'

interface GradientBackgroundProps {
    trackInfo: TrackInfo | null
}

// ── Hashing & RNG ──────────────────────────────────────────────────────
const HASH_PRIME = 31
const HASH_MOD = 1_000_000_007
const RNG_MOD = 2_147_483_647
const RNG_MULTIPLIER = 16807

// ── Color generation ───────────────────────────────────────────────────
const HUE_FULL = 360
const HUE_SPREAD = 60 // colors stay within ±60°
const SATURATION_MIN = 25
const SATURATION_MAX = 70
const LIGHTNESS_MIN = 10
const LIGHTNESS_MAX = 50
const BG_LIGHT_MAX = 8

// ── Blob layout ────────────────────────────────────────────────────────
const NUM_BLOBS = 20
const BLOB_RADIUS = 0.4 // fraction of min(w, h)
const SHAPE_VERTICES = 40 // vertices per blob outline
const SHAPE_WOBBLE = 0.5 // max noise distortion of radius
const POSITION_MIN = 0.1
const POSITION_MAX = 0.9
const NOISE_OFFSET_SPREAD = 1000 // pushes blobs into different noise areas

// ── Animation timing ───────────────────────────────────────────────────
const TIME_DIV = 50_000 // overall slowness
const MOVE_AMP = 0.2 // movement amplitude (fraction of canvas)
const SHAPE_SPEED = 3 // independent speed for shape morphing
const GLOBAL_ALPHA = 0.5

// ── Canvas / blur ──────────────────────────────────────────────────────
const RENDER_SCALE = 0.5 // render at half resolution for performance
const BLUR_PX = 50

// ── Helpers ────────────────────────────────────────────────────────────
const TWO_PI = Math.PI * 2
const NOISE_UV = 2 // frequency of the shape noise ring

const hashString = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = (hash * HASH_PRIME + str.charCodeAt(i)) % HASH_MOD
    }
    return hash
}

const createRng = (initialSeed: number) => {
    let state = (initialSeed % RNG_MOD) + 1
    return () => {
        state = (state * RNG_MULTIPLIER) % RNG_MOD
        return state / RNG_MOD
    }
}

// ── Per-blob config ────────────────────────────────────────────────────
interface BlobConfig {
    hue: number
    sat: number
    light: number
    noiseOff: number // unique noise offset so each blob is independent
    baseX: number // 0-1 anchor
    baseY: number
}

const generateBlobs = (trackInfo: TrackInfo | null) => {
    const key = `${trackInfo?.title ?? ''}|${trackInfo?.artist ?? ''}|${trackInfo?.album ?? ''}`
    const seed = hashString(key) + HASH_PRIME
    const rng = createRng(seed)
    const baseHue = Math.floor(rng() * HUE_FULL)

    const blobs: BlobConfig[] = Array.from({ length: NUM_BLOBS }, () => {
        const hueOff = Math.floor(rng() * HUE_SPREAD * 2 - HUE_SPREAD)
        return {
            hue: (baseHue + hueOff + HUE_FULL) % HUE_FULL,
            sat: SATURATION_MIN + Math.floor(rng() * (SATURATION_MAX - SATURATION_MIN)),
            light: LIGHTNESS_MIN + Math.floor(rng() * (LIGHTNESS_MAX - LIGHTNESS_MIN)),
            noiseOff: rng() * NOISE_OFFSET_SPREAD,
            baseX: POSITION_MIN + rng() * (POSITION_MAX - POSITION_MIN),
            baseY: POSITION_MIN + rng() * (POSITION_MAX - POSITION_MIN),
        }
    })

    const bgHue = baseHue
    const bgColor = `hsl(${bgHue}, ${SATURATION_MIN}%, ${BG_LIGHT_MAX}%)`
    return { blobs, bgColor, rng }
}

// ── Draw a single organic blob ─────────────────────────────────────────
const drawBlob = (
    ctx: CanvasRenderingContext2D,
    noise: NoiseFunction3D,
    blob: BlobConfig,
    time: number,
    cw: number,
    ch: number
) => {
    const minDim = Math.min(cw, ch)
    const radius = minDim * BLOB_RADIUS

    // Smooth noise-driven position
    const nx = noise(blob.noiseOff, 0, time) * MOVE_AMP
    const ny = noise(0, blob.noiseOff, time) * MOVE_AMP
    const cx = cw * (blob.baseX + nx)
    const cy = ch * (blob.baseY + ny)

    const shapeTime = time * SHAPE_SPEED

    ctx.beginPath()
    for (let vi = 0; vi <= SHAPE_VERTICES; vi++) {
        const angle = (vi / SHAPE_VERTICES) * TWO_PI
        const nu = Math.cos(angle) * NOISE_UV + blob.noiseOff
        const nv = Math.sin(angle) * NOISE_UV + blob.noiseOff
        const wobble = noise(nu, nv, shapeTime) * SHAPE_WOBBLE
        const rr = radius * (1 + wobble)
        const px = cx + Math.cos(angle) * rr
        const py = cy + Math.sin(angle) * rr
        if (vi === 0) {
            ctx.moveTo(px, py)
        } else {
            ctx.lineTo(px, py)
        }
    }
    ctx.closePath()

    ctx.globalAlpha = GLOBAL_ALPHA
    ctx.fillStyle = `hsl(${blob.hue}, ${blob.sat}%, ${blob.light}%)`
    ctx.fill()
}

// ── Component ──────────────────────────────────────────────────────────
export const GradientBackground = ({ trackInfo }: GradientBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const config = useMemo(() => {
        const { blobs, bgColor, rng } = generateBlobs(trackInfo)
        const noise = createNoise3D(rng)
        return { blobs, bgColor, noise }
    }, [trackInfo])

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) {
            return
        }

        let frameId = 0

        const resize = () => {
            canvas.width = Math.round(canvas.clientWidth * RENDER_SCALE)
            canvas.height = Math.round(canvas.clientHeight * RENDER_SCALE)
        }
        resize()

        const observer = new ResizeObserver(resize)
        observer.observe(canvas)

        const animate = (ms: number) => {
            const time = ms / TIME_DIV
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
        <div className='relative size-full overflow-hidden bg-green-400'>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    filter: `blur(${BLUR_PX}px)`,
                    transform: 'scale(1.4)',
                }}
            />
        </div>
    )
}

export default GradientBackground
