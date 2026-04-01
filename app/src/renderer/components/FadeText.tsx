interface FadeTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode
    fadeWidth: string | number
}

const toCssSize = (value: string | number): string => (typeof value === 'number' ? `${value}px` : value)

/**
 * A text component that applies a fade-out effect at the end of the text when it overflows its container. The `fadeWidth` prop determines how much of the text is faded out, and can be specified in pixels or any valid CSS size unit (e.g., '20px', '1em', '10%'). The component uses CSS masking to create the fade effect.
 */
const FadeText = ({ children, fadeWidth, ...props }: FadeTextProps) => {
    const resolvedFadeWidth = toCssSize(fadeWidth)

    return (
        <p
            {...props}
            className={`w-full truncate text-clip ${props.className ?? ''}`}
            style={{
                maskImage: `linear-gradient(to right, black calc(100% - ${resolvedFadeWidth}), transparent)`,
                WebkitMaskImage: `linear-gradient(to right, black calc(100% - ${resolvedFadeWidth}), transparent)`, // eslint-disable-line @typescript-eslint/naming-convention
                ...props.style,
            }}
        >
            {children}
        </p>
    )
}

export default FadeText
