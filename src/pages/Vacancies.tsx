import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getVacancies, getApplications } from '@/lib/api';
import { formatSalary, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { Vacancy } from '@/lib/types';
import { MapPin, Search, Filter, Briefcase, Users } from 'lucide-react';

export default function VacanciesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, isAuthenticated } = useAuth();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [appliedMap, setAppliedMap] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');

  const loadVacancies = async () => {
    const v = await getVacancies({
      search: searchQuery || undefined,
      employmentType: selectedTypes.length ? selectedTypes.join(',') : undefined,
      experienceLevel: selectedLevels.length ? selectedLevels.join(',') : undefined,
      location: locationFilter || undefined,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
    });
    setVacancies(v);
  };

  useEffect(() => { loadVacancies(); }, [searchParams, selectedTypes, selectedLevels, locationFilter]);

  useEffect(() => {
    if (isAuthenticated && user && profile?.role === 'job_seeker') {
      getApplications({ user_id: user.id }).then(apps => {
        const map: Record<string, string> = {};
        apps.forEach(a => { map[a.vacancy_id] = a.status; });
        setAppliedMap(map);
      });
    }
  }, [isAuthenticated, user, profile]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); loadVacancies(); };
  const toggleFilter = (type: 'type' | 'level', value: string) => {
    if (type === 'type') {
      setSelectedTypes(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    } else {
      setSelectedLevels(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <aside className="w-full lg:w-72 space-y-4">
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <h2 className="font-black text-foreground mb-6 flex items-center gap-2 uppercase tracking-tighter text-sm"><Filter className="w-4 h-4 text-primary" /> Фильтры</h2>
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-widest">Город</h3>
                  <Input placeholder="Город" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="rounded-xl text-sm" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-widest">Зарплата (UZS)</h3>
                  <div className="flex gap-2">
                    <Input placeholder="От" type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} onBlur={loadVacancies} className="rounded-xl text-sm" />
                    <Input placeholder="До" type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} onBlur={loadVacancies} className="rounded-xl text-sm" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-widest">Тип занятости</h3>
                  {Object.entries(EMPLOYMENT_TYPES).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox id={key} checked={selectedTypes.includes(key)} onCheckedChange={() => toggleFilter('type', key)} />
                      <Label htmlFor={key} className="text-sm font-bold text-muted-foreground cursor-pointer">{label}</Label>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-widest">Опыт</h3>
                  {Object.entries(EXPERIENCE_LEVELS).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox id={key} checked={selectedLevels.includes(key)} onCheckedChange={() => toggleFilter('level', key)} />
                      <Label htmlFor={key} className="text-sm font-bold text-muted-foreground cursor-pointer">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
          <div className="flex-1 space-y-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Профессия, должность или компания" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-12 sm:h-14 pl-12 rounded-2xl border-none shadow-sm font-medium" />
              </div>
              <Button type="submit" className="h-12 sm:h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl">Найти</Button>
            </form>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Найдено {vacancies.length} вакансий</h1>
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {vacancies.map(v => (
                <Card key={v.id} className="group border-none shadow-sm hover:shadow-xl transition-all rounded-2xl overflow-hidden cursor-pointer bg-card" onClick={() => navigate(`/vacancies/${v.id}`)}>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-secondary rounded-xl flex-shrink-0 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-black text-foreground group-hover:text-primary transition-colors">{v.title}</h2>
                            <p className="text-sm font-bold text-muted-foreground">{v.company_name}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          {v.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{v.location}</span>}
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{v.applications_count || 0} откликов</span>
                          <span className="bg-secondary px-2 py-0.5 rounded-full text-xs font-bold">{EMPLOYMENT_TYPES[v.employment_type] || v.employment_type}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-row md:flex-col items-center md:items-end gap-2">
                        <p className="text-lg font-black text-foreground whitespace-nowrap">{formatSalary(v.salary_min, v.salary_max)}</p>
                        {appliedMap[v.id] && (
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${APPLICATION_STATUS_COLORS[appliedMap[v.id]]}`}>
                            {APPLICATION_STATUS_LABELS[appliedMap[v.id]]}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {vacancies.length === 0 && (
                <div className="text-center py-24 bg-card rounded-3xl border border-border">
                  <p className="text-muted-foreground font-bold uppercase tracking-widest">Вакансий не найдено</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
