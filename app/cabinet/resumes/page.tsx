'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Plus } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

export default function ResumesPage() {
  const { user } = useAuth()
  const userResumes: any[] = []
  const [selectedResume, setSelectedResume] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Resumes</h1>
          <p className="text-muted-foreground mt-2">Manage and organize your resumes</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New Resume
        </Button>
      </div>

      {userResumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resumes yet"
          description="Create your first resume to start applying for jobs"
        />
      ) : (
        <div className="space-y-4">
          {userResumes.map((resume: any) => (
            <Card key={resume.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{resume.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Updated {new Date(resume.updated_at).toLocaleDateString()}
                    </p>
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
