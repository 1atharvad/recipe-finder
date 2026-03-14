import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">🍳 Recipe Finder</NavLink>
      <div className="navbar-links">
        {isAdmin ? (
          <>
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Admin Panel
            </NavLink>
            <button className="nav-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : isAuthenticated ? (
          <>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Search
            </NavLink>
            <NavLink to="/favorites" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Favorites
            </NavLink>
            <NavLink to="/my-recipes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              My Recipes
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              History
            </NavLink>
            <NavLink to="/recommendations" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              For You
            </NavLink>
            <span className="nav-username">{user?.username}</span>
            <button className="nav-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Search
            </NavLink>
            <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Login
            </NavLink>
          </>
        )}
      </div>
    </nav>
  )
}
