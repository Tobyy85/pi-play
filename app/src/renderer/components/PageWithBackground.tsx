import type { ReactNode } from 'react'

interface PageWithBackgroundProps {
    background: ReactNode
    children: ReactNode
}

const PageWithBackground = ({ background, children }: PageWithBackgroundProps) => {
    return (
        <>
            <div className='pointer-events-auto fixed top-0 left-0 -z-10 flex h-dvh w-dvw'>{background}</div>
            <div className='pointer-events-none relative size-full cursor-default [&_*]:pointer-events-auto'>
                {children}
            </div>
        </>
    )
}

export default PageWithBackground
