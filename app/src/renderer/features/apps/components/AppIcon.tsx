import { NavLink } from 'react-router-dom'

export interface AppIconProps {
    iconSource: string
    name: string
    path: string
}

const AppIcon = ({ iconSource, name, path }: AppIconProps) => {
    return (
        <>
            <NavLink
                to={path}
                className={({ isActive }) =>
                    `rounded-squircle flex size-20 shrink-0 flex-col items-center justify-center
                    overflow-hidden bg-white ${isActive ? 'brightness-100' : 'brightness-90'}`
                }
            >
                <img
                    src={iconSource}
                    alt={`${name} icon`}
                    className='size-full object-cover'
                />
            </NavLink>
        </>
    )
}
export default AppIcon
