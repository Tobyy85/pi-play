import { useEffect, useState } from 'react'

import AllStations from '@renderer/features/appRadio/components/AllStations'
import PlayingStation from '@renderer/features/appRadio/components/PlayingStation'

import useCurrentStation from '@renderer/features/appRadio/hooks/useCurrentStation'

import type { RadioStation } from '@shared/types/radio'

export const AppRadioContent = () => {
    const { data: currentStation, isLoading } = useCurrentStation()
    const [isSelectingStation, setIsSelectingStation] = useState<boolean>(false)

    useEffect(() => {
        setIsSelectingStation(!isLoading && !currentStation)
    }, [isLoading]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            {isSelectingStation && (
                <AllStations
                    onStationSelect={(station: RadioStation) => {
                        setIsSelectingStation(false)
                        void window.api.radio.currentStation.set(station)
                        void window.api.radio.isPlaying.set(true)
                    }}
                />
            )}
            {!isSelectingStation && currentStation && (
                <PlayingStation
                    station={currentStation}
                    goBack={() => setIsSelectingStation(true)}
                />
            )}
        </>
    )
}
