import { createBrowserRouter, createHashRouter, RouterProvider } from 'react-router-dom'

import { routes } from './routes'

const createAppRouter = () => {
    const isDev = import.meta.env.DEV
    if (isDev) {
        // In development, use browser router for better debugging experience
        return createBrowserRouter(routes, { basename: '/' })
    }
    return createHashRouter(routes)
}

export const AppRouter = () => {
    const router = createAppRouter()

    return (
        <>
            <RouterProvider router={router} />
        </>
    )
}
