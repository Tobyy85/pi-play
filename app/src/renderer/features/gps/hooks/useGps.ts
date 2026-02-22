import useIpcData from '@renderer/hooks/useIpcData'

import type { GPSData } from '@shared/types/gps'

const useGps = () => {
    return useIpcData<GPSData>(
        () => window.api.gps.getData(),
        callback => window.api.gps.subscribe(callback)
    )
}

export default useGps
