import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getContacts, getConversation, sendMessage } from '@/lib/api';
import { Message } from '@/lib/types';
import { Send, MessageSquare } from 'lucide-react';

export default function CabinetMessages() {
  const { user, profile } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  useEffect(() => { if (user) getContacts(user.id).then(setContacts); }, [user]);
  useEffect(() => {
    if (user && selectedContact) getConversation(user.id, selectedContact.userId, selectedContact.vacancyId).then(setMessages);
  }, [user, selectedContact]);

  const handleSend = async () => {
    if (!user || !selectedContact || !text.trim()) return;
    await sendMessage(user.id, selectedContact.userId, text.trim(), selectedContact.vacancyId);
    setMessages(await getConversation(user.id, selectedContact.userId, selectedContact.vacancyId));
    setText('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-foreground">Сообщения</h1>
      <div className="flex flex-col md:flex-row gap-4 min-h-[400px]">
        <div className="w-full md:w-64 space-y-2">
          {contacts.length === 0 ? <p className="text-muted-foreground text-sm p-4">Нет сообщений</p> : contacts.map((c, i) => (
            <button key={i} onClick={() => setSelectedContact(c)} className={`w-full text-left p-3 rounded-xl transition-all ${selectedContact?.userId === c.userId ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-secondary border border-border'}`}>
              <p className="font-bold text-sm">{c.name}</p>
              <p className="text-xs truncate opacity-70">{c.lastMessage}</p>
            </button>
          ))}
        </div>
        <Card className="flex-1 border-none shadow-sm">
          <CardContent className="p-4 flex flex-col h-full min-h-[300px]">
            {!selectedContact ? (
              <div className="flex-1 flex items-center justify-center"><MessageSquare className="w-12 h-12 text-muted-foreground/30" /></div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${m.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={text} onChange={e => setText(e.target.value)} placeholder="Введите сообщение..." className="rounded-xl" onKeyDown={e => e.key === 'Enter' && handleSend()} />
                  <Button onClick={handleSend} className="rounded-xl"><Send className="w-4 h-4" /></Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
