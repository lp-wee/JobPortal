import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getVacancies } from '@/lib/api';
import { formatSalary } from '@/lib/constants';
import { Vacancy } from '@/lib/types';
import { Search, Briefcase, ArrowRight, Users, Building2, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [latestVacancies, setLatestVacancies] = useState<Vacancy[]>([]);

  useEffect(() => { getVacancies().then(v => setLatestVacancies(v.slice(0, 4))); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/vacancies${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12 sm:py-20 md:py-24 bg-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-primary/5 rounded-full mix-blend-multiply filter blur-[120px] opacity-50 -translate-y-1/2 translate-x-1/3" />
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 md:mb-6 leading-tight tracking-tighter">
                  Работа найдётся <br /><span className="text-primary">для каждого</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 font-medium">
                  Лучший сервис для поиска работы и сотрудников в Узбекистане. Проверенные компании и тысячи актуальных вакансий.
                </p>
                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto lg:mx-0 shadow-2xl shadow-primary/10 rounded-2xl overflow-hidden border border-border">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input type="text" placeholder="Профессия, должность или компания" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-16 sm:h-20 pl-12 pr-32 sm:pr-40 text-base sm:text-xl border-none focus-visible:ring-0 placeholder:text-muted-foreground font-medium" />
                  <Button type="submit" className="absolute right-2 sm:right-3 top-2 sm:top-3 h-12 sm:h-14 px-6 sm:px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl text-base sm:text-lg shadow-lg shadow-primary/20">Найти</Button>
                </form>
                <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-3">
                  <span className="text-sm font-bold text-muted-foreground py-1 uppercase tracking-widest">Часто ищут:</span>
                  {['Дизайн', 'Продажи', 'Разработка', 'Маркетинг'].map(tag => (
                    <button key={tag} onClick={() => navigate(`/vacancies?search=${encodeURIComponent(tag)}`)} className="text-sm font-bold bg-secondary hover:bg-primary hover:text-primary-foreground px-4 py-1.5 rounded-full text-muted-foreground transition-all border border-border">{tag}</button>
                  ))}
                </div>
              </div>
              <div className="hidden lg:block flex-1 relative h-[500px] w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 rounded-[40px] shadow-2xl rotate-3 flex items-center justify-center overflow-hidden group">
                  <Briefcase className="w-48 h-48 text-primary-foreground/20 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute bottom-8 left-8 text-primary-foreground">
                    <p className="text-4xl font-black mb-1">50 000+</p>
                    <p className="text-primary-foreground/80 font-bold uppercase tracking-widest text-xs">Активных вакансий</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 bg-card border-y border-border">
          <div className="container max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-2"><Users className="w-8 h-8 text-primary" /><span className="text-3xl font-black text-foreground">10 000+</span><span className="text-sm text-muted-foreground font-medium">Соискателей</span></div>
            <div className="flex flex-col items-center gap-2"><Building2 className="w-8 h-8 text-primary" /><span className="text-3xl font-black text-foreground">500+</span><span className="text-sm text-muted-foreground font-medium">Компаний</span></div>
            <div className="flex flex-col items-center gap-2"><TrendingUp className="w-8 h-8 text-primary" /><span className="text-3xl font-black text-foreground">95%</span><span className="text-sm text-muted-foreground font-medium">Находят работу</span></div>
          </div>
        </section>
        <section className="py-20 bg-background">
          <div className="container max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-black text-foreground mb-12 tracking-tight">Свежие вакансии</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestVacancies.map(v => (
                <button key={v.id} onClick={() => navigate(`/vacancies/${v.id}`)} className="bg-card p-6 rounded-2xl border border-border hover:border-primary hover:shadow-xl transition-all text-left group">
                  <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">{v.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{v.company_name}</p>
                  <p className="text-sm text-muted-foreground mb-1">{v.applications_count || 0} откликов</p>
                  <p className="text-lg font-black text-foreground">{formatSalary(v.salary_min, v.salary_max)}</p>
                </button>
              ))}
            </div>
            <Button onClick={() => navigate('/vacancies')} variant="outline" className="mt-12 h-14 px-10 rounded-xl border-2 font-black text-primary hover:bg-primary hover:text-primary-foreground transition-all">
              Все вакансии <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
