import AppGrid from '@renderer/features/apps/components/AppGrid'
import Background from '@renderer/features/background/components/Background'

export const AllAppsPageBackground = () => {
    return <Background />
}

export const AllAppsPageContent = () => {
    return (
        <div className='no-scrollbar size-full overflow-y-auto p-4'>
            <AppGrid />
        </div>
    )
}
