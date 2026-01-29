import { Outlet } from 'react-router-dom'

import Sidebar from '@renderer/features/sidebar/components/Sidebar'

const SidebarLayout = () => {
    return (
        <div className='gap absolute top-0 left-0 flex h-dvh w-dvw gap-10 p-2'>
            <Sidebar />
            <main className='w-full'>
                <Outlet />
            </main>
        </div>
    )
}
export default SidebarLayout
