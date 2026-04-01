'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ROUTES } from '@/lib/utils/constants'
import { fetchVacancies, fetchApplications } from '@/lib/api-client'
import { useAuth } from '@/hooks/useAuth'
import { MapPin, Search, Filter, Loader2, Briefcase, ChevronRight, CheckCircle2 } from 'lucide-react'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, userRole } = useAuth()
  
  const [vacancies, setVacancies] = useState<any[]>([])
  const [appliedVacancyIds, setAppliedVacancyIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState<string[]>(
    searchParams.get('employmentType')?.split(',').filter(Boolean) || []
  )
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<string[]>(
    searchParams.get('experienceLevel')?.split(',').filter(Boolean) || []
  )

  const loadVacancies = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchVacancies({
        search: searchParams.get('search') || undefined,
        location: searchParams.get('location') || undefined,
        employmentType: searchParams.get('employmentType') || undefined,
        experienceLevel: searchParams.get('experienceLevel') || undefined,
      })
      setVacancies(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    if (isAuthenticated && userRole === 'job_seeker') {
      fetchApplications()
        .then((apps) => {
          setAppliedVacancyIds(new Set(apps.map((a: any) => a.vacancy_id)))
        })
        .catch(() => {})
    }
  }, [isAuthenticated, userRole])

  useEffect(() => {
    loadVacancies()
  }, [loadVacancies])

  const updateFilters = (type: 'employmentType' | 'experienceLevel', value: string, checked: boolean) => {
    const current = type === 'employmentType' ? selectedEmploymentTypes : selectedExperienceLevels
    const setter = type === 'employmentType' ? setSelectedEmploymentTypes : setSelectedExperienceLevels
    
    let next: string[]
    if (checked) {
      next = [...current, value]
    } else {
      next = current.filter(v => v !== value)
    }
    
    setter(next)
    
    const params = new URLSearchParams(searchParams.toString())
    if (next.length > 0) {
      params.set(type, next.join(','))
    } else {
      params.delete(type)
    }
    router.push(`${ROUTES.VACANCIES}?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery) params.set('search', searchQuery)
    else params.delete('search')
    router.push(`${ROUTES.VACANCIES}?${params.toString()}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f9]">
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-72 space-y-4 md:space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="font-black text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-tighter text-sm">
                <Filter className="w-4 h-4 text-primary" /> Фильтры
              </h2>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Тип занятости</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'full_time', label: 'Полная занятость' },
                      { id: 'part_time', label: 'Частичная' },
                      { id: 'freelance', label: 'Фриланс' },
                    ].map((type) => (
                      <div key={type.id} className="flex items-center space-x-2 group cursor-pointer">
                        <Checkbox 
                          id={type.id} 
                          checked={selectedEmploymentTypes.includes(type.id)}
                          onCheckedChange={(checked) => updateFilters('employmentType', type.id, !!checked)}
                          className="rounded-md border-gray-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                        />
                        <Label htmlFor={type.id} className="text-sm font-bold text-gray-600 group-hover:text-primary cursor-pointer transition-colors">
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Опыт работы</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'entry', label: 'Без опыта' },
                      { id: 'mid', label: '1–3 года' },
                      { id: 'senior', label: '3–6 лет' },
                    ].map((level) => (
                      <div key={level.id} className="flex items-center space-x-2 group cursor-pointer">
                        <Checkbox 
                          id={level.id} 
                          checked={selectedExperienceLevels.includes(level.id)}
                          onCheckedChange={(checked) => updateFilters('experienceLevel', level.id, !!checked)}
                          className="rounded-md border-gray-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                        />
                        <Label htmlFor={level.id} className="text-sm font-bold text-gray-600 group-hover:text-primary cursor-pointer transition-colors">
                          {level.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Search Results */}
          <div className="flex-1 space-y-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Профессия, должность или компания"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 sm:h-14 pl-12 pr-4 rounded-2xl border-none shadow-sm focus-visible:ring-primary/20 font-medium text-base"
                />
              </div>
              <Button type="submit" className="h-12 sm:h-14 px-6 sm:px-8 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 whitespace-nowrap">
                Найти
              </Button>
            </form>

            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {loading ? 'Поиск...' : `Найдено ${vacancies.length} вакансий`}
              </h1>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Загружаем лучшее для вас</p>
              </div>
            ) : vacancies.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 md:gap-4">
                {vacancies.map((vacancy) => (
                  <Card 
                    key={vacancy.id} 
                    className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer bg-white"
                    onClick={() => router.push(ROUTES.VACANCY_DETAIL(vacancy.id.toString()))}
                  >
                    <CardContent className="p-4 md:p-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                        <div className="flex-1 space-y-3 md:space-y-4">
                          <div className="flex items-start gap-3 md:gap-4">
                            <div className="w-10 md:w-12 h-10 md:h-12 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl md:text-3xl border border-gray-100 group-hover:scale-110 transition-transform">
                              {vacancy.company_logo || '🏢'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h2 className="text-lg md:text-2xl font-black text-gray-900 group-hover:text-primary transition-colors leading-tight break-words">
                                {vacancy.title}
                              </h2>
                              <Link 
                                href={ROUTES.COMPANY_PROFILE(vacancy.company_id.toString())}
                                className="text-xs md:text-sm font-bold text-gray-500 hover:text-primary transition-colors line-clamp-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {vacancy.company_name}
                              </Link>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm font-bold text-gray-400">
                            <div className="flex items-center gap-1 bg-gray-50 px-2 md:px-3 py-1 rounded-lg">
                              <MapPin className="w-3 md:w-4 h-3 md:h-4 flex-shrink-0" /> {vacancy.location}
                            </div>
                            <div className="flex items-center gap-1 bg-blue-50 text-primary px-2 md:px-3 py-1 rounded-lg">
                              {vacancy.salary_min || 0}-{vacancy.salary_max || '∞'} ₽
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4 mt-3 md:mt-0">
                          {appliedVacancyIds.has(vacancy.id) ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-100">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Откликнулись</span>
                            </div>
                          ) : (
                            <Button variant="ghost" className="rounded-xl font-black text-primary group-hover:bg-primary/5 transition-all text-sm md:text-base px-2 md:px-4">
                              <span className="hidden sm:inline">ОТКЛИКНУТЬСЯ</span>
                              <span className="sm:hidden">ОТКЛИК</span>
                              <ChevronRight className="ml-1 w-3 md:w-4 h-3 md:h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-gray-100">
                <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-gray-900 mb-2">Ничего не нашли</h3>
                <p className="text-gray-500 font-medium">Попробуйте изменить запрос или сбросить фильтры</p>
                <Button 
                  variant="outline" 
                  className="mt-8 rounded-xl border-2 font-bold hover:bg-primary hover:text-white transition-all"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedEmploymentTypes([])
                    setSelectedExperienceLevels([])
                    router.push(ROUTES.VACANCIES)
                  }}
                >
                  Сбросить всё
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
