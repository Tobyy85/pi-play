import { useCallback, useEffect, useRef, useState } from 'react'

export interface DeadReckoningInput {
    latitude: number | null
    longitude: number | null
    speedMps: number | null
    heading: number | null
    catchUpDurationMs?: number
}

export interface VisualPosition {
    lat: number | null
    lng: number | null
    heading: number | null
}

interface DeadReckoningFix {
    lat: number
    lng: number
    speedMps: number
    heading: number
    receivedAtMs: number
}

interface CatchUpCorrection {
    startedAtMs: number
    durationMs: number
    deltaLat: number
    deltaLng: number
    deltaHeading: number
}

const EARTH_RADIUS_METERS = 6378137
const MIN_CATCH_UP_DURATION_MS = 50
const DEFAULT_CATCH_UP_DURATION_MS = 500
const FULL_CIRCLE_DEGREES = 360
const HALF_CIRCLE_DEGREES = 180
const DEG_TO_RAD = Math.PI / HALF_CIRCLE_DEGREES
const RAD_TO_DEG = HALF_CIRCLE_DEGREES / Math.PI
const CUBIC_EASING_POWER = 3
const MIN_SAFE_COSINE = 1e-6

const clamp = (value: number, min: number, max: number): number => {
    return Math.min(max, Math.max(min, value))
}

const normalizeHeading = (heading: number): number => {
    const normalized = heading % FULL_CIRCLE_DEGREES

    return normalized < 0 ? normalized + FULL_CIRCLE_DEGREES : normalized
}

const shortestAngleDelta = (from: number, to: number): number => {
    let delta = normalizeHeading(to) - normalizeHeading(from)

    if (delta > HALF_CIRCLE_DEGREES) {
        delta -= FULL_CIRCLE_DEGREES
    }

    if (delta < -HALF_CIRCLE_DEGREES) {
        delta += FULL_CIRCLE_DEGREES
    }

    return delta
}

const easeOutCubic = (progress: number): number => {
    return 1 - (1 - progress) ** CUBIC_EASING_POWER
}

const projectPositionByDistance = (
    lat: number,
    lng: number,
    heading: number,
    distanceMeters: number
): { lat: number; lng: number } => {
    if (distanceMeters === 0) {
        return { lat, lng }
    }

    const headingRad = heading * DEG_TO_RAD
    const latRad = lat * DEG_TO_RAD

    const northMeters = Math.cos(headingRad) * distanceMeters
    const eastMeters = Math.sin(headingRad) * distanceMeters

    const deltaLat = (northMeters / EARTH_RADIUS_METERS) * RAD_TO_DEG

    const cosLat = Math.cos(latRad)
    let safeCosLat = cosLat
    if (Math.abs(cosLat) < MIN_SAFE_COSINE) {
        safeCosLat = cosLat >= 0 ? MIN_SAFE_COSINE : -MIN_SAFE_COSINE
    }

    const deltaLng = (eastMeters / (EARTH_RADIUS_METERS * safeCosLat)) * RAD_TO_DEG

    return {
        lat: lat + deltaLat,
        lng: lng + deltaLng,
    }
}

// eslint-disable-next-line max-lines-per-function
const useDeadReckoning = ({
    latitude,
    longitude,
    speedMps,
    heading,
    catchUpDurationMs = DEFAULT_CATCH_UP_DURATION_MS,
}: DeadReckoningInput): VisualPosition => {
    const [visualPosition, setVisualPosition] = useState<VisualPosition>({
        lat: latitude,
        lng: longitude,
        heading,
    })

    const lastRealFixRef = useRef<DeadReckoningFix | null>(null)
    const correctionRef = useRef<CatchUpCorrection | null>(null)
    const lastVisualRef = useRef<VisualPosition>({
        lat: latitude,
        lng: longitude,
        heading,
    })

    const computeVisualPositionAt = useCallback((nowMs: number): VisualPosition => {
        const fix = lastRealFixRef.current

        if (!fix) {
            return lastVisualRef.current
        }

        const elapsedSeconds = Math.max(0, (nowMs - fix.receivedAtMs) / 1000)
        const traveledMeters = fix.speedMps * elapsedSeconds
        const predicted = projectPositionByDistance(fix.lat, fix.lng, fix.heading, traveledMeters)
        const { lat: predictedLat, lng: predictedLng } = predicted

        let lat = predictedLat
        let lng = predictedLng
        let visualHeading = fix.heading

        const correction = correctionRef.current
        if (correction) {
            const progress = clamp((nowMs - correction.startedAtMs) / correction.durationMs, 0, 1)
            const easedProgress = easeOutCubic(progress)
            const remaining = 1 - easedProgress

            // Correction offset decays over ~500ms so the cursor glides to the real GPS fix.
            lat -= correction.deltaLat * remaining
            lng -= correction.deltaLng * remaining
            visualHeading = normalizeHeading(fix.heading - correction.deltaHeading * remaining)

            if (progress >= 1) {
                correctionRef.current = null
            }
        }

        return {
            lat,
            lng,
            heading: visualHeading,
        }
    }, [])

    // eslint-disable-next-line max-lines-per-function
    useEffect(() => {
        // A new 1Hz GPS sample updates the dead reckoning reference and starts catch-up blending.
        if (latitude === null || longitude === null) {
            const emptyVisualPosition: VisualPosition = {
                lat: null,
                lng: null,
                heading: null,
            }

            lastRealFixRef.current = null
            correctionRef.current = null
            lastVisualRef.current = emptyVisualPosition
            setVisualPosition(emptyVisualPosition)

            return
        }

        const nowMs = performance.now()
        const previousFix = lastRealFixRef.current

        const resolvedHeading = normalizeHeading(
            heading ?? previousFix?.heading ?? lastVisualRef.current.heading ?? 0
        )

        const resolvedSpeed =
            speedMps !== null && Number.isFinite(speedMps)
                ? Math.max(0, speedMps)
                : (previousFix?.speedMps ?? 0)

        const nextFix: DeadReckoningFix = {
            lat: latitude,
            lng: longitude,
            speedMps: resolvedSpeed,
            heading: resolvedHeading,
            receivedAtMs: nowMs,
        }

        if (!previousFix) {
            const seededVisualPosition: VisualPosition = {
                lat: nextFix.lat,
                lng: nextFix.lng,
                heading: nextFix.heading,
            }

            correctionRef.current = null
            lastRealFixRef.current = nextFix
            lastVisualRef.current = seededVisualPosition
            setVisualPosition(seededVisualPosition)

            return
        }

        // Take the currently rendered/predicted cursor as correction start point to avoid visual jump.
        const predictedBeforeUpdate = computeVisualPositionAt(nowMs)

        correctionRef.current = {
            startedAtMs: nowMs,
            durationMs: Math.max(MIN_CATCH_UP_DURATION_MS, catchUpDurationMs),
            deltaLat: nextFix.lat - (predictedBeforeUpdate.lat ?? nextFix.lat),
            deltaLng: nextFix.lng - (predictedBeforeUpdate.lng ?? nextFix.lng),
            deltaHeading: shortestAngleDelta(
                predictedBeforeUpdate.heading ?? nextFix.heading,
                nextFix.heading
            ),
        }

        lastRealFixRef.current = nextFix
        lastVisualRef.current = predictedBeforeUpdate
        setVisualPosition(predictedBeforeUpdate)
    }, [latitude, longitude, speedMps, heading, catchUpDurationMs, computeVisualPositionAt])

    useEffect(() => {
        let animationFrameId = 0

        const animate = (nowMs: number): void => {
            // 60 FPS loop continuously advances dead reckoning and catch-up interpolation.
            const nextVisualPosition = computeVisualPositionAt(nowMs)

            lastVisualRef.current = nextVisualPosition
            setVisualPosition(nextVisualPosition)

            animationFrameId = window.requestAnimationFrame(animate)
        }

        animationFrameId = window.requestAnimationFrame(animate)

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [computeVisualPositionAt])

    return visualPosition
}

export default useDeadReckoning
