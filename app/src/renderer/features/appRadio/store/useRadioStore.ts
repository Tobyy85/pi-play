import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { RadioStation } from '@renderer/features/appRadio/types'

import { fetchRadioStations } from '@renderer/features/appRadio/utils'
import { zustandPersistStorage } from '@renderer/utils/storage'

interface RadioState {
    isPlaying: boolean
    currentStation: RadioStation | null
    stations: RadioStation[] | null

    setCurrentStation: (station: RadioStation | null) => void
    setIsPlaying: (isPlaying: boolean) => void

    fetchStations: () => Promise<void>
}

export const useRadioStore = create<RadioState>()(
    persist(
        (set, get) => ({
            currentStation: null,
            isPlaying: false,
            stations: null,

            setCurrentStation: station => set({ currentStation: station }), // eslint-disable-line @typescript-eslint/strict-void-return
            setIsPlaying: isPlaying => set({ isPlaying }), // eslint-disable-line @typescript-eslint/strict-void-return
            fetchStations: async () => {
                if (get().stations !== null) return

                const stations = await fetchRadioStations()
                set({ stations })
            },
        }),
        {
            name: 'radio-store',
            storage: createJSONStorage(() => zustandPersistStorage),
            partialize: state => ({
                currentStation: state.currentStation,
                isPlaying: state.isPlaying,
            }),
        }
    )
)
void useRadioStore.getState().fetchStations() // Fetch stations on store initialization

export const useCurrentStation = () => useRadioStore(state => state.currentStation) // eslint-disable-line @typescript-eslint/explicit-function-return-type
export const useIsPlaying = () => useRadioStore(state => state.isPlaying) // eslint-disable-line @typescript-eslint/explicit-function-return-type
export const useStations = (): RadioStation[] | null => useRadioStore(state => state.stations)

export const setCurrentStation = (station: RadioStation | null): void =>
    useRadioStore.getState().setCurrentStation(station)
export const setIsPlaying = (isPlaying: boolean): void => useRadioStore.getState().setIsPlaying(isPlaying)
