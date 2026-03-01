import { useId } from 'react'

import type { Contact } from '@shared/types/phoneBook'

const getNameInitials = (name: string): string[] => {
    const nameParts = name.trim().toUpperCase().split(' ')
    if (nameParts.length === 1) {
        return [nameParts[0].charAt(0)]
    }
    return [nameParts[0].charAt(0), nameParts[nameParts.length - 1].charAt(0)]
}

interface ContactPhotoProps extends React.HTMLAttributes<HTMLDivElement> {
    contact: Contact
}

const ContactPhoto = ({ contact, ...props }: ContactPhotoProps) => {
    const gradientId = useId()

    return (
        <div {...props}>
            {contact.photo ? (
                <img
                    src={`data:image/jpeg;base64,${contact.photo}`}
                    alt={`${contact.name}'s photo`}
                    className='size-full object-cover'
                />
            ) : (
                <svg
                    viewBox='0 0 100 100'
                    role='img'
                    aria-label={`${contact.name} initials`}
                    className='size-full'
                >
                    <defs>
                        <linearGradient
                            id={gradientId}
                            x1='50%'
                            y1='0%'
                            x2='50%'
                            y2='100%'
                        >
                            <stop
                                offset='0%'
                                stopColor='#93A3A8'
                            />
                            <stop
                                offset='100%'
                                stopColor='#6E6784'
                            />
                        </linearGradient>
                    </defs>
                    <rect
                        x='0'
                        y='0'
                        width='100'
                        height='100'
                        fill={`url(#${gradientId})`}
                    />
                    <text
                        x='50'
                        y='50'
                        textAnchor='middle'
                        dominantBaseline='central'
                        className='fill-white font-extrabold select-none'
                        fontSize='48'
                        style={{ fontFamily: '"Nunito", "SF Pro Rounded", "Inter", system-ui, sans-serif' }}
                    >
                        {getNameInitials(contact.name).join('')}
                    </text>
                </svg>
            )}
        </div>
    )
}
export default ContactPhoto
