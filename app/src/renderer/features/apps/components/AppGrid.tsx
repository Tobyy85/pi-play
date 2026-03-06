import AppIcon from '@renderer/features/apps/components/AppIcon'

import APP_REGISTRY from '@renderer/features/apps/config/appRegistry'

import { BASE_PATH } from '@renderer/features/apps/config/route'

const AppGrid = () => {
    return (
        <div
            className='grid w-full grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] items-start justify-start
                gap-6'
        >
            {APP_REGISTRY.map(app => (
                <AppIcon
                    iconSource={app.icon}
                    name={app.name}
                    showName={true}
                    path={`/${BASE_PATH}/${app.id}`}
                    key={app.id}
                    className='w-full max-w-32 justify-self-center'
                />
            ))}
        </div>
    )
}
export default AppGrid
