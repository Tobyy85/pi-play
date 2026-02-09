import { Marker } from 'react-map-gl/maplibre'

import MarkerIcon from '@renderer/features/appMaps/assets/MarkerIcon'

interface MapMarkerProps {
    longitude: number
    latitude: number
}

const MapMarker = ({ longitude, latitude }: MapMarkerProps) => {
    return (
        <>
            <Marker
                longitude={longitude}
                latitude={latitude}
                anchor='center'
                rotationAlignment='map'
            >
                <MarkerIcon className='size-10 fill-blue-400 stroke-white' />
            </Marker>
        </>
    )
}
export default MapMarker
