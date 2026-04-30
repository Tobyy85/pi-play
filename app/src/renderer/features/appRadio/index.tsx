import { useState } from 'react'

import AllStations from '@renderer/features/appRadio/components/AllStations'
import PlayingStation from '@renderer/features/appRadio/components/PlayingStation'
import Background from '@renderer/features/background/components/Background'

import {
    setCurrentStation,
    setIsPlaying,
    useCurrentStation,
} from '@renderer/features/appRadio/store/useRadioStore'

import type { RadioStation } from '@renderer/features/appRadio/types'

export const AppRadioBackground = () => {
    return <Background />
}

export const AppRadioContent = () => {
    const currentStation = useCurrentStation()

    const [isSelectingStation, setIsSelectingStation] = useState<boolean>(!currentStation)

    return (
        <>
            {isSelectingStation || !currentStation ? (
                <AllStations
                    onStationSelect={(station: RadioStation) => {
                        setCurrentStation(station)
                        setIsSelectingStation(false)
                        setIsPlaying(true)
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
