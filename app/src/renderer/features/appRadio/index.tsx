import { useState } from 'react'

import AllStations from '@renderer/features/appRadio/components/AllStations'
import PlayingStation from '@renderer/features/appRadio/components/PlayingStation'
import Background from '@renderer/features/background/components/Background'

import useCurrentStation from '@renderer/features/appRadio/hooks/useCurrentStation'

import type { RadioStation } from '@shared/types/radio'

export const AppRadioBackground = () => {
    return <Background />
}

export const AppRadioContent = () => {
    const { data: currentStation } = useCurrentStation()

    const [isSelectingStation, setIsSelectingStation] = useState<boolean>(!currentStation)

    return (
        <>
            {isSelectingStation || !currentStation ? (
                <AllStations
                    onStationSelect={(station: RadioStation) => {
                        setIsSelectingStation(false)
                        void window.api.radio.currentStation.set(station)
                        void window.api.radio.isPlaying.set(true)
                    }}
                />
            ) : (
                <PlayingStation
                    station={currentStation}
                    goBack={() => setIsSelectingStation(true)}
                />
            )}
        </>
    )
}
