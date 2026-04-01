import { Marker } from 'react-map-gl/maplibre'

import MarkerIcon from '@renderer/features/appMaps/assets/MarkerIcon'

interface MapMarkerProps {
    longitude: number
    latitude: number
    rotation: number
}

const MapMarker = ({ longitude, latitude, rotation }: MapMarkerProps) => {
    return (
        <>
            <Marker
                longitude={longitude}
                latitude={latitude}
                anchor='center'
                rotationAlignment='map'
                rotation={rotation}
            >
                <MarkerIcon className='size-10 fill-blue-400 stroke-white' />
            </Marker>
        </>
    )
}
export default MapMarker
