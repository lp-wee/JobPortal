import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getEmployerVacancies } from '@/lib/api';
import { formatSalary } from '@/lib/constants';
import { Vacancy } from '@/lib/types';
import { Plus, Users, Eye } from 'lucide-react';

export default function EmployerVacancies() {
  const { user } = useAuth();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  useEffect(() => { if (user) getEmployerVacancies(user.id).then(setVacancies); }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-black text-foreground">Мои вакансии</h1>
        <Link to="/employer/vacancy/new"><Button className="rounded-xl font-bold"><Plus className="w-4 h-4 mr-2" />Создать</Button></Link>
      </div>
      {vacancies.length === 0 ? (
        <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground">Вакансий пока нет</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {vacancies.map(v => (
            <Card key={v.id} className="border-none shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-foreground">{v.title}</h3>
                    <p className="text-sm text-muted-foreground">{formatSalary(v.salary_min, v.salary_max)}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{v.applications_count || 0} откликов</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{v.views_count} просмотров</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${v.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{v.is_active ? 'Активна' : 'Закрыта'}</span>
                    <Link to={`/employer/vacancy/edit/${v.id}`}><Button size="sm" variant="outline" className="rounded-lg text-xs">Редактировать</Button></Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
