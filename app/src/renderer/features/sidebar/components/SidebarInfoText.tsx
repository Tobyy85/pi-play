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

export default SidebarInfoText
