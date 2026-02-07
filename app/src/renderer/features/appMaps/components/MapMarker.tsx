import { Marker } from 'react-map-gl/maplibre'

import MarkerIcon from '@renderer/features/appMaps/assets/MarkerIcon'

interface MapMarkerProps {
    longitude: number
    latitude: number
    rotation: number
    pitch: number
}

const MapMarker = ({ longitude, latitude, rotation, pitch }: MapMarkerProps) => {
    return (
        <>
            <Marker
                longitude={longitude}
                latitude={latitude}
                anchor='center'
            >
                <MarkerIcon
                    style={{
                        transformOrigin: 'center',
                        transform: `rotateX(${pitch}deg) rotateZ(${rotation}deg)`,
                    }}
                    className='size-10 fill-blue-400 stroke-white'
                />
            </Marker>
        </>
    )
}
export default MapMarker
