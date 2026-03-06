import type { RouteObject } from 'react-router-dom'

import PageWithBackground from '@renderer/components/PageWithBackground'
import SidebarLayout from '@renderer/layouts/SidebarLayout'

import { AllAppsPageBackground, AllAppsPageContent } from '@renderer/features/apps/components/AllAppsPage'

import APP_REGISTRY from '@renderer/features/apps/config/appRegistry'
import { BASE_PATH } from '@renderer/features/apps/config/route'

export const appsRoutes: RouteObject = {
    path: BASE_PATH,
    element: <SidebarLayout />,
    children: [
        {
            index: true,
            element: (
                <PageWithBackground background={<AllAppsPageBackground />}>
                    <AllAppsPageContent />
                </PageWithBackground>
            ),
        },
        ...APP_REGISTRY.map(app => ({
            path: app.id,
            element: (
                <PageWithBackground background={<app.backgroundComponent />}>
                    <app.contentComponent />
                </PageWithBackground>
            ),
        })),
    ],
}
