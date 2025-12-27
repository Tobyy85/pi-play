import HomeRoute from '@/routes/Home'
import NotFoundRoute from '@/routes/NotFound'

export const routes = [
    {
        path: '/',
        element: <HomeRoute />,
        errorElement: <NotFoundRoute />,
    },
]
