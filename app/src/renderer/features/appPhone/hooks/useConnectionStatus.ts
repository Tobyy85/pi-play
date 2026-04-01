import useIpcData, { type UseIpcDataReturn } from '@renderer/hooks/useIpcData'

const useConnectionStatus = (): UseIpcDataReturn<boolean> => {
    return useIpcData<boolean>(
        async () => await window.api.phoneBook.connectionStatus.get(),
        callback => window.api.phoneBook.connectionStatus.subscribe(callback),
        false
    )
}
export default useConnectionStatus
