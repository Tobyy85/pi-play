import ReverseCameraIcon from '@renderer/assets/reverse-camera-icon.png'
import { AppReverseCameraBackground, AppReverseCameraContent } from '@renderer/features/appReverseCamera'

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
]

export default APP_REGISTRY
