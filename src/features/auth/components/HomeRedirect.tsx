import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { ROUTES } from '@/lib/constants'
import { staffLandingPath } from '../landing'

export function HomeRedirect() {
  const user = useAuthStore((state) => state.user)
  return <Navigate to={user ? staffLandingPath(user) : ROUTES.LOGIN} replace />
}
