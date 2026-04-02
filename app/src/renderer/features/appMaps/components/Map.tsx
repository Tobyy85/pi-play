import { useCallback, useEffect, useRef, useState } from 'react'

import 'maplibre-gl/dist/maplibre-gl.css'
import MapGL, { type MapRef } from 'react-map-gl/maplibre'

import CompassButton from '@renderer/features/appMaps/components/CompassButton'
import FollowModeButton from '@renderer/features/appMaps/components/FollowModeButton'
import MapMarker from '@renderer/features/appMaps/components/MapMarker'
import useDeadReckoning, { type VisualPosition } from '../hooks/useDeadReckoning'

import { MAP_STYLE } from '@shared/config/mapStyle'

const DEFAULT_ZOOM = 16
const PITCH = 45

interface MapProps {
    latitude: number | null
    longitude: number | null
    course: number | null
    speedMps: number | null
}

const Map = ({ latitude, longitude, course, speedMps }: MapProps) => {
    const mapRef = useRef<MapRef | null>(null)
    const visualPosition: VisualPosition = useDeadReckoning({
        latitude,
        longitude,
        speedMps,
        heading: course,
    })

    const [viewState, setViewState] = useState({
        longitude: visualPosition.lng ?? longitude ?? 0,
        latitude: visualPosition.lat ?? latitude ?? 0,
        zoom: DEFAULT_ZOOM,
        bearing: visualPosition.heading ?? course ?? 0,
        pitch: PITCH,
    })
    const [isFollowMode, setIsFollowMode] = useState(true)

    const handleMove = useCallback((evt: { viewState: typeof viewState }) => {
        setViewState(evt.viewState)
    }, [])

    const handleMoveStart = () => {
        if (isFollowMode) {
            setIsFollowMode(false)
        }
    }

    const enableFollowMode = () => {
        mapRef.current?.flyTo({
            center: [visualPosition.lng ?? viewState.longitude, visualPosition.lat ?? viewState.latitude],
            bearing: visualPosition.heading ?? viewState.bearing,
            pitch: PITCH,
            zoom: DEFAULT_ZOOM,
            duration: 1000,
        })

        setIsFollowMode(true)
    }

    const resetBearingToNorth = () => {
        mapRef.current?.rotateTo(0, { duration: 500 })
    }

    useEffect(() => {
        if (isFollowMode && visualPosition.lat !== null && visualPosition.lng !== null) {
            const nextLatitude = visualPosition.lat
            const nextLongitude = visualPosition.lng
            const nextBearing = visualPosition.heading

            setViewState(prev => ({
                ...prev,
                longitude: nextLongitude,
                latitude: nextLatitude,
                bearing: nextBearing ?? prev.bearing,
            }))
        }
    }, [isFollowMode, visualPosition.lat, visualPosition.lng, visualPosition.heading])

    return (
        <div className='relative h-full w-full'>
            <MapGL
                ref={mapRef}
                {...viewState}
                onMove={handleMove}
                onMoveStart={handleMoveStart}
                style={{ width: '100%', height: '100%' }}
                mapStyle={MAP_STYLE}
                attributionControl={false}
            >
                {visualPosition.lat !== null && visualPosition.lng !== null && (
                    <MapMarker
                        latitude={visualPosition.lat}
                        longitude={visualPosition.lng}
                        rotation={visualPosition.heading ?? 0}
                    />
                )}
            </MapGL>

            {isFollowMode || (
                <div className='absolute right-0 bottom-0 flex'>
                    {viewState.bearing === 0 || (
                        <CompassButton
                            bearing={viewState.bearing}
                            resetBearing={resetBearingToNorth}
                        />
                    )}
                    <FollowModeButton enableFollowMode={enableFollowMode} />
                </div>
            )}
        </div>
    )
}

export default Map
