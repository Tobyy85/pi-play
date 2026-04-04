import CompassIcon from '@renderer/features/appMaps/assets/CompassIcon'

interface CompassButtonProps {
    bearing: number
    resetBearing: () => void
}

const CompassButton = ({ bearing, resetBearing }: CompassButtonProps) => {
    return (
        <>
            <button
                onClick={resetBearing}
                className='p-4 pr-2'
            >
                <div
                    className='size-14 items-center justify-center rounded-full bg-black/75 p-3 text-white
                        shadow-lg'
                >
                    <CompassIcon
                        className='size-full transition-transform'
                        style={{ transform: `rotate(${bearing}deg)` }}
                    />
                </div>
            </button>
        </>
    )
}
export default CompassButton
