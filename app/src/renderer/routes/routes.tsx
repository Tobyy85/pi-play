import type { RouteObject } from 'react-router-dom'

import ReverseTriggerLayout from '@renderer/layouts/ReverseTriggerLayout'
import SidebarLayout from '@renderer/layouts/SidebarLayout'

import HomeRoute from '@renderer/routes/Home'
import NotFoundRoute from '@renderer/routes/NotFound'

import { appsRoutes } from '@renderer/features/apps/routes'

export const routes: RouteObject[] = [
    {
        element: <ReverseTriggerLayout />,
        errorElement: <NotFoundRoute />,
        children: [
            {
                path: '/',
                element: <SidebarLayout />,
                children: [
                    {
                        index: true,
                        element: <HomeRoute />,
                    },
                ],
            },
            appsRoutes,
        ],
    },
]
