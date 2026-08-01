import { createContext, useContext, useState } from 'react'
import type { User, AuthResponse } from '../types'

interface AuthContextValue {
  user: User | null
  login: (res: AuthResponse) => void
  logout: () => void
  updateName: (firstName: string, lastName: string) => void
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
      firstName: res.firstName,
      lastName: res.lastName,
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

  const updateName = (firstName: string, lastName: string) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, firstName, lastName }
      localStorage.setItem(AUTH_KEY, JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      updateName,
      isAuthenticated: user !== null,
      isAdmin: user?.role === 'ROLE_ADMIN',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
