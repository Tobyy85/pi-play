import SidebarLayout from '@renderer/layouts/SidebarLayout'

import APP_REGISTRY from '@renderer/features/apps/config/appRegistry'

export const appsRoutes = APP_REGISTRY.map(app => ({
    path: app.id,
    element: (
        <SidebarLayout background={<app.backgroundComponent />}>
            <app.contentComponent />
        </SidebarLayout>
    ),
}))
