import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCompanies } from '@/lib/api';
import { Company } from '@/lib/types';
import { Building2, Star, MapPin, Briefcase } from 'lucide-react';

export default function CompaniesPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  useEffect(() => { getCompanies().then(setCompanies); }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black text-foreground mb-8 tracking-tighter">Компании</h1>
        {companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map(c => (
              <Card key={c.id} className="border-none shadow-sm hover:shadow-xl transition-all rounded-2xl overflow-hidden group bg-card">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center border border-border group-hover:scale-110 transition-transform">
                      <Building2 className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-foreground mb-1">{c.name}</h2>
                      <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm"><Star className="w-4 h-4 fill-current" /> {Number(c.rating).toFixed(1)}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{c.description}</p>
                  <div className="space-y-2 mb-6">
                    {c.location && <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground"><MapPin className="w-4 h-4" />{c.location}</div>}
                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground"><Briefcase className="w-4 h-4" />{c.active_vacancies || 0} активных вакансий</div>
                  </div>
                  <Button onClick={() => navigate(`/vacancies?search=${encodeURIComponent(c.name)}`)} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl">Вакансии компании</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card rounded-3xl border border-border"><p className="text-muted-foreground font-bold">Компании пока не зарегистрированы</p></div>
        )}
      </main>
      <Footer />
    </div>
  );
}
