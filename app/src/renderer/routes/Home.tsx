import PageWithBackground from '@renderer/components/PageWithBackground'

import AppGrid from '@renderer/features/apps/components/AppGrid'

const HomeBackground = () => {
    return <div className='size-full bg-zinc-700' />
}

const HomeContent = () => {
    return (
        <div className='no-scrollbar size-full overflow-y-auto p-4'>
            <AppGrid />
        </div>
    )
}

const HomeRoute = () => {
    return (
        <PageWithBackground background={<HomeBackground />}>
            <HomeContent />
        </PageWithBackground>
    )
}
export default HomeRoute
