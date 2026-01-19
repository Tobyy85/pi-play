import AppIcon from '@renderer/features/apps/components/AppIcon'

import { appList } from '@renderer/features/apps/constants/appList'

const AppList = () => {
    return (
        <div className='no-scrollbar rounded-squircle h-full overflow-y-scroll'>
            <div className='flex min-h-full flex-col justify-center gap-4'>
                {appList.map(app => (
                    <AppIcon
                        iconSource={app.iconSource}
                        name={app.name}
                        path={app.path}
                        key={app.path}
                    />
                ))}
            </div>
        </div>
    )
}
export default AppList
