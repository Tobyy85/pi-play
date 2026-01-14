import DisplayTime from '@renderer/features/Sidebar/components/DisplayTime'

const SidebarInfo = () => {
    return (
        <>
            <div className='align-center flex flex-col'>
                <SidebarInfoText>
                    <DisplayTime />
                </SidebarInfoText>
                <SidebarInfoText className='my-[-0.25rem]'>10°C</SidebarInfoText>
            </div>
        </>
    )
}
export default SidebarInfo

interface SidebarInfoTextProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode
    props?: React.HTMLAttributes<HTMLSpanElement>
}
const SidebarInfoText = ({ children, ...props }: SidebarInfoTextProps) => {
    return (
        <span className={`text-center text-2xl font-bold text-white ${props.className ?? ''}`}>
            {children}
        </span>
    )
}
