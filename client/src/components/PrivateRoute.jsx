import { Navigate } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#08090E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(240,238,233,0.4)', fontSize: '14px' }}>Loading...</div>
    </div>
  )

  if (!user) return <Navigate to="/login" />

  const roleHierarchy = { viewer: 1, rep: 2, manager: 3, admin: 4 }
  if (requiredRole && roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
    return <Navigate to="/dashboard" />
  }

  return children
}

export default PrivateRoute