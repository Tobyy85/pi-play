import { FaMapMarkerAlt } from 'react-icons/fa'

interface FollowModeButtonProps {
    followMode: boolean
    toggleFollowMode: () => void
}

const FollowModeButton = ({ followMode, toggleFollowMode }: FollowModeButtonProps) => {
    return (
        <>
            <button
                onClick={toggleFollowMode}
                className={`absolute right-4 bottom-4 size-10 cursor-pointer rounded-full p-2.5 text-white
                    shadow-lg transition-colors ${followMode ? 'bg-blue-400' : 'bg-black/75'}`}
                title={followMode ? 'Following GPS position' : 'Click to follow GPS'}
            >
                <FaMapMarkerAlt className='size-full' />
            </button>
        </>
    )
}
export default FollowModeButton
