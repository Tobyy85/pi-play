import useIpcData, { type UseIpcDataReturn } from '@renderer/hooks/useIpcData'

const useLoadingContacts = (): UseIpcDataReturn<boolean> => {
    return useIpcData<boolean>(
        window.api.phoneBook.loadingContacts.get,
        callback => window.api.phoneBook.loadingContacts.subscribe(callback),
        false
    )
}
export default useLoadingContacts
