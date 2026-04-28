import GradientBackground from '@renderer/features/gradientBackground/components/GradientBackground'

const Background = () => {
    return (
        <GradientBackground
            hueRange={[200, 280]} // eslint-disable-line @typescript-eslint/no-magic-numbers
            saturationRange={[60, 90]} // eslint-disable-line @typescript-eslint/no-magic-numbers
            lightnessRange={[20, 50]} // eslint-disable-line @typescript-eslint/no-magic-numbers
        />
    )
}
export default Background
