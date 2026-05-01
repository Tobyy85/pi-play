import useIpcData, { type UseIpcDataReturn } from '@renderer/hooks/useIpcData'
import type { RadioStation } from '@shared/types/radio'

const useCurrentStation = (): UseIpcDataReturn<RadioStation | null> => {
    return useIpcData<RadioStation | null>(
        async () => await window.api.radio.currentStation.get(),
        callback => window.api.radio.currentStation.subscribe(callback)
    )
}
export default useCurrentStation
