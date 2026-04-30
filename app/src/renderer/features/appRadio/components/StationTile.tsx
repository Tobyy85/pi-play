import FadeText from '@renderer/components/FadeText'

import type { RadioStation } from '@renderer/features/appRadio/types'

interface StationTileProps {
    station: RadioStation
    onClick?: () => void
}

const StationTile = ({ station, onClick }: StationTileProps) => {
    return (
        <div
            className='flex h-18 shrink-0 items-center justify-start gap-4 border-white/20 py-2
                not-last:border-b'
            onClick={onClick}
        >
            <div className='aspect-square h-full shrink-0 overflow-hidden rounded-2xl bg-white/20'>
                {station.icon && (
                    <img
                        className='size-full'
                        src={station.icon}
                    />
                )}
            </div>
            <FadeText
                className='text-3xl font-bold text-white'
                fadeWidth={'4rem'}
            >
                {station.name}
            </FadeText>
        </div>
    )
}
export default StationTile
