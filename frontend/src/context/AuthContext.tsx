import { createContext, useContext, useState } from 'react'
import type { User, AuthResponse } from '../types'

interface AuthContextValue {
  user: User | null
  login: (res: AuthResponse) => void
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextValue>(null!)

const AUTH_KEY = 'recipe-auth'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY) ?? 'null')
    } catch {
      return null
    }
  })

  const login = (res: AuthResponse) => {
    const u: User = {
      username: res.username,
      role: res.role as User['role'],
      token: res.token,
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify(u))
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem(AUTH_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: user !== null,
      isAdmin: user?.role === 'ROLE_ADMIN',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
