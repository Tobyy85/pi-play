import ReverseCameraIcon from '@renderer/assets/reverse-camera-icon.png'
import { AppReverseCameraBackground, AppReverseCameraContent } from '@renderer/features/appReverseCamera'

import MapsIcon from '@renderer/assets/maps-icon.png'
import { AppMapsBackground, AppMapsContent } from '@renderer/features/appMaps'

import MusicIcon from '@renderer/assets/music-icon.png'
import { AppMusicBackground, AppMusicContent } from '@renderer/features/appMusic'

interface AppRegistryItem {
    name: string
    id: string
    icon: string
    contentComponent: React.ComponentType
    backgroundComponent: React.ComponentType
}

const APP_REGISTRY: AppRegistryItem[] = [
    {
        name: 'Reverse Camera',
        id: 'reverse-camera',
        icon: ReverseCameraIcon,
        contentComponent: AppReverseCameraContent,
        backgroundComponent: AppReverseCameraBackground,
    },
    {
        name: 'Maps',
        id: 'maps',
        icon: MapsIcon,
        contentComponent: AppMapsContent,
        backgroundComponent: AppMapsBackground,
    },
    {
        name: 'Music',
        id: 'music',
        icon: MusicIcon,
        contentComponent: AppMusicContent,
        backgroundComponent: AppMusicBackground,
    },
]

export default APP_REGISTRY
