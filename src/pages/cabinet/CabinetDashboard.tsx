import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApplications, getResumes } from '@/lib/api';
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/lib/constants';
import { FileText, Send, Clock, TrendingUp, Eye, Bookmark } from 'lucide-react';

export default function CabinetDashboard() {
  const { user, profile } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    getApplications({ user_id: user.id }).then(setApplications);
    getResumes(user.id).then(setResumes);
  }, [user]);

  const stats = { reviewing: applications.filter(a => a.status === 'reviewing').length, accepted: applications.filter(a => a.status === 'accepted').length };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Добро пожаловать, {profile?.first_name}!</h1>
        <p className="text-muted-foreground">Управляйте откликами и развивайте карьеру</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Всего откликов</p><p className="text-3xl font-bold text-foreground">{applications.length}</p></div><Send className="w-8 h-8 text-primary opacity-20" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Мои резюме</p><p className="text-3xl font-bold text-foreground">{resumes.length}</p></div><FileText className="w-8 h-8 text-primary opacity-20" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">На рассмотрении</p><p className="text-3xl font-bold text-foreground">{stats.reviewing}</p></div><Clock className="w-8 h-8 text-primary opacity-20" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Принято</p><p className="text-3xl font-bold text-foreground">{stats.accepted}</p></div><TrendingUp className="w-8 h-8 text-primary opacity-20" /></div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><div className="flex items-center justify-between"><CardTitle>Последние отклики</CardTitle><Link to="/cabinet/applications"><Button variant="ghost" size="sm">Все</Button></Link></div></CardHeader><CardContent>{applications.length === 0 ? <p className="text-muted-foreground text-sm">Откликов пока нет</p> : applications.slice(0, 5).map(app => (
          <div key={app.id} className="pb-3 border-b border-border last:border-0 mb-3 last:mb-0"><h4 className="font-semibold text-sm text-foreground mb-1">{app.vacancy_title}</h4><div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">{app.company_name}</p><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${APPLICATION_STATUS_COLORS[app.status]}`}>{APPLICATION_STATUS_LABELS[app.status]}</span></div></div>
        ))}</CardContent></Card>
        <Card><CardHeader><CardTitle>Быстрые действия</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 gap-3">
          <Link to="/vacancies"><Button variant="outline" className="w-full"><Eye className="w-4 h-4 mr-2" />Вакансии</Button></Link>
          <Link to="/cabinet/resumes"><Button variant="outline" className="w-full"><FileText className="w-4 h-4 mr-2" />Резюме</Button></Link>
          <Link to="/cabinet/saved"><Button variant="outline" className="w-full"><Bookmark className="w-4 h-4 mr-2" />Сохранённые</Button></Link>
          <Link to="/cabinet/settings"><Button variant="outline" className="w-full">Настройки</Button></Link>
        </div></CardContent></Card>
      </div>
    </div>
  );
}
