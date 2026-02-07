import Map from '@renderer/features/appMaps/components/Map'
import useGps from '@renderer/features/gps/hooks/useGps'

export const AppMapsBackground = () => {
    return (
        <>
            <div className='size-full bg-[#1a1a2e]'></div>
        </>
    )
}

export const AppMapsContent = () => {
    const { data, isLoading, error } = useGps()

    return (
        <div className='flex h-full flex-col'>
            {isLoading && <p className='text-white'>Loading GPS data...</p>}
            {error && <p className='text-red-500'>Error: {error}</p>}
            {data && (
                <div className='relative flex flex-1 flex-col gap-4'>
                    <div className='flex-1 overflow-hidden rounded-lg'>
                        <Map
                            latitude={data.latitude}
                            longitude={data.longitude}
                            course={data.course}
                        />
                    </div>
                    <div className='absolute bottom-2 left-2'>
                        <span className='rounded-full bg-black/75 px-2 text-3xl font-bold text-white'>
                            <span>{data.speed ?? 'N/A'}</span>{' '}
                            <span className='text-2xl text-white/90'>km/h</span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}
