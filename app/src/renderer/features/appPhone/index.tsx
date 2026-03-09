import Contacts from '@renderer/features/appPhone/components/Contacts'

export const AppPhoneBackground = () => {
    return <div className='h-full w-full bg-zinc-700'></div>
}

export const AppPhoneContent = () => {
    return (
        <div className='size-full pr-8'>
            <Contacts />
        </div>
    )
}
