import { PiGpsFixFill } from 'react-icons/pi'

interface FollowModeButtonProps {
    enableFollowMode: () => void
}

const FollowModeButton = ({ enableFollowMode }: FollowModeButtonProps) => {
    return (
        <>
            <button
                onClick={enableFollowMode}
                className='p-4 pl-2'
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
