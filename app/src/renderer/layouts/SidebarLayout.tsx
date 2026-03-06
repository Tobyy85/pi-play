import { Outlet } from 'react-router-dom'

import Sidebar from '@renderer/features/sidebar/components/Sidebar'

const SidebarLayout = () => {
    return (
        <div className='pointer-events-none absolute top-0 left-0 flex h-dvh w-dvw gap-10 p-2'>
            <div className='pointer-events-auto'>
                <Sidebar />
            </div>
            <main className='w-full overflow-hidden'>
                <Outlet />
            </main>
        </div>
    )
}
export default SidebarLayout
