'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Loader2, Trash2, Shield, Briefcase, User } from 'lucide-react'
import { fetchAdminUsers, deleteAdminUser } from '@/lib/api-client'

const ROLE_LABELS: Record<string, { label: string; color: string; Icon: any }> = {
  admin: { label: 'Администратор', color: 'text-purple-700 bg-purple-50 border-purple-200', Icon: Shield },
  employer: { label: 'Работодатель', color: 'text-blue-700 bg-blue-50 border-blue-200', Icon: Briefcase },
  job_seeker: { label: 'Соискатель', color: 'text-green-700 bg-green-50 border-green-200', Icon: User },
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await fetchAdminUsers()
      setUsers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить пользователя? Это действие необратимо.')) return
    setDeletingId(id)
    try {
      await deleteAdminUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (e) {
      console.error(e)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление пользователями</h1>
          <p className="text-muted-foreground mt-2">Всего: {users.length}</p>
        </div>
        <Button variant="outline" onClick={loadUsers} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Обновить
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground">Нет пользователей</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {users.map(user => {
            const roleInfo = ROLE_LABELS[user.role] || { label: user.role, color: 'text-gray-600 bg-gray-50 border-gray-200', Icon: User }
            const RoleIcon = roleInfo.Icon
            return (
              <Card key={user.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm ring-2 flex-shrink-0 ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700 ring-purple-300' :
                      user.role === 'employer' ? 'bg-blue-100 text-blue-700 ring-blue-300' :
                      'bg-green-100 text-green-700 ring-green-300'
                    }`}>
                      {(user.first_name?.[0] || user.email[0]).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border flex items-center gap-1 ${roleInfo.color}`}>
                      <RoleIcon className="w-3 h-3" />
                      {roleInfo.label}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {new Date(user.created_at).toLocaleDateString('ru-RU')}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(user.id)}
                      disabled={deletingId === user.id}
                    >
                      {deletingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
