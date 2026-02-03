import useGps from '@renderer/features/gps/hooks/useGps'

export const AppMapsBackground = () => {
    return (
        <>
            <div className='size-full bg-sky-700'></div>
        </>
    )
}

export const AppMapsContent = () => {
    const { data, isLoading, error } = useGps()

    return (
        <div className='p-4'>
            <h2 className='mb-4 text-2xl font-bold text-white'>GPS Data</h2>
            {isLoading && <p className='text-white'>Loading GPS data...</p>}
            {error && <p className='text-red-500'>Error: {error}</p>}
            {data && (
                <div className='text-white'>
                    <p>Latitude: {data.latitude}</p>
                    <p>Longitude: {data.longitude}</p>
                    <p>Speed: {data.speed} km/h</p>
                    <p>Course: {data.course}°</p>
                    <p>Fix: {data.fix ? 'Yes' : 'No'}</p>
                    <p>Satellites: {data.satellites}</p>
                    <p>Timestamp: {data.timestamp}</p>
                </div>
            )}
        </div>
    )
}
