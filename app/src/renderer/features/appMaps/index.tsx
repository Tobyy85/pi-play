import Map from '@renderer/features/appMaps/components/Map'
import useGps from '@renderer/features/gps/hooks/useGps'

export const AppMapsBackground = () => {
    const { data, isLoading, error } = useGps()

    if (isLoading || error || !data) {
        return <div className="bg-[#1a1a2e]' size-full"></div>
    }

    return (
        <>
            <div className='size-full'>
                <Map
                    latitude={data.latitude}
                    longitude={data.longitude}
                    course={data.course}
                />
            </div>
        </>
    )
}

export const AppMapsContent = () => {
    const { data, isLoading, error } = useGps()

    return (
        <div>
            {isLoading && <p className='text-white'>Loading GPS data...</p>}
            {error && <p className='text-red-500'>Error: {error}</p>}
            {data && (
                <div className='absolute bottom-1 left-0'>
                    <div className='rounded-full bg-black/75 px-2 text-3xl font-bold text-white'>
                        <span>{data.speed ?? 'N/A'}</span>{' '}
                        <span className='text-2xl text-white/90'>km/h</span>
                    </div>
                </div>
            )}
        </div>
    )
}
