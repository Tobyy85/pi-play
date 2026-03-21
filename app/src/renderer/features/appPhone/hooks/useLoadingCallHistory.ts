import useIpcData from '@renderer/hooks/useIpcData'

const useLoadingCallHistory = () => {
    return useIpcData<boolean>(
        window.api.phoneBook.loadingCallHistory.get,
        callback => window.api.phoneBook.loadingCallHistory.subscribe(callback),
        false
    )
}
export default useLoadingCallHistory
