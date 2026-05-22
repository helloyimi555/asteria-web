"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authApi, saveTokens, clearTokens, isLoggedIn } from "@/lib/api"
import type { AuthTokens } from "@/types"

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading:       boolean
  login:   (email: string, password: string) => Promise<void>
  logout:  () => void
  register:(email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading,       setIsLoading]       = useState(true)
  const router = useRouter()

  useEffect(() => {
    setIsAuthenticated(isLoggedIn())
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const tokens = await authApi.login(email, password)
    saveTokens(tokens)
    setIsAuthenticated(true)
    router.push("/mypage")
  }

  const register = async (email: string, password: string) => {
    const tokens = await authApi.register(email, password)
    saveTokens(tokens)
    setIsAuthenticated(true)
    router.push("/reading")
  }

  const logout = () => {
    clearTokens()
    setIsAuthenticated(false)
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
