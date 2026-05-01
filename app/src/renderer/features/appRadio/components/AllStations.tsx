import StationTile from '@renderer/features/appRadio/components/StationTile'

// import { useStations } from '@renderer/features/appRadio/store/useRadioStore'
import useStations from '@renderer/features/appRadio/hooks/useStations'
import type { RadioStation } from '@shared/types/radio'

interface AllStationsProps {
    onStationSelect: (station: RadioStation) => void
}

const AllStations = ({ onStationSelect }: AllStationsProps) => {
    const { data: stations } = useStations()

    if (!stations) {
        return (
            <div className='flex h-full items-center justify-center'>
                <p className='text-3xl font-bold text-white'>No stations available</p>
            </div>
        )
    }

    return (
        <>
            <div className='no-scrollbar size-full overflow-y-auto'>
                <div className='flex h-full flex-col'>
                    {stations.map(station => (
                        <StationTile
                            key={station.id}
                            station={station}
                            onClick={() => onStationSelect(station)}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}
export default AllStations
