import SidebarLayout from '@renderer/layouts/SidebarLayout'

import APP_REGISTRY from '@renderer/features/apps/config/appRegistry'

export const BASE_PATH = 'apps'

export const appsRoutes = {
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
