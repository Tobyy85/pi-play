import ContactTile from '@renderer/features/appPhone/components/ContactTile'

import useConnectionStatus from '@renderer/features/appPhone/hooks/useConnectionStatus'
import { useContacts } from '@renderer/features/appPhone/store/usePhoneBookStore'

export const AppPhoneBackground = () => {
    return <div className='h-full w-full bg-zinc-700'></div>
}

export const AppPhoneContent = () => {
    const { data: isConnected } = useConnectionStatus()
    const contacts = useContacts()

    if (!isConnected) {
        return (
            <div className='flex size-full items-center justify-center pr-8'>
                <p className='text-2xl text-white'>No phone connected</p>
            </div>
        )
    }

    if (!contacts) {
        return (
            <div className='flex size-full items-center justify-center pr-8'>
                <p className='text-2xl text-white'>Loading contacts...</p>
            </div>
        )
    }

    return (
        <div className='size-full pr-8'>
            <div className='no-scrollbar size-full overflow-y-auto'>
                <div className='flex h-full flex-col'>
                    {contacts.map(contact => (
                        <ContactTile
                            key={`${contact.phoneNumber}${contact.name}`}
                            contact={contact}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
