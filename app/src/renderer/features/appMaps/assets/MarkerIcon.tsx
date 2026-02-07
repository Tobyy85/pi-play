const MarkerIcon = ({ ...svgProps }: React.SVGProps<SVGSVGElement>) => (
    <svg
        width='16'
        height='16'
        viewBox='0 0 16 16'
        fill='currentColor'
        stroke='currentColor'
        strokeWidth='0.695652'
        xmlns='http://www.w3.org/2000/svg'
        {...svgProps}
    >
        <path d='M7.03418 3.68848C7.52146 3.0531 8.47854 3.0531 8.96582 3.68848L14.7354 11.2139C15.44 12.1335 14.5831 13.4243 13.4619 13.1318L8.35156 11.7988C8.12129 11.7388 7.87871 11.7388 7.64844 11.7988L2.53809 13.1318C1.41689 13.4243 0.55999 12.1335 1.26465 11.2139L7.03418 3.68848Z' />
    </svg>
)

export default MarkerIcon
