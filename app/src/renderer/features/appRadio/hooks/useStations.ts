import useIpcData, { type UseIpcDataReturn } from '@renderer/hooks/useIpcData'

import type { RadioStation } from '@shared/types/radio'

const useStations = (): UseIpcDataReturn<RadioStation[] | null> => {
    return useIpcData<RadioStation[] | null>(
        async () => await window.api.radio.stations.get(),
        callback => window.api.radio.stations.subscribe(callback)
    )
}
export default useStations
