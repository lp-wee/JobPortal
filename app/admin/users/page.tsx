'use client'

import { EmptyState } from '@/components/ui/EmptyState'
import { Users } from 'lucide-react'

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">Manage platform users</p>
      </div>

      <EmptyState
        icon={Users}
        title="No users to manage"
        description="There are currently no users to moderate"
      />
    </div>
  )
}
