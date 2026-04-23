import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSavedVacancies, unsaveVacancy } from '@/lib/api';
import { formatSalary } from '@/lib/constants';
import { Vacancy } from '@/lib/types';
import { Bookmark, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CabinetSaved() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);

  const load = async () => { if (user) setVacancies(await getSavedVacancies(user.id)); };
  useEffect(() => { load(); }, [user]);

  const handleUnsave = async (vacancyId: string) => {
    if (!user) return;
    await unsaveVacancy(user.id, vacancyId);
    await load();
    toast({ title: 'Удалено из сохранённых' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-foreground">Сохранённые вакансии</h1>
      {vacancies.length === 0 ? (
        <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground">Сохранённых вакансий пока нет</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {vacancies.map(v => (
            <Card key={v.id} className="border-none shadow-sm cursor-pointer" onClick={() => navigate(`/vacancies/${v.id}`)}>
              <CardContent className="p-4 md:p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-bold text-foreground">{v.title}</h3>
                    <p className="text-sm text-muted-foreground">{v.company_name} • {formatSalary(v.salary_min, v.salary_max)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleUnsave(v.id); }} className="text-primary">
                  <Bookmark className="w-4 h-4 fill-current" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
