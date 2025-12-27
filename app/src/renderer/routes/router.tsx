import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { routes } from './routes'

const createAppRouter = () => createBrowserRouter(routes, { basename: import.meta.env.BASE_URL || '/' })

export const AppRouter = () => {
    const router = createAppRouter()

    return (
        <>
            <RouterProvider router={router} />
        </>
    )
}
