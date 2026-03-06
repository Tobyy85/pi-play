import AppGrid from '@renderer/features/apps/components/AppGrid'

export const AllAppsPageBackground = () => {
    return <div className='size-full bg-zinc-700' />
}

export const AllAppsPageContent = () => {
    return (
        <div className='no-scrollbar size-full overflow-y-auto p-4'>
            <AppGrid />
        </div>
    )
}
