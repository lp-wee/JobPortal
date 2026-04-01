'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, Loader2, Eye, EyeOff, MapPin } from 'lucide-react'
import { fetchAdminVacancies, toggleAdminVacancy } from '@/lib/api-client'
import Link from 'next/link'
import { ROUTES } from '@/lib/utils/constants'

export default function AdminVacanciesPage() {
  const [vacancies, setVacancies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const loadVacancies = async () => {
    setLoading(true)
    try {
      const data = await fetchAdminVacancies()
      setVacancies(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVacancies()
  }, [])

  const handleToggle = async (id: number, currentActive: boolean) => {
    setTogglingId(id)
    try {
      await toggleAdminVacancy(id, !currentActive)
      setVacancies(prev => prev.map(v => v.id === id ? { ...v, is_active: !currentActive } : v))
    } catch (e) {
      console.error(e)
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление вакансиями</h1>
          <p className="text-muted-foreground mt-2">Всего: {vacancies.length}</p>
        </div>
        <Button variant="outline" onClick={loadVacancies} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Обновить
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : vacancies.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground">Нет вакансий</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {vacancies.map(vacancy => (
            <Card key={vacancy.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    href={ROUTES.VACANCY_DETAIL(vacancy.id.toString())}
                    className="font-bold text-sm hover:text-primary transition-colors truncate block"
                  >
                    {vacancy.title}
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{vacancy.company_name}</span>
                    {vacancy.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />{vacancy.location}
                      </span>
                    )}
                    <span>{vacancy.applications_count || 0} откликов</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                    vacancy.is_active
                      ? 'text-green-700 bg-green-50 border-green-200'
                      : 'text-gray-500 bg-gray-50 border-gray-200'
                  }`}>
                    {vacancy.is_active ? 'Активна' : 'Закрыта'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggle(vacancy.id, vacancy.is_active)}
                    disabled={togglingId === vacancy.id}
                    className="text-muted-foreground hover:text-primary"
                    title={vacancy.is_active ? 'Скрыть' : 'Показать'}
                  >
                    {togglingId === vacancy.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : vacancy.is_active ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
