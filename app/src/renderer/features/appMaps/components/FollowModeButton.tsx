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
                className={`absolute right-4 bottom-4 flex size-14 cursor-pointer items-center justify-center
                    rounded-full bg-black/75 p-3 text-white shadow-lg ${followMode && 'hidden'}`}
                title={followMode ? 'Following GPS position' : 'Click to follow GPS'}
            >
                <PiGpsFixFill className='size-full' />
            </button>
        </>
    )
}
export default FollowModeButton
