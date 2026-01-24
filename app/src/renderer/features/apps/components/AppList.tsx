import AppIcon from '@renderer/features/apps/components/AppIcon'

import APP_REGISTRY from '@renderer/features/apps/config/appRegistry'

import { BASE_PATH } from '@renderer/features/apps/config/route'

const AppList = () => {
    return (
        <div className='no-scrollbar rounded-squircle h-full overflow-y-scroll'>
            <div className='flex min-h-full flex-col justify-center gap-4'>
                {APP_REGISTRY.map(app => (
                    <AppIcon
                        iconSource={app.icon}
                        name={app.name}
                        path={`/${BASE_PATH}/${app.id}`}
                        key={app.id}
                    />
                ))}
            </div>
        </div>
    )
}
export default AppList
