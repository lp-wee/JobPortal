'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Loader2, Send, ArrowLeft, PenSquare, X } from 'lucide-react'
import { fetchMessageContacts, fetchConversation, sendMessage, markMessageRead } from '@/lib/api-client'
import { useAuth } from '@/hooks/useAuth'

export default function EmployerMessagesPage() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [conversation, setConversation] = useState<any[]>([])
  const [convLoading, setConvLoading] = useState(false)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [showCompose, setShowCompose] = useState(false)
  const [composeForm, setComposeForm] = useState({ recipient_id: '', content: '' })
  const [composeError, setComposeError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadContacts = async () => {
    try {
      const data = await fetchMessageContacts()
      setContacts(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversation])

  const openConversation = async (contact: any) => {
    setSelectedContact(contact)
    setConvLoading(true)
    setShowCompose(false)
    try {
      const data = await fetchConversation(contact.partner_id)
      setConversation(data)
      for (const msg of data) {
        if (!msg.is_read && msg.recipient_id === user?.id) {
          markMessageRead(msg.id).catch(() => {})
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setConvLoading(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim() || !selectedContact) return
    setSending(true)
    try {
      await sendMessage({
        recipient_id: selectedContact.partner_id,
        title: 'Сообщение от работодателя',
        content: reply.trim(),
      })
      setReply('')
      const data = await fetchConversation(selectedContact.partner_id)
      setConversation(data)
      loadContacts()
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  const handleCompose = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!composeForm.recipient_id || !composeForm.content.trim()) return
    setSending(true)
    setComposeError('')
    try {
      await sendMessage({
        recipient_id: parseInt(composeForm.recipient_id),
        title: 'Сообщение от работодателя',
        content: composeForm.content.trim(),
      })
      setComposeForm({ recipient_id: '', content: '' })
      setShowCompose(false)
      loadContacts()
    } catch (e: any) {
      setComposeError(e.message || 'Ошибка отправки')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Сообщения</h1>
          <p className="text-muted-foreground">Общайтесь с соискателями</p>
        </div>
        <Button onClick={() => { setShowCompose(v => !v); setSelectedContact(null) }} variant={showCompose ? 'outline' : 'default'} size="sm">
          {showCompose ? <><X className="w-4 h-4 mr-1" />Отмена</> : <><PenSquare className="w-4 h-4 mr-1" />Написать</>}
        </Button>
      </div>

      {showCompose && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleCompose} className="space-y-3">
              <div>
                <label className="text-sm font-semibold block mb-1">ID получателя (соискателя)</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  type="number"
                  placeholder="Введите ID пользователя"
                  value={composeForm.recipient_id}
                  onChange={e => setComposeForm(p => ({ ...p, recipient_id: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">Сообщение</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={3}
                  placeholder="Текст сообщения..."
                  value={composeForm.content}
                  onChange={e => setComposeForm(p => ({ ...p, content: e.target.value }))}
                  required
                />
              </div>
              {composeError && <p className="text-red-600 text-sm">{composeError}</p>}
              <Button type="submit" disabled={sending} size="sm">
                {sending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
                Отправить
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[560px]">
        <div className={`md:col-span-1 flex flex-col gap-2 overflow-y-auto ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
          {contacts.length === 0 ? (
            <Card className="flex-1">
              <CardContent className="py-12 flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground mb-3 opacity-30" />
                <p className="text-muted-foreground text-sm">Нет переписок</p>
                <p className="text-xs text-muted-foreground mt-1">Напишите соискателю, нажав «Написать»</p>
              </CardContent>
            </Card>
          ) : (
            contacts.map(contact => (
              <Card
                key={contact.partner_id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${selectedContact?.partner_id === contact.partner_id ? 'ring-2 ring-primary' : ''} ${contact.unread_count > 0 ? 'border-primary/30 bg-blue-50/20' : ''}`}
                onClick={() => openConversation(contact)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 font-black flex items-center justify-center text-sm flex-shrink-0">
                    {(contact.partner_name || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{contact.partner_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{contact.last_message}</p>
                  </div>
                  {contact.unread_count > 0 && (
                    <span className="w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                      {contact.unread_count}
                    </span>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className={`md:col-span-2 flex flex-col ${!selectedContact ? 'hidden md:flex' : 'flex'}`}>
          {!selectedContact ? (
            <Card className="flex-1">
              <CardContent className="h-full flex flex-col items-center justify-center text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium">Выберите диалог</p>
                <p className="text-xs text-muted-foreground mt-1">или нажмите «Написать» для нового сообщения</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b flex items-center gap-3">
                <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSelectedContact(null)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="w-9 h-9 rounded-lg bg-green-100 text-green-700 font-black flex items-center justify-center text-sm">
                  {(selectedContact.partner_name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm">{selectedContact.partner_name}</p>
                  <p className="text-xs text-muted-foreground">Соискатель</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {convLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : conversation.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">Нет сообщений в этом диалоге</p>
                ) : (
                  conversation.map(msg => {
                    const isOwn = msg.sender_id === user?.id
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isOwn ? 'bg-primary text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
                <input
                  className="flex-1 px-4 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Написать сообщение..."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                />
                <Button type="submit" size="sm" disabled={sending || !reply.trim()} className="rounded-xl">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
