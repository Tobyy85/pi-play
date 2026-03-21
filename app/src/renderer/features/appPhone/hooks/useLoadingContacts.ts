import useIpcData from '@renderer/hooks/useIpcData'

const useLoadingContacts = () => {
    return useIpcData<boolean>(
        window.api.phoneBook.loadingContacts.get,
        callback => window.api.phoneBook.loadingContacts.subscribe(callback),
        false
    )
}
export default useLoadingContacts
