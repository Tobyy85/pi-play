import { NavLink } from 'react-router-dom'

import { BsApp } from 'react-icons/bs'

const AllAppsButton = () => {
    return (
        <NavLink
            to='/apps'
            end={true}
            className={({ isActive }) => ` ${isActive ? 'opacity-100' : 'opacity-80'}`}
        >
            <BsApp className='size-10 text-white' />
        </NavLink>
    )
}
export default AllAppsButton
