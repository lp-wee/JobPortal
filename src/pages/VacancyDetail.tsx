import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { getVacancy, createApplication, getApplicationForVacancy } from '@/lib/api';
import { formatSalary, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { Vacancy } from '@/lib/types';
import { MapPin, Briefcase, Users, Clock, ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VacancyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getVacancy(id).then(v => {
      setVacancy(v);
      setLoading(false);
    });
    if (isAuthenticated && user && profile?.role === 'job_seeker') {
      getApplicationForVacancy(id, user.id).then(app => {
        if (app) setApplicationStatus(app.status);
      });
    }
  }, [id, isAuthenticated, user, profile]);

  const handleApply = async () => {
    if (!user || !vacancy) return;
    try {
      await createApplication(vacancy.id, user.id, coverLetter);
      setApplicationStatus('pending');
      setShowApplyForm(false);
      toast({ title: 'Отклик отправлен!', description: 'Работодатель получит ваш отклик.' });
    } catch (e: any) {
      toast({ title: 'Ошибка', description: e.message, variant: 'destructive' });
    }
  };

  if (loading) return <div className="min-h-screen flex flex-col"><Header /><div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Загрузка...</p></div><Footer /></div>;
  if (!vacancy) return <div className="min-h-screen flex flex-col"><Header /><div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Вакансия не найдена</p></div><Footer /></div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-muted-foreground"><ArrowLeft className="w-4 h-4 mr-2" /> Назад</Button>
        <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-card">
          <CardContent className="p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2">{vacancy.title}</h1>
                <p className="text-lg font-bold text-primary">{vacancy.company_name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-foreground">{formatSalary(vacancy.salary_min, vacancy.salary_max)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mb-8">
              {vacancy.location && <span className="flex items-center gap-1 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-full font-bold"><MapPin className="w-3 h-3" />{vacancy.location}</span>}
              <span className="flex items-center gap-1 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-full font-bold"><Briefcase className="w-3 h-3" />{EMPLOYMENT_TYPES[vacancy.employment_type]}</span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-full font-bold"><Clock className="w-3 h-3" />{EXPERIENCE_LEVELS[vacancy.experience_level]}</span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-full font-bold"><Users className="w-3 h-3" />{vacancy.applications_count || 0} откликов</span>
            </div>
            <div className="prose max-w-none mb-8">
              <h3 className="text-lg font-black text-foreground mb-3">Описание</h3>
              <p className="text-muted-foreground whitespace-pre-line">{vacancy.description}</p>
            </div>
            {vacancy.skills_required.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-black text-foreground mb-3">Навыки</h3>
                <div className="flex flex-wrap gap-2">
                  {vacancy.skills_required.map(s => <span key={s} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">{s}</span>)}
                </div>
              </div>
            )}
            {isAuthenticated && profile?.role === 'job_seeker' && (
              <div className="pt-6 border-t border-border">
                {applicationStatus ? (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="font-bold text-foreground">Статус отклика:</span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${APPLICATION_STATUS_COLORS[applicationStatus]}`}>{APPLICATION_STATUS_LABELS[applicationStatus]}</span>
                  </div>
                ) : showApplyForm ? (
                  <div className="space-y-4">
                    <Textarea placeholder="Сопроводительное письмо (необязательно)" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} className="rounded-xl" rows={4} />
                    <div className="flex gap-3">
                      <Button onClick={handleApply} className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl"><Send className="w-4 h-4 mr-2" />Отправить отклик</Button>
                      <Button variant="outline" onClick={() => setShowApplyForm(false)} className="rounded-xl">Отмена</Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => setShowApplyForm(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl h-14 px-10 text-lg"><Send className="w-5 h-5 mr-2" />Откликнуться</Button>
                )}
              </div>
            )}
            {!isAuthenticated && (
              <div className="pt-6 border-t border-border">
                <Button onClick={() => navigate('/login')} className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl h-14 px-10 text-lg">Войдите, чтобы откликнуться</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
