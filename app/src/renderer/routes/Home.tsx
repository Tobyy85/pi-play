import SidebarLayout from '@renderer/layouts/SidebarLayout'

const HomeBackground = () => {
    return <div className='h-full w-full bg-blue-500' />
}

const HomeRoute = () => {
    return (
        <SidebarLayout background={<HomeBackground />}>
            <h1>HomePage</h1>
        </SidebarLayout>
    )
}
export default HomeRoute
