import PageWithBackground from '@renderer/components/PageWithBackground'

const HomeBackground = () => {
    return <div className='size-full bg-blue-500' />
}

const HomeContent = () => {
    return (
        <div>
            <h1>HomePage</h1>
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
