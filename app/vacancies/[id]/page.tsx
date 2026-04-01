'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/lib/utils/constants'
import { fetchVacancy, createApplication, checkApplicationStatus } from '@/lib/api-client'
import {
  MapPin,
  Briefcase,
  Eye,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Building2,
  Users,
  Star,
  Loader2
} from 'lucide-react'

export default function VacancyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const { isAuthenticated, isInitialized, userRole } = useAuth()
  const [vacancy, setVacancy] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applyError, setApplyError] = useState('')

  useEffect(() => {
    if (!id || id === 'undefined') return
    const load = async () => {
      try {
        const data = await fetchVacancy(id)
        setVacancy(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'job_seeker' || !id || id === 'undefined') return
    checkApplicationStatus(parseInt(id))
      .then((result: any) => {
        if (result?.applied) setApplied(true)
      })
      .catch(() => {})
  }, [isAuthenticated, userRole, id])

  const handleApply = async () => {
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN)
      return
    }
    if (userRole !== 'job_seeker') {
      setApplyError('Только соискатели могут откликаться на вакансии')
      return
    }

    setApplying(true)
    setApplyError('')
    try {
      await createApplication({
        vacancy_id: parseInt(id),
        cover_letter: 'Интересует данная вакансия',
      })
      setApplied(true)
    } catch (e: any) {
      setApplyError(e.message || 'Вы уже откликнулись на эту вакансию или произошла ошибка')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f0f2f5]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!vacancy) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f0f2f5]">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center bg-white p-12 rounded-2xl shadow-xl">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Вакансия не найдена</h1>
            <Button onClick={() => router.push(ROUTES.VACANCIES)} className="bg-primary px-8">К списку вакансий</Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f2f5]">
      <Header />
      <main className="flex-1 pb-16">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-primary mb-8 font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-5xl border border-gray-100 shadow-sm">
                    {vacancy.company_logo || '🏢'}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">{vacancy.title}</h1>
                    <div className="flex items-center gap-2">
                      <Link href={ROUTES.COMPANY_PROFILE(vacancy.company_id.toString())} className="text-lg font-bold text-primary hover:underline">
                        {vacancy.company_name}
                      </Link>
                      {vacancy.company_rating && (
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded text-yellow-700 text-xs font-bold border border-yellow-100">
                          <Star className="w-3 h-3 fill-current" />
                          {vacancy.company_rating}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-8 mb-8 pb-8 border-b border-gray-100">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Зарплата</span>
                    <p className="text-2xl font-extrabold text-gray-900">
                      {vacancy.salary_min || vacancy.salary_max ?
                        `${vacancy.salary_min || 0} – ${vacancy.salary_max || '∞'} ₽` :
                        'Зарплата не указана'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Опыт работы</span>
                    <p className="text-lg font-bold text-gray-900">
                      {vacancy.experience_level === 'entry' ? 'Без опыта' :
                       vacancy.experience_level === 'mid' ? '1–3 года' :
                       vacancy.experience_level === 'senior' ? '3–6 лет' : 'Более 6 лет'}
                    </p>
                  </div>
                  {vacancy.location && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Город</span>
                      <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />{vacancy.location}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Описание вакансии</h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                      {vacancy.description}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-primary" />
                  О компании
                </h2>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <p className="text-gray-700 leading-relaxed">{vacancy.company_description || 'Описание компании не указано'}</p>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Город</span>
                        <span className="font-bold text-gray-900">{vacancy.company_location || vacancy.location || '—'}</span>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Сотрудники</span>
                        <span className="font-bold text-gray-900">{vacancy.employee_count ? `${vacancy.employee_count} чел.` : '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-blue-100 sticky top-24">
                {applied ? (
                  <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-800 mb-2">Отклик отправлен!</h3>
                    <p className="text-green-700 text-sm mb-6">Работодатель увидит ваш профиль и свяжется с вами.</p>
                    <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-100" onClick={() => router.push(ROUTES.VACANCIES)}>
                      К поиску вакансий
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-extrabold text-gray-900">Готовы откликнуться?</h3>
                      <p className="text-sm text-gray-500 font-medium">Ваш профиль будет доступен работодателю сразу после отправки.</p>
                    </div>

                    {!isInitialized ? null : !isAuthenticated ? (
                      <div className="space-y-3">
                        <Button onClick={() => router.push(ROUTES.LOGIN)} className="w-full h-12 bg-primary text-white font-bold text-lg">Войти и откликнуться</Button>
                        <p className="text-center text-xs text-gray-400">Нет аккаунта? <Link href={ROUTES.REGISTER} className="text-primary hover:underline">Зарегистрируйтесь</Link></p>
                      </div>
                    ) : userRole !== 'job_seeker' ? (
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <p className="text-sm text-amber-800 font-medium">Отклики доступны только для соискателей.</p>
                      </div>
                    ) : (
                      <>
                        {applyError && (
                          <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-sm text-red-700">{applyError}</div>
                        )}
                        <Button
                          onClick={handleApply}
                          disabled={applying}
                          className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-black text-xl shadow-lg shadow-accent/20 rounded-xl"
                        >
                          {applying ? <Loader2 className="w-6 h-6 animate-spin" /> : 'ОТКЛИКНУТЬСЯ'}
                        </Button>
                      </>
                    )}

                    <div className="pt-6 border-t border-gray-100 space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-tighter">
                          <Users className="w-4 h-4" /> Откликов
                        </span>
                        <span className="text-gray-900 font-black">{vacancy.applications_count || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-tighter">
                          <Eye className="w-4 h-4" /> Просмотров
                        </span>
                        <span className="text-gray-900 font-black">{vacancy.views_count || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
