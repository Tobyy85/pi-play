import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createHashRouter, RouterProvider } from 'react-router-dom'

import './styles/tailwind.css'

import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'

const routes = [
    {
        path: '/',
        element: <HomePage />,
        errorElement: <NotFoundPage />,
    },
]

const router = import.meta.env.DEV ? createBrowserRouter(routes, { basename: '/' }) : createHashRouter(routes)

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
)
