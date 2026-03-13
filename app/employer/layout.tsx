'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Sidebar } from '@/components/layout/Sidebar'

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isInitialized } = useAuth()

  // Don't redirect until auth is initialized
  if (!isInitialized) {
    return null
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar userType="employer" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header />

          <main className="flex-1 overflow-auto">
            <div className="container max-w-6xl mx-auto px-4 py-8">
              {children}
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  )
}
