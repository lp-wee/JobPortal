'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/lib/utils/constants'
import { fetchCompany, fetchVacancies } from '@/lib/api-client'
import { MapPin, Globe, Users, Star, ArrowLeft, Briefcase, Loader2 } from 'lucide-react'

export default function CompanyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const [company, setCompany] = useState<any>(null)
  const [vacancies, setVacancies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || id === 'undefined') return
    const load = async () => {
      try {
        const companyId = parseInt(id)
        const [companyData, allVacancies] = await Promise.all([
          fetchCompany(companyId),
          fetchVacancies()
        ])
        setCompany(companyData)
        // Filter vacancies for this company locally for now as there's no specific company-vacancies endpoint yet
        setVacancies(allVacancies.filter((v: any) => v.company_id === companyId))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

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

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f0f2f5]">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center bg-white p-12 rounded-2xl shadow-xl">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Компания не найдена</h1>
            <Button onClick={() => router.push(ROUTES.HOME)} className="bg-primary px-8">На главную</Button>
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
        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
            <Briefcase className="w-64 h-64 text-white" />
          </div>
        </div>

        <div className="container max-w-5xl mx-auto px-4 -mt-16 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100">
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
                <div className="w-32 h-32 bg-gray-50 rounded-2xl flex items-center justify-center text-7xl border-4 border-white shadow-lg">
                  {company.logo || '🏢'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2 flex-wrap">
                    <h1 className="text-4xl font-extrabold text-gray-900">{company.name}</h1>
                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-bold text-yellow-700">{company.rating || '5.0'}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">{company.location || 'Не указано'}</span>
                    </div>
                    {company.website && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4" />
                        <a href={`https://${company.website}`} target="_blank" className="text-sm font-bold text-primary hover:underline">
                          {company.website}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">{company.employee_count || '0'} сотрудников</span>
                    </div>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
                    {company.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-8">
                <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-100">
                  <p className="text-3xl font-extrabold text-primary mb-1">{vacancies.length}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Открытых вакансий</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-100">
                  <p className="text-xl font-extrabold text-primary mb-1 truncate px-2">{company.industry || 'Не указано'}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Отрасль</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-100">
                  <p className="text-3xl font-extrabold text-primary mb-1">{company.active_vacancies || vacancies.length}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Активных</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
              Открытые вакансии
              <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">{vacancies.length}</span>
            </h2>

            {vacancies.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {vacancies.map((vacancy) => (
                  <Link
                    key={vacancy.id}
                    href={ROUTES.VACANCY_DETAIL(vacancy.id.toString())}
                    className="group bg-white p-6 rounded-2xl border border-gray-200 hover:border-primary hover:shadow-lg transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">
                          {vacancy.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1.5 font-bold text-gray-900">
                            {vacancy.salary_min || 0}-{vacancy.salary_max || '∞'} ₽
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {vacancy.location}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none px-3">
                            {vacancy.employment_type === 'full_time' ? 'Полная занятость' : 'Частичная занятость'}
                          </Badge>
                          <Badge variant="outline" className="border-gray-200">
                            {vacancy.experience_level === 'senior' ? 'Старший специалист' : 'Средний уровень'}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" className="text-primary font-bold group-hover:translate-x-1 transition-transform">
                        Подробнее
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl text-center border border-gray-200 shadow-sm">
                <p className="text-gray-500 font-medium italic">В данный момент нет открытых вакансий</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
