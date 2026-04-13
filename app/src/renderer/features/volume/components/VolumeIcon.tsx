import { IoVolumeHigh, IoVolumeLow, IoVolumeMedium, IoVolumeMute, IoVolumeOff } from 'react-icons/io5'

import type { Volume } from '@shared/types/systemAudio'

interface VolumeIconProps extends React.SVGProps<SVGSVGElement> {
    value: Volume['value']
    isMuted: Volume['isMuted']
}

const VolumeIcon = ({ value, isMuted, ...svgProps }: VolumeIconProps) => {
    if (isMuted) {
        return <IoVolumeMute {...svgProps} />
    }
    if (value === 0) {
        return <IoVolumeOff {...svgProps} />
    }
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    if (value <= 33) {
        return <IoVolumeLow {...svgProps} />
    }
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    if (value <= 67) {
        return <IoVolumeMedium {...svgProps} />
    }
    return <IoVolumeHigh {...svgProps} />
}
export default VolumeIcon
