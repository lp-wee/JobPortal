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
import { AlertCircle, Loader2, User, Building2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading, error } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'job_seeker' as const,
  })
  const [passwordError, setPasswordError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if ((name === 'password' || name === 'confirm_password') && passwordError) {
      setPasswordError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirm_password) {
      setPasswordError('Пароли не совпадают')
      return
    }
    if (formData.password.length < 8) {
      setPasswordError('Пароль должен содержать минимум 8 символов')
      return
    }
    try {
      await register(formData.email, formData.password, formData.first_name, formData.last_name, formData.role, formData.phone || undefined)
      const redirectUrl = formData.role === 'job_seeker' ? ROUTES.CABINET_DASHBOARD : ROUTES.EMPLOYER_DASHBOARD
      router.push(redirectUrl)
    } catch {}
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f9]">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* hh.ru style illustrations/blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400 rounded-full mix-blend-multiply filter blur-[130px] opacity-10 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-400 rounded-full mix-blend-multiply filter blur-[110px] opacity-10 translate-y-1/3 -translate-x-1/4"></div>

        <div className="w-full max-w-2xl relative z-10">
          <Card className="border-none shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="text-center bg-white pt-10">
              <CardTitle className="text-4xl font-black text-gray-900 tracking-tight">Регистрация</CardTitle>
              <CardDescription className="text-gray-500 mt-3 font-medium text-lg">
                Станьте частью сообщества JobPortal и откройте новые горизонты
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-white px-8 pb-12">
              {(error || passwordError) && (
                <div className="mb-8 p-4 rounded-xl bg-red-50 text-red-700 text-sm flex gap-3 border border-red-100 items-center">
                  <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  <span className="font-bold">{error || passwordError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Я регистрируюсь как:</Label>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, role: 'job_seeker' }))}
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all group ${formData.role === 'job_seeker' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                      >
                        <div className={`p-3 rounded-xl transition-colors ${formData.role === 'job_seeker' ? 'bg-primary text-white' : 'bg-white text-gray-400 group-hover:text-primary'}`}>
                          <User className="w-6 h-6" />
                        </div>
                        <span className="text-lg font-black">Соискатель</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, role: 'employer' }))}
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all group ${formData.role === 'employer' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                      >
                        <div className={`p-3 rounded-xl transition-colors ${formData.role === 'employer' ? 'bg-primary text-white' : 'bg-white text-gray-400 group-hover:text-primary'}`}>
                          <Building2 className="w-6 h-6" />
                        </div>
                        <span className="text-lg font-black">Работодатель</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <Label className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Личные данные</Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          id="first_name"
                          name="first_name"
                          placeholder="Ваше имя"
                          className="h-14 border-gray-200 rounded-xl px-5 font-medium"
                          value={formData.first_name}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          id="last_name"
                          name="last_name"
                          placeholder="Ваша фамилия"
                          className="h-14 border-gray-200 rounded-xl px-5 font-medium"
                          value={formData.last_name}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="example@mail.ru"
                      className="h-14 border-gray-200 rounded-xl px-5"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Телефон</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+7 (___) ___-__-__"
                      className="h-14 border-gray-200 rounded-xl px-5"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Пароль</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Минимум 8 символов"
                      className="h-14 border-gray-200 rounded-xl px-5"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password" className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Повторите</Label>
                    <Input
                      id="confirm_password"
                      name="confirm_password"
                      type="password"
                      placeholder="••••••••"
                      className="h-14 border-gray-200 rounded-xl px-5"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-16 text-2xl font-black bg-primary hover:bg-primary/90 mt-6 rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-[0.98]" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : 'СОЗДАТЬ АККАУНТ'}
                </Button>
              </form>

              <div className="mt-12 text-center">
                <p className="text-gray-600 font-medium text-lg">
                  Уже есть аккаунт?{' '}
                  <Link href={ROUTES.LOGIN} className="text-primary font-black hover:underline decoration-2 underline-offset-4">
                    Войти в систему
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
