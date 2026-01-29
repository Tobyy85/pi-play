import type { ReactNode } from 'react'

interface PageWithBackgroundProps {
    background: ReactNode
    children: ReactNode
}

const PageWithBackground = ({ background, children }: PageWithBackgroundProps) => {
    return (
        <>
            <div className='absolute top-0 left-0 -z-10 flex h-dvh w-dvw'>{background}</div>
            {children}
        </>
    )
}

export default PageWithBackground
