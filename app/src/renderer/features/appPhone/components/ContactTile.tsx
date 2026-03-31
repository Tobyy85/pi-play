import CallIcon from '@renderer/features/appPhone/assets/CallIcon'

import ContactPhoto from '@renderer/features/appPhone/components/ContactPhoto'

import type { Contact } from '@shared/types/phoneBook'

interface ContactTileProps {
    contact: Contact
}

const ContactTile = ({ contact }: ContactTileProps) => {
    return (
        <div
            className='flex h-18 items-center justify-between border-zinc-600 py-2
                [&:not(:last-child)]:border-b'
        >
            <div className='flex h-full items-center gap-4'>
                <ContactPhoto
                    contact={contact}
                    className='aspect-square h-full overflow-hidden rounded-full'
                />
                <div className='text-3xl font-bold text-white'>{contact.name}</div>
            </div>
            <button
                onClick={async () => await window.api.call.dial(contact.phoneNumber)}
                className='flex aspect-square h-5/6 items-center justify-center rounded-full bg-zinc-600 p-3'
            >
                <CallIcon className='size-full text-blue-500' />
            </button>
        </div>
    )
}
export default ContactTile
