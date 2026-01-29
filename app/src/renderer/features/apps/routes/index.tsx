import type { RouteObject } from 'react-router-dom'

import PageWithBackground from '@renderer/components/PageWithBackground'
import SidebarLayout from '@renderer/layouts/SidebarLayout'

import APP_REGISTRY from '@renderer/features/apps/config/appRegistry'
import { BASE_PATH } from '@renderer/features/apps/config/route'

export const appsRoutes: RouteObject = {
    path: BASE_PATH,
    element: <SidebarLayout />,
    children: APP_REGISTRY.map(app => ({
        path: app.id,
        element: (
            <PageWithBackground background={<app.backgroundComponent />}>
                <app.contentComponent />
            </PageWithBackground>
        ),
    })),
}
