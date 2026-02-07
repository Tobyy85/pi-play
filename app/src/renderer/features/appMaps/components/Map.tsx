import { useCallback, useEffect, useRef, useState } from 'react'

import 'maplibre-gl/dist/maplibre-gl.css'
import MapGL, { type MapRef } from 'react-map-gl/maplibre'

import FollowModeButton from '@renderer/features/appMaps/components/FollowModeButton'
import MapMarker from '@renderer/features/appMaps/components/MapMarker'

import { MAP_STYLE } from '@shared/config/maps/mapStyle'

const DEFAULT_ZOOM = 15
const PITCH = 45

interface MapProps {
    latitude: number | null
    longitude: number | null
    course: number | null
}

const Map = ({ latitude, longitude, course }: MapProps) => {
    const mapRef = useRef<MapRef | null>(null)
    const [viewState, setViewState] = useState({
        longitude: longitude ?? 0,
        latitude: latitude ?? 0,
        zoom: DEFAULT_ZOOM,
        bearing: course ?? 0,
        pitch: PITCH,
    })
    const [followMode, setFollowMode] = useState(true)

    const handleMove = useCallback((evt: { viewState: typeof viewState }) => {
        setViewState(evt.viewState)
    }, [])

    const handleMoveStart = () => {
        if (followMode) {
            setFollowMode(false)
        }
    }

    const toggleFollowMode = () => {
        setFollowMode(prev => !prev)
        if (!followMode && latitude !== null && longitude !== null) {
            setViewState(prev => ({
                ...prev,
                longitude,
                latitude,
                bearing: course ?? prev.bearing,
                pitch: PITCH,
                zoom: DEFAULT_ZOOM,
            }))
        }
    }

    useEffect(() => {
        if (followMode && latitude !== null && longitude !== null) {
            setViewState(prev => ({
                ...prev,
                longitude,
                latitude,
                bearing: course ?? prev.bearing,
            }))
        }
    }, [latitude, longitude, course, followMode])

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
                {latitude !== null && longitude !== null && (
                    <MapMarker
                        latitude={latitude}
                        longitude={longitude}
                        rotation={(course || 0) - viewState.bearing}
                        pitch={viewState.pitch}
                    />
                )}
            </MapGL>

            <FollowModeButton
                followMode={followMode}
                toggleFollowMode={toggleFollowMode}
            />
        </div>
    )
}

export default Map
