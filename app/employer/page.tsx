'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/lib/utils/constants'
import { Briefcase, Send, Users, TrendingUp, Plus } from 'lucide-react'

export default function EmployerDashboardPage() {
  const companyVacancies: any[] = []
  const vacancyApplications: any[] = []

  const applicationStats = {
    pending: 0,
    reviewing: 0,
    accepted: 0,
  }

  const totalViews = 0

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Manage your job postings and applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Vacancies</p>
                <p className="text-3xl font-bold">{companyVacancies.length}</p>
              </div>
              <Briefcase className="w-8 h-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Applications</p>
                <p className="text-3xl font-bold">{vacancyApplications.length}</p>
              </div>
              <Send className="w-8 h-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Views</p>
                <p className="text-3xl font-bold">{totalViews}</p>
              </div>
              <Eye className="w-8 h-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Under Review</p>
                <p className="text-3xl font-bold">{applicationStats.reviewing}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Vacancies */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Vacancies</CardTitle>
              <Link href={ROUTES.EMPLOYER_VACANCY_NEW}>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {companyVacancies.length === 0 ? (
              <p className="text-muted-foreground text-sm">No active vacancies</p>
            ) : (
              <div className="space-y-3">
                {companyVacancies.slice(0, 5).map((vacancy) => (
                  <div key={vacancy.id} className="pb-3 border-b last:border-0">
                    <h4 className="font-semibold text-sm mb-1">{vacancy.title}</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {vacancy.applications_count} applications
                      </p>
                      <Badge variant="outline" className="capitalize">
                        {vacancy.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              <Link href={ROUTES.EMPLOYER_APPLICATIONS}>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {vacancyApplications.length === 0 ? (
              <p className="text-muted-foreground text-sm">No applications yet</p>
            ) : (
              <div className="space-y-3">
                {vacancyApplications.slice(0, 5).map((app) => (
                  <div key={app.id} className="pb-3 border-b last:border-0">
                    <p className="text-xs text-muted-foreground mb-1">
                      Submitted {new Date(app.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">Candidate Application</p>
                      <Badge
                        variant={app.status === 'accepted' ? 'default' : 'outline'}
                        className="capitalize"
                      >
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <Link href={ROUTES.EMPLOYER_VACANCY_NEW}>
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Job
                </Button>
              </Link>
              <Link href={ROUTES.EMPLOYER_VACANCIES}>
                <Button variant="outline" className="w-full">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Manage Jobs
                </Button>
              </Link>
              <Link href={ROUTES.EMPLOYER_APPLICATIONS}>
                <Button variant="outline" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Applications
                </Button>
              </Link>
              <Link href={ROUTES.EMPLOYER_RESUMES}>
                <Button variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Search Resumes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
