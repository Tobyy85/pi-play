import type { RouteObject } from 'react-router-dom'

import SidebarLayout from '@renderer/layouts/SidebarLayout'

import APP_REGISTRY from '@renderer/features/apps/config/appRegistry'
import { BASE_PATH } from '@renderer/features/apps/config/route'

export const appsRoutes: RouteObject = {
    path: BASE_PATH,
    children: APP_REGISTRY.map(app => ({
        path: app.id,
        element: (
            <SidebarLayout background={<app.backgroundComponent />}>
                <app.contentComponent />
            </SidebarLayout>
        ),
    })),
}
