import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppRouter } from '@renderer/routes/router'

import './styles/global.css'
import './styles/tailwind.css'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppRouter />
    </StrictMode>
)
