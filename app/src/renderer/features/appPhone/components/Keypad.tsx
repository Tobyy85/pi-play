import { useState } from 'react'

import CallIcon from '@renderer/features/appPhone/assets/CallIcon'
import { TbBackspaceFilled } from 'react-icons/tb'

import { formatPhoneNumber, normalizePhoneNumber } from '@shared/utils/phoneBook'

const Keypad = () => {
    const [display, setDisplay] = useState('')

    return (
        <div className='flex size-full flex-col items-center justify-center gap-6'>
            <div className='flex w-full items-center justify-center text-4xl font-bold text-white'>
                {formatPhoneNumber(display) || 'Enter number'}
            </div>
            <div className='grid grid-cols-3 gap-4'>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(key => (
                    <button
                        key={key}
                        onClick={() => setDisplay(prev => prev + key)}
                        className='flex size-16 items-center justify-center rounded-full bg-white/20 text-3xl
                            font-bold text-white transition-opacity active:opacity-80'
                    >
                        {key}
                    </button>
                ))}
                <button
                    className='col-start-2 flex size-16 rounded-full bg-green-500 p-3 transition-opacity
                        active:opacity-80'
                    onClick={async () => await window.api.call.dial(normalizePhoneNumber(display))}
                >
                    <CallIcon className='size-full text-white' />
                </button>
                {display && (
                    <button
                        className='col-start-3 flex size-16 p-4 transition-opacity active:opacity-80'
                        onClick={() => setDisplay(prev => prev.slice(0, -1))}
                    >
                        <TbBackspaceFilled className='size-full text-white/90' />
                    </button>
                )}
            </div>
        </div>
    )
}
export default Keypad
