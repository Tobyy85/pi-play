import CallHistoryTile from '@renderer/features/appPhone/components/CallHistoryTile'

import { useCallHistory } from '@renderer/features/appPhone/store/useCallHistoryStore'

const CallHistory = () => {
    const callHistory = useCallHistory()

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
