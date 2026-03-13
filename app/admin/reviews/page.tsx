'use client'

import { EmptyState } from '@/components/ui/EmptyState'
import { MessageSquare } from 'lucide-react'

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews Moderation</h1>
        <p className="text-muted-foreground mt-2">Review and moderate user reviews</p>
      </div>

      <EmptyState
        icon={MessageSquare}
        title="No reviews to moderate"
        description="There are currently no user reviews to review"
      />
    </div>
  )
}
