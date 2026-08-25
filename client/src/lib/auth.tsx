import { createContext, useContext, useState, ReactNode } from "react"

interface AuthUser {
  userId: string
  role: "patient" | "doctor" | "lab" | "pharmacy"
  token: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem("carelink_token")
    const role = localStorage.getItem("carelink_role")
    const userId = localStorage.getItem("carelink_userId")
    if (token && role && userId) {
      return { token, role: role as AuthUser["role"], userId }
    }
    return null
  })

  function login(authUser: AuthUser) {
    localStorage.setItem("carelink_token", authUser.token)
    localStorage.setItem("carelink_role", authUser.role)
    localStorage.setItem("carelink_userId", authUser.userId)
    setUser(authUser)
  }

  function logout() {
    localStorage.removeItem("carelink_token")
    localStorage.removeItem("carelink_role")
    localStorage.removeItem("carelink_userId")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
