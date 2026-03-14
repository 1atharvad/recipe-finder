import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAdmin } = useAuth()
  return isAdmin ? children : <Navigate to="/admin/login" replace />
}
