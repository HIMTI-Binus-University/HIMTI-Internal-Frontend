import { Route } from '@/types/route'
import HomePage from '@/pages/home'
import LoginPage from '@/pages/login'

export const publicRoutes: Route[] = [
  {
    key: 'router-home',
    title: 'Home',
    description: 'Home Page',
    component: HomePage,
    path: '/',
    isEnabled: true,
  },
  {
    key: 'router-login',
    title: 'Login',
    description: 'Login Page',
    component: LoginPage,
    path: '/login',
    isEnabled: true,
  },
]

export const protectedRoutes: Route[] = []
