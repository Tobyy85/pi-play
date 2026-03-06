import type { CallInfo } from '@shared/types/call'

import useIpcData from '@renderer/hooks/useIpcData'

const useCallInfo = () => {
    return useIpcData<CallInfo>(
        () => window.api.call.callInfo.get(),
        callback => window.api.call.callInfo.subscribe(callback)
    )
}
export default useCallInfo
