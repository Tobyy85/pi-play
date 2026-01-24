import HomeRoute from '@renderer/routes/Home'
import NotFoundRoute from '@renderer/routes/NotFound'

import { appsRoutes } from '@renderer/features/apps/routes'

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
            appsRoutes,
        ],
    },
]
