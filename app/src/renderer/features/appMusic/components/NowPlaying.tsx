import type { TrackInfo } from '@shared/types/mediaPlayer'

interface NowPlayingProps {
    trackInfo: TrackInfo | null
}

const NowPlaying = ({ trackInfo }: NowPlayingProps) => {
    return (
        <div className='flex size-full min-w-0 flex-col items-start justify-center gap-2'>
            <Text className='text-center text-8xl/tight font-black text-white'>
                {trackInfo?.title ?? 'Title'}
            </Text>
            <Text className='text-center text-3xl font-bold text-white/75'>
                {trackInfo?.artist ?? 'Artist'}
            </Text>
        </div>
    )
}
export default NowPlaying

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode
}

const Text = ({ children, ...props }: TextProps) => (
    <p
        {...props}
        className={`w-full truncate text-clip ${props.className ?? ''}`}
        style={{
            maskImage: 'linear-gradient(to right, black calc(100% - 4rem), transparent)',
            WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 4rem), transparent)',
            ...props.style,
        }}
    >
        {children}
    </p>
)
