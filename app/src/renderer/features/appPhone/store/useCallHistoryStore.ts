import type { CallHistoryEntry } from '@shared/types/phoneBook'
import { create } from 'zustand'

interface CallHistoryStore {
    callHistory: CallHistoryEntry[] | null
    isLoading: boolean
    initialized: boolean
    loadCallHistory: () => Promise<void>
}

export const useCallHistoryStore = create<CallHistoryStore>(set => ({
    isLoading: false,
    initialized: false,
    callHistory: null,

    loadCallHistory: async () => {
        set({ isLoading: true })
        try {
            const callHistory = await window.api.phoneBook.getCallHistory()
            set({ callHistory, initialized: true })
        } catch (err) {
            console.error('Failed to load call history:', err)
        } finally {
            set({ isLoading: false })
        }
    },
}))
useCallHistoryStore.getState().loadCallHistory()

export const useCallHistory = (): CallHistoryEntry[] | null => {
    return useCallHistoryStore(state => state.callHistory)
}
