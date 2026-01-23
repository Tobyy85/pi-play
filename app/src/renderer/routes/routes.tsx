import AppReverseCamera from '@renderer/features/appReverseCamera'
import HomeRoute from '@renderer/routes/Home'
import NotFoundRoute from '@renderer/routes/NotFound'

import ReverseTriggerLayout from '@renderer/layouts/ReverseTriggerLayout'

export const routes = [
    {
        element: <ReverseTriggerLayout />,
        children: [
            {
                path: '/',
                element: <HomeRoute />,
                errorElement: <NotFoundRoute />,
            },
            {
                path: 'apps',
                children: [
                    {
                        path: 'reverse-camera',
                        element: <AppReverseCamera />,
                    },
                ],
            },
        ],
    },
]
