import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isAdmin } = useAuth()
  if (isAdmin) return <Navigate to="/admin" replace />
  return isAuthenticated ? children : <Navigate to="/login" replace />
}
