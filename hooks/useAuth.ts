'use client'

import { useState, useCallback, useEffect } from 'react'
import { User, AuthToken, UserRole } from '@/lib/types'
import { loginUser, registerUser, logoutUser } from '@/lib/api-client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<AuthToken | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Restore auth from localStorage and check token expiry on mount
  useEffect(() => {
    const restoreAuth = () => {
      try {
        const savedAuth = localStorage.getItem('auth')
        if (savedAuth) {
          const auth = JSON.parse(savedAuth)
          const { user: savedUser, access_token, refresh_token, expires_at } = auth

          // Check if token is expired
          if (expires_at && expires_at < Date.now()) {
            // Token expired, clear auth
            localStorage.removeItem('auth')
            setIsInitialized(true)
            return
          }

          setUser(savedUser)
          setToken({ access_token, refresh_token, expires_in: 0 })
        }
      } catch (err) {
        console.error('[Auth] Failed to restore auth:', err)
        localStorage.removeItem('auth')
      } finally {
        setIsInitialized(true)
      }
    }

    restoreAuth()
  }, [])

  const login = useCallback(
    async (email: string, password: string, role: UserRole) => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await loginUser({ email, password, role })
        const { user: apiUser, token: apiToken } = response

        // Store auth in localStorage
        localStorage.setItem(
          'auth',
          JSON.stringify({
            user: apiUser,
            access_token: apiToken.access_token,
            refresh_token: apiToken.refresh_token,
            expires_at: Date.now() + apiToken.expires_in * 1000,
          })
        )

        setUser(apiUser)
        setToken(apiToken)

        return { user: apiUser, token: apiToken }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const register = useCallback(
    async (
      email: string,
      password: string,
      first_name: string,
      last_name: string,
      role: UserRole,
      phone?: string
    ) => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await registerUser({
          email,
          password,
          first_name,
          last_name,
          role,
          phone,
        })
        const { user: apiUser, token: apiToken } = response

        // Store auth in localStorage
        localStorage.setItem(
          'auth',
          JSON.stringify({
            user: apiUser,
            access_token: apiToken.access_token,
            refresh_token: apiToken.refresh_token,
            expires_at: Date.now() + apiToken.expires_in * 1000,
          })
        )

        setUser(apiUser)
        setToken(apiToken)

        return { user: apiUser, token: apiToken }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      await logoutUser()
    } catch (err) {
      console.error('[Auth] Logout error:', err)
    } finally {
      setUser(null)
      setToken(null)
      setError(null)
      localStorage.removeItem('auth')
    }
  }, [])

  const isAuthenticated = !!user && !!token
  const userRole = user?.role

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isInitialized,
    userRole,
    login,
    register,
    logout,
  }
}
