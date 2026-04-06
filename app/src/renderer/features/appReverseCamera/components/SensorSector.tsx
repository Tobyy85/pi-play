import { describeArc } from '@renderer/features/appReverseCamera/utils'

const NUMBER_OF_BARS = 10

const BASE_ANGLE = 120
const LINE_WIDTH = 10
const LINE_SPACING = 2

interface SensorSectorProps {
    value: number
    startAngle: number
    endAngle: number
    centerX: number
    centerY: number
}

const SensorSector = ({ value, startAngle, endAngle, centerX, centerY }: SensorSectorProps) => {
    const bars = Array.from<number>({ length: NUMBER_OF_BARS })

    return (
        <g>
            {bars.map((_, barIndex) => {
                const radius = BASE_ANGLE + (NUMBER_OF_BARS - (barIndex + 1)) * (LINE_WIDTH + LINE_SPACING)
                const isActive = barIndex <= value

                const colorClass = isActive ? 'stroke-gray-300' : 'stroke-gray-900'

                return (
                    <path
                        key={barIndex}
                        d={describeArc(centerX, centerY, radius, startAngle, endAngle)}
                        fill='none'
                        strokeWidth={LINE_WIDTH}
                        className={`transition-colors duration-150 ${colorClass}`}
                    />
                )
            })}
        </g>
    )
}

export default SensorSector
