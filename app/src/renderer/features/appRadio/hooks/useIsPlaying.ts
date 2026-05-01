import useIpcData, { type UseIpcDataReturn } from '@renderer/hooks/useIpcData'

const useIsPlaying = (): UseIpcDataReturn<boolean> => {
    return useIpcData<boolean>(
        async () => await window.api.radio.isPlaying.get(),
        callback => window.api.radio.isPlaying.subscribe(callback)
    )
}
export default useIsPlaying
