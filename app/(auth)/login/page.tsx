'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/lib/utils/constants'
import { AlertCircle, Loader2, Briefcase } from 'lucide-react'

const DEMO_ACCOUNTS = [
  { email: 'seeker@example.com', password: 'password123', role: 'job_seeker' as const, label: 'Соискатель' },
  { email: 'employer@example.com', password: 'password123', role: 'employer' as const, label: 'Работодатель' },
]

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'job_seeker' as const,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(formData.email, formData.password, formData.role)
      const redirectUrl = formData.role === 'job_seeker' ? ROUTES.CABINET_DASHBOARD : ROUTES.EMPLOYER_DASHBOARD
      router.push(redirectUrl)
    } catch (err) {
      console.error('[Login] Error:', err)
      // Error is handled by useAuth hook and displayed in UI
    }
  }

  const quickLogin = async (account: (typeof DEMO_ACCOUNTS)[0]) => {
    setFormData({ email: account.email, password: account.password, role: account.role })
    try {
      await login(account.email, account.password, account.role)
      const redirectUrl = account.role === 'job_seeker' ? ROUTES.CABINET_DASHBOARD : ROUTES.EMPLOYER_DASHBOARD
      router.push(redirectUrl)
    } catch (err) {
      console.error('[Demo Login] Error:', err)
      // Error is handled by useAuth hook and displayed in UI
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f9]">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* hh.ru style illustrations/blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-10 -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 translate-y-1/3 -translate-x-1/4 animate-pulse"></div>
        
        <div className="w-full max-w-md relative z-10">
          <Card className="border-none shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="text-center bg-white pt-10 pb-4">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
                  <Briefcase className="w-9 h-9" />
                </div>
              </div>
              <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">Вход в кабинет</CardTitle>
              <CardDescription className="text-gray-500 mt-3 font-medium px-6">
                Найдите работу своей мечты или идеального сотрудника прямо сейчас
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-white px-8 pb-10 pt-6">
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm flex gap-3 border border-red-100 items-center">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-gray-700 ml-1">Электронная почта</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@mail.ru"
                    className="h-14 border-gray-200 focus:ring-primary/20 focus:border-primary rounded-xl px-5 text-lg"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <Label htmlFor="password" className="text-sm font-bold text-gray-700">Пароль</Label>
                    <Link href="#" className="text-xs font-bold text-primary hover:text-primary/80">Забыли?</Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-14 border-gray-200 focus:ring-primary/20 focus:border-primary rounded-xl px-5 text-lg"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-bold text-gray-700 ml-1">Вы зашли как</Label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full h-14 px-5 rounded-xl border border-gray-200 bg-white text-gray-900 font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="job_seeker">Соискатель</option>
                    <option value="employer">Работодатель</option>
                  </select>
                </div>

                <Button type="submit" className="w-full h-14 text-xl font-black bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'ВОЙТИ'}
                </Button>
              </form>

              <div className="mt-10 pt-8 border-t border-gray-100">
                <p className="text-center text-gray-600 font-medium mb-4">
                  Нет аккаунта?{' '}
                  <Link href={ROUTES.REGISTER} className="text-primary font-black hover:underline decoration-2 underline-offset-4">
                    Зарегистрироваться
                  </Link>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {DEMO_ACCOUNTS.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => quickLogin(account)}
                      disabled={isLoading}
                      className="px-3 py-2.5 text-xs font-bold rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-primary transition-all text-gray-500 hover:text-primary"
                    >
                      {account.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
