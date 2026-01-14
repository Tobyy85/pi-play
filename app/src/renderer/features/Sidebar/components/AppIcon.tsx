import { NavLink } from 'react-router-dom'

export interface AppIconProps {
    iconSource: string
    name: string
    path: string
}

const AppIcon = ({ iconSource: icon, name, path }: AppIconProps) => {
    return (
        <>
            <NavLink
                to={path}
                className={({ isActive }) =>
                    `rounded-squircle flex h-20 w-20 shrink-0 flex-col items-center justify-center bg-white
                    ${isActive ? 'brightness-100' : 'brightness-90'}`
                }
            >
                <img
                    src={icon}
                    alt={`${name} icon`}
                    className='h-3/4 w-3/4 object-contain'
                />
            </NavLink>
        </>
    )
}
export default AppIcon
