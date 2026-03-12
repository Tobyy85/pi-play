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
                    <div
                        className='rounded-full bg-black/75 px-4 py-1.5 text-[2.5rem] leading-[1.05] font-bold
                            text-white'
                    >
                        <span>{data.speed ?? 'N/A'}</span> <span className='text-4xl'>km/h</span>
                    </div>
                </div>
            )}
        </div>
    )
}
