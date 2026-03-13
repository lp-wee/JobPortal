'use client'

import { FileText } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

export default function ResumesSearchPage() {
  const resumes: any[] = []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search Resumes</h1>
        <p className="text-muted-foreground mt-2">Find and review candidate resumes</p>
      </div>

      {resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resumes found"
          description="Resumes from candidates will appear here"
        />
      ) : (
        <div className="space-y-4">
          {resumes.map((resume: any) => (
            <div key={resume.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">{resume.title}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
