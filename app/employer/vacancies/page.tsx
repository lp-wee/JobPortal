'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/lib/utils/constants'
import { Plus } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Briefcase } from 'lucide-react'

export default function EmployerVacanciesPage() {
  const companyVacancies: any[] = []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Vacancies</h1>
          <p className="text-muted-foreground">Manage your job postings</p>
        </div>
        <Link href={ROUTES.EMPLOYER_VACANCY_NEW}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      {companyVacancies.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No vacancies posted yet"
          description="Create your first job posting to start finding candidates"
        />
      ) : (
        <div className="space-y-4">
          {companyVacancies.map((vacancy: any) => (
            <Card key={vacancy.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{vacancy.title}</h3>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <span>{vacancy.applications_count} applications</span>
                      <span>Posted {new Date(vacancy.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
