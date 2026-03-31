import CallEndIcon from '@renderer/features/appPhone/assets/CallEndIcon'

const HangupCallButton = ({ ...buttonProps }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <>
            <button
                {...buttonProps}
                onClick={window.api.call.hangup}
                className={`aspect-square rounded-full bg-red-500 p-2 ${buttonProps.className ?? ''}`}
            >
                <CallEndIcon className='size-full text-white' />
            </button>
        </>
    )
}
export default HangupCallButton
