import { createContext, useContext, useState } from 'react'

interface User {
  id: string
  username: string
  email: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
}

interface AuthContextType extends AuthState {
  login: (user: User, accessToken: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ user: null, accessToken: null })

  const login = (user: User, accessToken: string) => {
    setAuth({ user, accessToken })
  }

  const logout = () => {
    setAuth({ user: null, accessToken: null })
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}