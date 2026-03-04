import CallIcon from '@renderer/features/appPhone/assets/CallIcon'

const AnswerCallButton = ({ ...buttonProps }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <>
            <button
                {...buttonProps}
                onClick={window.api.call.answer}
                className={`aspect-square rounded-full bg-green-500 p-2 ${buttonProps.className || ''}`}
            >
                <CallIcon className='size-full text-white' />
            </button>
        </>
    )
}
export default AnswerCallButton
