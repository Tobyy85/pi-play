import { Outlet } from 'react-router-dom'

import BackgroundLayout from '@renderer/layouts/BackgroundLayout'
import SidebarLayout from '@renderer/layouts/SidebarLayout'

const MainLayout = () => {
    return (
        <SidebarLayout>
            <BackgroundLayout>
                <Outlet />
            </BackgroundLayout>
        </SidebarLayout>
    )
}

export default MainLayout
