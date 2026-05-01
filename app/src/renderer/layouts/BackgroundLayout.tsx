import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'

import PageWithBackground from '@renderer/components/PageWithBackground'
import Background from '@renderer/features/background/components/Background'

interface BackgroundLayoutProps {
    children?: ReactNode
}

const BackgroundLayout = ({ children }: BackgroundLayoutProps) => {
    return <PageWithBackground background={<Background />}>{children ?? <Outlet />}</PageWithBackground>
}
export default BackgroundLayout
