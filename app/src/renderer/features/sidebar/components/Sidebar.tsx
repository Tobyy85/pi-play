
import AppList from '@renderer/features/apps/components/AppList'
import AllAppsButton from '@renderer/features/sidebar/components/AllAppsButton'
import SidebarInfo from '@renderer/features/sidebar/components/SidebarInfo'

import LongPressWrapper from '@renderer/components/LongPressWrapper'



const Sidebar = () => {
    return (
        <>
            <div
                className='flex h-full w-24 shrink-0 flex-col items-center gap-3 rounded-4xl bg-black/50 p-2.5
                    pb-4'
            >
                <SidebarInfo />
                <AppList />
                <LongPressWrapper onLongPress={window.api.quitApp} pressDuration={3000}>
                    <AllAppsButton />
                </LongPressWrapper>
            </div>
        </>
    )
}
export default Sidebar
