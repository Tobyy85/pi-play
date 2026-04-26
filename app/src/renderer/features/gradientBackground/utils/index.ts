import * as constants from '@renderer/features/gradientBackground/constants'

import type { NoiseFunction3D } from 'simplex-noise'
import type { BlobConfig } from '../types'

export const hashString = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = (hash * constants.HASH_PRIME + str.charCodeAt(i)) % constants.HASH_MOD
    }
    return hash
}

export const createRng = (initialSeed: number) => {
    let state = (initialSeed % constants.RNG_MOD) + 1
    return () => {
        state = (state * constants.RNG_MULTIPLIER) % constants.RNG_MOD
        return state / constants.RNG_MOD
    }
}

export const drawBlob = (
    ctx: CanvasRenderingContext2D,
    noise: NoiseFunction3D,
    blob: BlobConfig,
    time: number,
    cw: number,
    ch: number
): void => {
    const minDim = Math.min(cw, ch)
    const radius = minDim * constants.BLOB_RADIUS

    const nx = noise(blob.noiseOff, 0, time) * constants.MOVE_AMP
    const ny = noise(0, blob.noiseOff, time) * constants.MOVE_AMP
    const cx = cw * (blob.baseX + nx)
    const cy = ch * (blob.baseY + ny)

    const shapeTime = time * constants.SHAPE_SPEED

    ctx.beginPath()
    for (let vi = 0; vi <= constants.SHAPE_VERTICES; vi++) {
        const angle = (vi / constants.SHAPE_VERTICES) * constants.TWO_PI
        const nu = Math.cos(angle) * constants.NOISE_UV + blob.noiseOff
        const nv = Math.sin(angle) * constants.NOISE_UV + blob.noiseOff
        const wobble = noise(nu, nv, shapeTime) * constants.SHAPE_WOBBLE
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

    ctx.globalAlpha = constants.GLOBAL_ALPHA
    ctx.fillStyle = `hsl(${blob.hue}, ${blob.sat}%, ${blob.light}%)`
    ctx.fill()
}
