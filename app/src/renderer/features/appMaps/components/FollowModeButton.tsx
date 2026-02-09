import { PiGpsFixFill } from 'react-icons/pi'

interface FollowModeButtonProps {
    followMode: boolean
    toggleFollowMode: () => void
}

const FollowModeButton = ({ followMode, toggleFollowMode }: FollowModeButtonProps) => {
    return (
        <>
            <button
                onClick={toggleFollowMode}
                className={`absolute right-4 bottom-4 size-10 cursor-pointer rounded-full p-2 text-white
                    shadow-lg transition-colors duration-300 ${followMode ? 'bg-blue-400' : 'bg-black/75'}`}
                title={followMode ? 'Following GPS position' : 'Click to follow GPS'}
            >
                <PiGpsFixFill className='size-full' />
            </button>
        </>
    )
}
export default FollowModeButton
