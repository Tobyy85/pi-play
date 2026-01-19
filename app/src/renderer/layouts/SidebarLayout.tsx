import Sidebar from '@renderer/features/sidebar/components/Sidebar'

interface SidebarLayoutProps {
    background: React.ReactNode
    children: React.ReactNode
}

const SidebarLayout = ({ background, children }: SidebarLayoutProps) => {
    return (
        <div>
            <div className='static top-0 left-0 h-dvh w-dvw'>{background}</div>
            <div className='gap absolute top-0 left-0 flex h-dvh w-dvw gap-10 p-2'>
                <Sidebar />
                <main className='w-full'>{children}</main>
            </div>
        </div>
    )
}
export default SidebarLayout
