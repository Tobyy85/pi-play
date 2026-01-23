import type { AppIconProps } from '@renderer/features/apps/components/AppIcon'

import ReverseCameraIcon from '@renderer/assets/reverse-camera-icon.png'

export const appList: AppIconProps[] = [
    {
        name: 'Reverse Camera',
        iconSource: ReverseCameraIcon,
        path: '/apps/reverse-camera',
    },
]
