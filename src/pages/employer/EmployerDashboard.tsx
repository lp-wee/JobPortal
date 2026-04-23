import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getEmployerVacancies, getApplications } from '@/lib/api';
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/lib/constants';
import { Briefcase, Send, Eye, TrendingUp, Plus } from 'lucide-react';

export default function EmployerDashboard() {
  const { user, profile } = useAuth();
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    getEmployerVacancies(user.id).then(setVacancies);
    getApplications({ employer_user_id: user.id }).then(setApplications);
  }, [user]);

  const totalViews = vacancies.reduce((a, v) => a + (v.views_count || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-3xl font-bold text-foreground mb-2">Панель управления</h1><p className="text-muted-foreground">Добро пожаловать, {profile?.company_name || profile?.first_name}!</p></div>
        <Link to="/employer/vacancy/new"><Button className="rounded-xl font-black"><Plus className="w-4 h-4 mr-2" />Новая вакансия</Button></Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Вакансий</p><p className="text-3xl font-bold text-foreground">{vacancies.filter(v => v.is_active).length}</p></div><Briefcase className="w-8 h-8 text-primary opacity-20" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Откликов</p><p className="text-3xl font-bold text-foreground">{applications.length}</p></div><Send className="w-8 h-8 text-primary opacity-20" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Просмотров</p><p className="text-3xl font-bold text-foreground">{totalViews}</p></div><Eye className="w-8 h-8 text-primary opacity-20" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Новых откликов</p><p className="text-3xl font-bold text-foreground">{applications.filter(a => a.status === 'pending').length}</p></div><TrendingUp className="w-8 h-8 text-primary opacity-20" /></div></CardContent></Card>
      </div>
      <Card><CardHeader><div className="flex items-center justify-between"><CardTitle>Последние отклики</CardTitle><Link to="/employer/applications"><Button variant="ghost" size="sm">Все</Button></Link></div></CardHeader><CardContent>
        {applications.length === 0 ? <p className="text-muted-foreground text-sm">Откликов пока нет</p> : applications.slice(0, 5).map(app => (
          <div key={app.id} className="pb-3 border-b border-border last:border-0 mb-3 last:mb-0">
            <div className="flex items-center justify-between"><div><h4 className="font-semibold text-sm text-foreground">{app.first_name} {app.last_name}</h4><p className="text-xs text-muted-foreground">{app.vacancy_title}</p></div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${APPLICATION_STATUS_COLORS[app.status]}`}>{APPLICATION_STATUS_LABELS[app.status]}</span></div>
          </div>
        ))}
      </CardContent></Card>
    </div>
  );
}
