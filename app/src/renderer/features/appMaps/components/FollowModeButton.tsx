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
                className={`absolute right-0 bottom-0 flex p-4 ${followMode && 'hidden'}`}
                title={followMode ? 'Following GPS position' : 'Click to follow GPS'}
            >
                <div
                    className='size-14 items-center justify-center rounded-full bg-black/75 p-3 text-white
                        shadow-lg'
                >
                    <PiGpsFixFill className='size-full' />
                </div>
            </button>
        </>
    )
}
export default FollowModeButton
