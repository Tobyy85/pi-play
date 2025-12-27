import HomeRoute from '@renderer/routes/Home'
import NotFoundRoute from '@renderer/routes/NotFound'

export const routes = [
    {
        path: '/',
        element: <HomeRoute />,
        errorElement: <NotFoundRoute />,
    },
]
