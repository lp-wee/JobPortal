'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES, APPLICATION_STATUS } from '@/lib/utils/constants'
import { Send, Loader2, Building2, Calendar, ExternalLink } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { fetchApplications } from '@/lib/api-client'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  reviewing: 'bg-blue-50 text-blue-700 border-blue-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  withdrawn: 'bg-gray-50 text-gray-600 border-gray-200',
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
      .then(setApplications)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Мои отклики</h1>
        <p className="text-muted-foreground mt-2">Статусы всех ваших откликов на вакансии</p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={Send}
          title="Откликов пока нет"
          description="Начните откликаться на вакансии, чтобы видеть их здесь"
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app: any) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{app.vacancy_title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[app.status] || ''}`}>
                        {APPLICATION_STATUS[app.status as keyof typeof APPLICATION_STATUS] || app.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Building2 className="w-4 h-4" />
                      <span>{app.company_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Отправлен {new Date(app.created_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                    {app.cover_letter && (
                      <p className="mt-2 text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3">
                        {app.cover_letter}
                      </p>
                    )}
                  </div>
                  <Link href={ROUTES.VACANCY_DETAIL(app.vacancy_id.toString())}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Вакансия
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
