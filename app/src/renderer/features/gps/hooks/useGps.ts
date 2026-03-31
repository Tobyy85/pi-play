import useIpcData, { type UseIpcDataReturn } from '@renderer/hooks/useIpcData'

import type { GPSData } from '@shared/types/gps'

const useGps = (): UseIpcDataReturn<GPSData> => {
    return useIpcData<GPSData>(
        async () => await window.api.gps.getData(),
        callback => window.api.gps.subscribe(callback)
    )
}

export default useGps
