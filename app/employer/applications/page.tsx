'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Send } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

export default function EmployerApplicationsPage() {
  const vacancyApplications: any[] = []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-muted-foreground mt-2">Manage all applications for your vacancies</p>
      </div>

      {vacancyApplications.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No applications yet"
          description="Applications from candidates will appear here once you post a job"
        />
      ) : (
        <div className="space-y-4">
          {vacancyApplications.map((app: any) => (
            <Card key={app.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Application</h3>
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
