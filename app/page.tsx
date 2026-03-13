'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/lib/utils/constants'
import { fetchVacancies } from '@/lib/api-client'
import { Search, Briefcase, TrendingUp, Users, ArrowRight, Loader2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [latestVacancies, setLatestVacancies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchVacancies()
        setLatestVacancies(data.slice(0, 4))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery) {
      router.push(`${ROUTES.VACANCIES}?search=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push(ROUTES.VACANCIES)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="py-12 sm:py-20 md:py-24 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-blue-50 rounded-full mix-blend-multiply filter blur-[80px] sm:blur-[120px] opacity-50 -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 md:mb-6 leading-tight tracking-tighter">
                  Работа найдется <br/> <span className="text-primary">для каждого</span>
                </h1>
                <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto lg:mx-0 font-medium">
                  Лучший сервис для поиска работы и сотрудников. Прямые контакты, проверенные компании и тысячи актуальных вакансий.
                </p>

                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto lg:mx-0 shadow-2xl shadow-blue-100 rounded-2xl overflow-hidden border border-gray-100">
                  <Input
                    type="text"
                    placeholder="Профессия, должность или компания"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-20 pl-8 pr-40 text-xl border-none focus-visible:ring-0 placeholder:text-gray-400 font-medium"
                  />
                  <Button 
                    type="submit" 
                    className="absolute right-3 top-3 h-14 px-10 bg-primary hover:bg-primary/90 text-white font-black rounded-xl text-lg shadow-lg shadow-primary/20"
                  >
                    Найти
                  </Button>
                </form>

                <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-3">
                  <span className="text-sm font-bold text-gray-400 py-1 uppercase tracking-widest">Часто ищут:</span>
                  {['Дизайн', 'Продажи', 'Разработка', 'Маркетинг'].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => {
                        setSearchQuery(tag)
                        router.push(`${ROUTES.VACANCIES}?search=${encodeURIComponent(tag)}`)
                      }}
                      className="text-sm font-bold bg-gray-50 hover:bg-primary hover:text-white px-4 py-1.5 rounded-full text-gray-600 transition-all border border-gray-100"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="hidden lg:block flex-1 relative h-[500px] w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[40px] shadow-2xl rotate-3 flex items-center justify-center overflow-hidden group">
                  <Briefcase className="w-48 h-48 text-white/20 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute bottom-8 left-8 text-white">
                    <p className="text-4xl font-black mb-1">50 000+</p>
                    <p className="text-white/80 font-bold uppercase tracking-widest text-xs">Активных вакансий</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50 border-y border-gray-100">
          <div className="container max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-12 tracking-tight">Свежие вакансии</h2>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {latestVacancies.map(vacancy => (
                  <Link 
                    key={vacancy.id} 
                    href={ROUTES.VACANCY_DETAIL(vacancy.id.toString())}
                    className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-primary hover:shadow-xl transition-all text-left group"
                  >
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">{vacancy.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-1">{vacancy.company_name}</p>
                    <p className="text-lg font-black text-gray-900">{vacancy.salary_min || 0} ₽</p>
                  </Link>
                ))}
              </div>
            )}
            
            <Button 
              onClick={() => router.push(ROUTES.VACANCIES)}
              variant="outline" 
              className="mt-12 h-14 px-10 rounded-xl border-2 font-black text-primary hover:bg-primary hover:text-white transition-all"
            >
              Смотреть все вакансии <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
