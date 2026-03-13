'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/lib/utils/constants'
import { Send, Calendar, MapPin } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

const STATUS_COLORS = {
  pending: 'outline',
  reviewing: 'secondary',
  accepted: 'default',
  rejected: 'destructive',
  withdrawn: 'outline',
} as const

export default function ApplicationsPage() {
  const { user } = useAuth()
  const userApplications: any[] = []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground mt-2">Track the status of all your job applications</p>
      </div>

      {userApplications.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No applications yet"
          description="Start applying for jobs to see your applications here"
        />
      ) : (
        <div className="space-y-4">
          {userApplications.map((app: any) => (
            <Card key={app.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Application</h3>
                    <Badge
                      variant={STATUS_COLORS[app.status] as any}
                      className="capitalize"
                    >
                      {app.status}
                    </Badge>
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
