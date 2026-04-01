'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/lib/utils/constants'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, X, Bell, Briefcase } from 'lucide-react'

export function Header() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push(ROUTES.HOME)
  }

  const displayName = (() => {
    if (!user) return ''
    if (user.role === 'employer') {
      return user.first_name || user.email.split('@')[0]
    }
    if (user.first_name) {
      return user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name
    }
    return user.email.split('@')[0]
  })()

  const avatarLetter = displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'

  const cabinetRoute = user?.role === 'employer' ? ROUTES.EMPLOYER_DASHBOARD : ROUTES.CABINET_DASHBOARD

  const navLinks = [
    { label: 'Найти работу', href: ROUTES.VACANCIES },
    { label: 'Компании', href: '/companies' },
    { label: 'Услуги', href: '/services' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6 md:gap-8">
            <Link href={ROUTES.HOME} className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white transition-transform group-hover:rotate-6">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="font-black text-lg sm:text-xl tracking-tighter text-gray-900 hidden sm:inline">JobPortal</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 md:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-bold text-gray-500 hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(ROUTES.LOGIN)}
                  className="text-gray-500 font-bold hover:text-primary"
                >
                  Вход
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push(ROUTES.REGISTER)}
                  className="bg-primary hover:bg-primary/90 text-white font-black rounded-xl px-6"
                >
                  Регистрация
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 hover:bg-gray-50 rounded-xl px-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ring-2 ${
                        user?.role === 'admin'
                          ? 'bg-purple-100 text-purple-700 ring-purple-400'
                          : user?.role === 'employer'
                          ? 'bg-blue-100 text-blue-700 ring-blue-400'
                          : 'bg-green-100 text-green-700 ring-green-400'
                      }`}>
                        {avatarLetter}
                      </div>
                      <span className="hidden sm:inline text-sm font-bold text-gray-700 max-w-[140px] truncate">{displayName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl border-gray-100 p-2 shadow-xl">
                    <DropdownMenuItem asChild className="rounded-xl font-bold">
                      <Link href={cabinetRoute}>Личный кабинет</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-50" />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 rounded-xl font-bold">
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <button
              className="md:hidden p-2 text-gray-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-50 bg-white py-6 px-4 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <nav className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-lg font-black text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-gray-50 my-2" />
            {!isAuthenticated && (
              <div className="flex flex-col gap-3">
                <Button onClick={() => router.push(ROUTES.LOGIN)} variant="outline" className="h-12 rounded-xl font-bold">Вход</Button>
                <Button onClick={() => router.push(ROUTES.REGISTER)} className="h-12 rounded-xl font-black">Регистрация</Button>
              </div>
            )}
            {isAuthenticated && (
              <div className="flex flex-col gap-3">
                <Link href={cabinetRoute}>
                  <Button variant="outline" className="w-full h-12 rounded-xl font-bold">Личный кабинет</Button>
                </Link>
                <Button onClick={handleLogout} variant="ghost" className="h-12 rounded-xl font-bold text-red-600">Выйти</Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
