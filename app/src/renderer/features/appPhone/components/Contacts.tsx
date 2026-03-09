import ContactTile from '@renderer/features/appPhone/components/ContactTile'

import { useContacts } from '@renderer/features/appPhone/store/usePhoneBookStore'

const Contacts = () => {
    const contacts = useContacts()

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
