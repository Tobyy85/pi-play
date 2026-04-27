import { GoArrowDownLeft, GoArrowUpRight } from 'react-icons/go'

import CallButton from '@renderer/features/appPhone/components/CallButton'
import ContactPhoto from '@renderer/features/appPhone/components/ContactPhoto'

import { useContact } from '@renderer/features/appPhone/store/usePhoneBookStore'
import { formatRelativeDate } from '@renderer/features/appPhone/utils/datetime'
import type { CallHistoryEntry } from '@shared/types/phoneBook'

interface CallHistoryTileProps {
    callEntry: CallHistoryEntry
}

const CallHistoryTile = ({ callEntry }: CallHistoryTileProps) => {
    const contact = useContact(callEntry.phoneNumber)

    return (
        <div
            className='flex h-18 items-center justify-between border-zinc-600 py-2
                [&:not(:last-child)]:border-b'
        >
            <div className='flex h-full items-center gap-4'>
                <ContactPhoto
                    contact={{
                        name: callEntry.name,
                        phoneNumber: callEntry.phoneNumber,
                        photo: contact?.photo,
                    }}
                    className='aspect-square h-full overflow-hidden rounded-full'
                />
                <div className='flex items-center gap-2'>
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {callEntry.type === 'RECEIVED' ? (
                        <GoArrowDownLeft className='text-xl text-white/70' />
                    ) : callEntry.type === 'DIALED' ? (
                        <GoArrowUpRight className='text-xl text-white/70' />
                    ) : (
                        <GoArrowDownLeft className='text-xl text-red-500/90' />
                    )}
                    <div className='text-3xl font-bold text-white'>{callEntry.name}</div>
                </div>
            </div>
            <div className='flex h-full items-center gap-3'>
                <p className='text-white/70'>{formatRelativeDate(callEntry.dateTime)}</p>
                <CallButton phoneNumber={callEntry.phoneNumber} />
            </div>
        </div>
    )
}
export default CallHistoryTile
