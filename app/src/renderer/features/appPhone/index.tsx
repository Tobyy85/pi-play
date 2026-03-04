import ContactTile from '@renderer/features/appPhone/components/ContactTile'

import { useContacts } from '@renderer/features/appPhone/store/usePhoneBookStore'

export const AppPhoneBackground = () => {
    return <div className='h-full w-full bg-zinc-700'></div>
}

export const AppPhoneContent = () => {
    const contacts = useContacts()

    return (
        <div className='size-full pr-8'>
            <div className='no-scrollbar size-full overflow-y-auto'>
                <div className='flex h-full flex-col'>
                    {contacts?.map(contact => (
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
