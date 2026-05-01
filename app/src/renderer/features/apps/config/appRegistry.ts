import ReverseCameraIcon from '@renderer/assets/reverse-camera-icon.svg'
import { AppReverseCameraBackground, AppReverseCameraContent } from '@renderer/features/appReverseCamera'

import MapsIcon from '@renderer/assets/maps-icon.svg'
import { AppMapsBackground, AppMapsContent } from '@renderer/features/appMaps'

import MusicIcon from '@renderer/assets/music-icon.svg'
import { AppMusicBackground, AppMusicContent } from '@renderer/features/appMusic'

import PhoneIcon from '@renderer/assets/phone-icon.svg'
import { AppPhoneContent } from '@renderer/features/appPhone'

import RadioIcon from '@renderer/assets/radio-icon.svg'
import { AppRadioContent } from '@renderer/features/appRadio'

interface AppRegistryItem {
    name: string
    id: string
    icon: string
    contentComponent: React.ComponentType
    backgroundComponent?: React.ComponentType
}

const APP_REGISTRY: AppRegistryItem[] = [
    {
        name: 'Music',
        id: 'music',
        icon: MusicIcon,
        contentComponent: AppMusicContent,
        backgroundComponent: AppMusicBackground,
    },
    {
        name: 'Maps',
        id: 'maps',
        icon: MapsIcon,
        contentComponent: AppMapsContent,
        backgroundComponent: AppMapsBackground,
    },
    {
        name: 'Phone',
        id: 'phone',
        icon: PhoneIcon,
        contentComponent: AppPhoneContent,
    },
    {
        name: 'Reverse Camera',
        id: 'reverse-camera',
        icon: ReverseCameraIcon,
        contentComponent: AppReverseCameraContent,
        backgroundComponent: AppReverseCameraBackground,
    },
    {
        name: 'Radio',
        id: 'radio',
        icon: RadioIcon,
        contentComponent: AppRadioContent,
    },
]

export default APP_REGISTRY
