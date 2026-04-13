import useIpcData from '@renderer/hooks/useIpcData'
import type { Volume } from '@shared/types/systemAudio'

const useVolume = () => {
    return useIpcData<Volume>(
        async () => await window.api.systemAudio.volume.get(),
        callback => window.api.systemAudio.volume.subscribe(callback)
    )
}
export default useVolume
