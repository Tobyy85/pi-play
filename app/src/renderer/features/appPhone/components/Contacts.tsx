import ContactTile from '@renderer/features/appPhone/components/ContactTile'

import useLoadingContacts from '@renderer/features/appPhone/hooks/useLoadingContacts'
import { useContacts } from '@renderer/features/appPhone/store/usePhoneBookStore'

const Contacts = () => {
    const contacts = useContacts()
    const { data: isLoadingContacts } = useLoadingContacts()

    if (isLoadingContacts && (!contacts || contacts.length === 0)) {
        return (
            <div className='flex h-full items-center justify-center'>
                <span className='text-2xl text-white'>Loading contacts...</span>
            </div>
        )
    }

    return (
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
    )
}
export default Contacts
