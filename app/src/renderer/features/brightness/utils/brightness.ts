const MIN_OPACITY = 0
const MAX_OPACITY = 0.9

export const getOpacityFromLightLevel = (lightLevel: number): number => {
    return Math.max(MIN_OPACITY, Math.min(MAX_OPACITY, lightLevel / 100))
}
