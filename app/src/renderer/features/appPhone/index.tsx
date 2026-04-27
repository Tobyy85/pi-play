import { useState } from 'react'

import CallHistory from '@renderer/features/appPhone/components/CallHistory'
import Contacts from '@renderer/features/appPhone/components/Contacts'
import Keypad from '@renderer/features/appPhone/components/Keypad'
import Background from '@renderer/features/background/components/Background'

import useConnectionStatus from '@renderer/features/appPhone/hooks/useConnectionStatus'

export const AppPhoneBackground = () => {
    return (
        <>
            <Background />
        </>
    )
}

export const AppPhoneContent = () => {
    const { data: isConnected, isLoading } = useConnectionStatus()
    const [activeTab, setActiveTab] = useState<string>('contacts')

    if (!isConnected && !isLoading) {
        return (
            <div className='flex size-full items-center justify-center pr-8'>
                <p className='text-2xl text-white'>No phone connected</p>
            </div>
        )
    }

    return (
        <div className='flex size-full flex-col gap-6 pr-8'>
            <div className='flex gap-6'>
                <button
                    onClick={() => setActiveTab('contacts')}
                    className={`text-3xl font-bold
                        ${activeTab === 'contacts' ? 'text-white' : 'text-white/70'}`}
                >
                    Contacts
                </button>
                <button
                    onClick={() => setActiveTab('call-history')}
                    className={`text-3xl font-bold
                        ${activeTab === 'call-history' ? 'text-white' : 'text-white/70'}`}
                >
                    Calls
                </button>
                <button
                    onClick={() => setActiveTab('keypad')}
                    className={`text-3xl font-bold ${activeTab === 'keypad' ? 'text-white' : 'text-white/70'}`}
                >
                    Keypad
                </button>
            </div>
            <div className='size-full'>
                {activeTab === 'contacts' && <Contacts />}
                {activeTab === 'call-history' && <CallHistory />}
                {activeTab === 'keypad' && <Keypad />}
            </div>
        </div>
    )
}
