import AppList from '@renderer/features/apps/components/AppList'
import SidebarInfo from '@renderer/features/sidebar/components/SidebarInfo'

const Sidebar = () => {
    return (
        <>
            <div className='rounded-squircle flex h-full w-24 shrink-0 flex-col gap-3 bg-black/50 p-2'>
                <SidebarInfo />
                <AppList />
            </div>
        </>
    )
}
export default Sidebar
