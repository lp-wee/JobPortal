'use client'

import { useState, useEffect } from 'react'
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
import { fetchVacancies } from '@/lib/api-client'
import { MapPin, Search, Filter, Loader2, Briefcase, ChevronRight } from 'lucide-react'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  
  const [vacancies, setVacancies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialSearch)

  useEffect(() => {
    loadVacancies()
  }, [searchParams])

  const loadVacancies = async () => {
    setLoading(true)
    try {
      const data = await fetchVacancies({
        search: searchParams.get('search') || undefined,
        location: searchParams.get('location') || undefined,
      })
      setVacancies(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
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
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64 space-y-6">
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
                        <Checkbox id={type.id} className="rounded-md border-gray-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
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
                        <Checkbox id={level.id} className="rounded-md border-gray-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
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
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Профессия, должность или компания"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 pl-12 pr-4 rounded-2xl border-none shadow-sm focus-visible:ring-primary/20 text-lg font-medium"
                />
              </div>
              <Button type="submit" className="h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95">
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
              <div className="grid grid-cols-1 gap-4">
                {vacancies.map((vacancy) => (
                  <Card 
                    key={vacancy.id} 
                    className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer bg-white"
                    onClick={() => router.push(ROUTES.VACANCY_DETAIL(vacancy.id.toString()))}
                  >
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-3xl border border-gray-100 group-hover:scale-110 transition-transform">
                              {vacancy.company_logo || '🏢'}
                            </div>
                            <div>
                              <h2 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors leading-tight">
                                {vacancy.title}
                              </h2>
                              <Link 
                                href={ROUTES.COMPANY_PROFILE(vacancy.company_id.toString())}
                                className="text-sm font-bold text-gray-500 hover:text-primary transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {vacancy.company_name}
                              </Link>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-400">
                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg">
                              <MapPin className="w-4 h-4" /> {vacancy.location}
                            </div>
                            <div className="flex items-center gap-1.5 bg-blue-50 text-primary px-3 py-1 rounded-lg">
                              {vacancy.salary_min || 0}-{vacancy.salary_max || '∞'} ₽
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <Button variant="ghost" className="rounded-xl font-black text-primary group-hover:bg-primary/5 transition-all">
                            ОТКЛИКНУТЬСЯ <ChevronRight className="ml-1 w-4 h-4" />
                          </Button>
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
