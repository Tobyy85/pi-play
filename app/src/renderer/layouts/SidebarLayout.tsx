import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'

import Sidebar from '@renderer/features/sidebar/components/Sidebar'

interface SidebarLayoutProps {
    children?: ReactNode
}

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
    return (
        <div className='pointer-events-none absolute top-0 left-0 flex h-dvh w-dvw gap-10 p-2'>
            <div className='pointer-events-auto'>
                <Sidebar />
            </div>
            <main className='w-full overflow-hidden'>{children ?? <Outlet />}</main>
        </div>
    )
}
export default SidebarLayout
