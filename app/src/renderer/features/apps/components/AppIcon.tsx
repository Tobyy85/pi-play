import { NavLink } from 'react-router-dom'

export interface AppIconProps {
    iconSource: string
    name: string
    showName?: boolean
    path: string
}

const AppIcon = ({ iconSource, name, showName, path }: AppIconProps) => {
    return (
        <>
            <NavLink
                to={path}
                className={({ isActive }) =>
                    `flex w-20 shrink-0 flex-col gap-1 overflow-hidden
                    ${isActive ? 'brightness-100' : 'brightness-90'}`
                }
            >
                <div
                    className='rounded-squircle flex aspect-square items-center justify-center overflow-hidden
                        bg-white'
                >
                    <img
                        src={iconSource}
                        alt={`${name} icon`}
                        className='size-full object-cover'
                    />
                </div>
                {showName && (
                    <span className='truncate text-center text-sm font-semibold text-white'>{name}</span>
                )}
            </NavLink>
        </>
    )
}
export default AppIcon
