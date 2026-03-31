import type { CallInfo } from '@shared/types/call'

import useIpcData, { type UseIpcDataReturn } from '@renderer/hooks/useIpcData'

const useCallInfo = (): UseIpcDataReturn<CallInfo> => {
    return useIpcData<CallInfo>(
        async () => await window.api.call.callInfo.get(),
        callback => window.api.call.callInfo.subscribe(callback)
    )
}
export default useCallInfo
