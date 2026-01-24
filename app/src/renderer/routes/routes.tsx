import type { RouteObject } from 'react-router-dom'

import ReverseTriggerLayout from '@renderer/layouts/ReverseTriggerLayout'

import HomeRoute from '@renderer/routes/Home'
import NotFoundRoute from '@renderer/routes/NotFound'

import { appsRoutes } from '@renderer/features/apps/routes'

export const routes: RouteObject[] = [
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
