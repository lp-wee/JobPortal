'use client'

import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Briefcase } from 'lucide-react'

export default function AdminVacanciesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vacancies Moderation</h1>
        <p className="text-muted-foreground mt-2">Review and manage job postings</p>
      </div>

      <div className="space-y-4">
        <EmptyState
          icon={Briefcase}
          title="No vacancies to moderate"
          description="There are currently no job postings to review"
        />
      </div>
    </div>
  )
}
