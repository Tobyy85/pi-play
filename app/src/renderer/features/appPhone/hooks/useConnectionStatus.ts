import useIpcData from '@renderer/hooks/useIpcData'

const useConnectionStatus = () => {
    return useIpcData<boolean>(
        () => window.api.phoneBook.connectionStatus.get(),
        callback => window.api.phoneBook.connectionStatus.subscribe(callback),
        false
    )
}
export default useConnectionStatus
