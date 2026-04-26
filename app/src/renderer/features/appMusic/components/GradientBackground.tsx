import BaseGradientBackground from '@renderer/features/gradientBackground/components/GradientBackground'

import { HASH_PRIME, HUE_FULL } from '@renderer/features/gradientBackground/constants/'
import { createRng, hashString } from '@renderer/features/gradientBackground/utils'

import type { TrackInfo } from '@shared/types/mediaPlayer'

interface GradientBackgroundProps {
    trackInfo: TrackInfo | null
}

export const GradientBackground = ({ trackInfo }: GradientBackgroundProps) => {
    const seed = `${trackInfo?.title ?? ''}, ${trackInfo?.artist ?? ''}, ${trackInfo?.album ?? ''}`

    const rng = createRng(hashString(seed) + HASH_PRIME)
    const baseHue = Math.floor(rng() * HUE_FULL)

    return (
        <BaseGradientBackground
            seed={seed}
            hueRange={[baseHue - 60, baseHue + 60]} // eslint-disable-line @typescript-eslint/no-magic-numbers
            saturationRange={[25, 70]} // eslint-disable-line @typescript-eslint/no-magic-numbers
            lightnessRange={[10, 50]} // eslint-disable-line @typescript-eslint/no-magic-numbers
        />
    )
}

export default GradientBackground
