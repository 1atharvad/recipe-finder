import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import content from '@/content/navbar.json'

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">{content.brand}</NavLink>
      <div className="navbar-links">
        {isAdmin ? (
          <>
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {content.adminPanelLabel}
            </NavLink>
            <button className="nav-logout" onClick={handleLogout}>{content.logoutLabel}</button>
          </>
        ) : isAuthenticated ? (
          <>
            <NavLink to="/dashboard/search" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {content.searchLabel}
            </NavLink>
            <NavLink to="/favorites" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {content.favoritesLabel}
            </NavLink>
            <NavLink to="/my-recipes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {content.myRecipesLabel}
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {content.historyLabel}
            </NavLink>
            <NavLink to="/dashboard/recommender" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {content.recommenderLabel}
            </NavLink>
            <NavLink to="/dashboard/inventory" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {content.inventoryLabel}
            </NavLink>
            <span className="nav-username">{user?.firstName}</span>
            <button className="nav-logout" onClick={handleLogout}>{content.logoutLabel}</button>
          </>
        ) : (
          <>
            <NavLink to="/dashboard/search" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {content.searchLabel}
            </NavLink>
            <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {content.loginLabel}
            </NavLink>
          </>
        )}
      </div>
    </nav>
  )
}
