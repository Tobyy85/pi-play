import CallIcon from '@renderer/features/appPhone/assets/CallIcon'

interface CallButtonProps {
    phoneNumber: string
}

const CallButton = ({ phoneNumber }: CallButtonProps) => {
    return (
        <>
            <button
                onClick={async () => await window.api.call.dial(phoneNumber)}
                className='flex aspect-square h-5/6 items-center justify-center rounded-full bg-zinc-600 p-3'
            >
                <CallIcon className='size-full text-blue-500' />
            </button>
        </>
    )
}
export default CallButton
