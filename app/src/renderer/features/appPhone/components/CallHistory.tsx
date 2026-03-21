import CallHistoryTile from '@renderer/features/appPhone/components/CallHistoryTile'

import useLoadingCallHistory from '@renderer/features/appPhone/hooks/useLoadingCallHistory'
import { useCallHistory } from '@renderer/features/appPhone/store/useCallHistoryStore'

const CallHistory = () => {
    const callHistory = useCallHistory()
    const { data: loadingCallHistory } = useLoadingCallHistory()

    if (loadingCallHistory && (!callHistory || callHistory.length === 0)) {
        return (
            <div className='flex h-full items-center justify-center'>
                <span className='text-2xl text-white'>Loading call history...</span>
            </div>
        )
    }

    return (
        <div className='no-scrollbar size-full overflow-y-auto'>
            <div className='flex h-full flex-col'>
                {callHistory?.map(callEntry => (
                    <CallHistoryTile
                        key={`${callEntry.phoneNumber}${callEntry.dateTime}`}
                        callEntry={callEntry}
                    />
                ))}
            </div>
        </div>
    )
}
export default CallHistory
