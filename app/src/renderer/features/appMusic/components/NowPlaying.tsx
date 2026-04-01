import FadeText from '@renderer/components/FadeText'

import type { TrackInfo } from '@shared/types/mediaPlayer'

interface NowPlayingProps {
    trackInfo: TrackInfo | null
}

const FADE_WIDTH = '4rem'

const NowPlaying = ({ trackInfo }: NowPlayingProps) => {
    return (
        <div className='flex size-full min-w-0 flex-col items-start justify-center gap-2'>
            <FadeText
                fadeWidth={FADE_WIDTH}
                className='text-center text-8xl/tight font-black text-white'
                children={trackInfo?.title ?? 'Title'}
            />
            <FadeText
                fadeWidth={FADE_WIDTH}
                className='text-center text-3xl font-bold text-white/75'
                children={trackInfo?.artist ?? 'Artist'}
            />
        </div>
    )
}
export default NowPlaying
