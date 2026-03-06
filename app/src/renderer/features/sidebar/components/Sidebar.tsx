import AppList from '@renderer/features/apps/components/AppList'
import AllAppsButton from '@renderer/features/sidebar/components/AllAppsButton'
import SidebarInfo from '@renderer/features/sidebar/components/SidebarInfo'

const Sidebar = () => {
    return (
        <>
            <div
                className='rounded-squircle flex h-full w-24 shrink-0 flex-col items-center gap-3 bg-black/50
                    p-2 pb-4'
            >
                <SidebarInfo />
                <AppList />
                <AllAppsButton />
            </div>
        </>
    )
}
export default Sidebar
