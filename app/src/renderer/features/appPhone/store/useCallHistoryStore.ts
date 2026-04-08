import type { CallHistoryEntry } from '@shared/types/phoneBook'
import { create } from 'zustand'

interface CallHistoryStore {
    isLoading: boolean
    initialized: boolean
    initialize: () => Promise<void>
    refreshCallHistory: () => Promise<void>

    callHistory: CallHistoryEntry[] | null
}

let callHistoryUnsubscribe: (() => void) | null = null
let initializePromise: Promise<void> | null = null

export const useCallHistoryStore = create<CallHistoryStore>((set, get) => ({
    isLoading: false,
    initialized: false,
    callHistory: null,

    refreshCallHistory: async () => {
        set({ isLoading: true })
        try {
            const callHistory = await window.api.phoneBook.callHistory.get()
            set({ callHistory, initialized: true })
        } catch (err) {
            console.error('[useCallHistoryStore]: Failed to load call history: ', err)
        } finally {
            set({ isLoading: false })
        }
    },

    initialize: async () => {
        if (get().initialized) return
        if (initializePromise) {
            await initializePromise
            return
        }

        initializePromise = (async () => {
            await get().refreshCallHistory()

            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            if (!callHistoryUnsubscribe) {
                callHistoryUnsubscribe = window.api.phoneBook.callHistory.subscribe(callHistory => {
                    set({ callHistory })
                })
            }

            set({ initialized: true })
        })()

        try {
            await initializePromise
        } finally {
            initializePromise = null
        }
    },
}))

void useCallHistoryStore.getState().initialize()

export const useCallHistory = (): CallHistoryEntry[] | null => {
    return useCallHistoryStore(state => state.callHistory)
}
