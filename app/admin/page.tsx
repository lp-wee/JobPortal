'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/lib/utils/constants'
import { Users, Briefcase, Send, TrendingUp, Loader2, RefreshCw } from 'lucide-react'
import { fetchAdminStats } from '@/lib/api-client'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalVacancies: 0,
    totalApplications: 0,
  })
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await fetchAdminStats()
      setStats(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Панель администратора</h1>
          <p className="text-muted-foreground">Обзор платформы и управление</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadStats} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Всего пользователей</p>
                <p className="text-3xl font-bold">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : stats.totalUsers}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500 opacity-40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Компании</p>
                <p className="text-3xl font-bold">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : stats.totalCompanies}
                </p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-500 opacity-40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Вакансии</p>
                <p className="text-3xl font-bold">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : stats.totalVacancies}
                </p>
              </div>
              <Briefcase className="w-8 h-8 text-green-500 opacity-40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Отклики</p>
                <p className="text-3xl font-bold">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : stats.totalApplications}
                </p>
              </div>
              <Send className="w-8 h-8 text-orange-500 opacity-40" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={ROUTES.ADMIN_USERS} className="block">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Управление пользователями
              </Button>
            </Link>
            <Link href={ROUTES.ADMIN_VACANCIES} className="block">
              <Button variant="outline" className="w-full justify-start">
                <Briefcase className="w-4 h-4 mr-2" />
                Управление вакансиями
              </Button>
            </Link>
            <Link href={ROUTES.ADMIN_REVIEWS} className="block">
              <Button variant="outline" className="w-full justify-start">
                <Send className="w-4 h-4 mr-2" />
                Отзывы
              </Button>
            </Link>
            <Link href={ROUTES.ADMIN_REPORTS} className="block">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                Отчёты
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Состояние платформы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">API</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Работает</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">База данных</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Подключена</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Кэш</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Активен</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
