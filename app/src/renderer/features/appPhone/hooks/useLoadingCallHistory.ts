import useIpcData, { type UseIpcDataReturn } from '@renderer/hooks/useIpcData'

const useLoadingCallHistory = (): UseIpcDataReturn<boolean> => {
    return useIpcData<boolean>(
        window.api.phoneBook.loadingCallHistory.get,
        callback => window.api.phoneBook.loadingCallHistory.subscribe(callback),
        false
    )
}
export default useLoadingCallHistory
