import ContactPhoto from '@renderer/features/appPhone/components/ContactPhoto'
import AnswerCallButton from '@renderer/features/call/components/AnswerCallButton'
import HangupCallButton from '@renderer/features/call/components/HangupCallButton'

import { useContact } from '@renderer/features/appPhone/store/usePhoneBookStore'
import useCallInfo from '@renderer/features/call/hooks/useCallInfo'

import { formatPhoneNumber } from '@shared/utils/phoneBook'

const CallOverlay = () => {
    const { data: callInfo, isLoading } = useCallInfo()

    const contact = useContact(callInfo?.lineIdentification || '')

    if (isLoading || !callInfo || callInfo.state === 'disconnected') {
        return <></>
    }

    return (
        <div
            className='pointer-events-none fixed top-4 z-50 flex w-full justify-center
                [&_*]:pointer-events-auto'
        >
            <div
                className='flex h-18 max-w-md min-w-xs items-center justify-between gap-3 rounded-full
                    bg-black/70 p-3 backdrop-blur-sm'
            >
                <div className='flex h-full min-w-0 flex-1 items-center gap-3'>
                    {contact && (
                        <ContactPhoto
                            contact={contact}
                            className='h-full shrink-0 overflow-hidden rounded-full'
                        />
                    )}
                    <p className='`w-full truncate text-3xl font-bold text-clip text-white/90'>
                        {contact?.name || formatPhoneNumber(callInfo.lineIdentification)}
                    </p>
                </div>
                <div className='flex h-full items-center gap-3 py-0.5'>
                    <HangupCallButton className='h-full' />
                    {callInfo.state === 'incoming' && <AnswerCallButton className='h-full' />}
                </div>
            </div>
        </div>
    )
}

export default CallOverlay
