import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'

export const routes = [
    {
        path: '/',
        element: <HomePage />,
        errorElement: <NotFoundPage />,
    },
]
