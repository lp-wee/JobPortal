import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getApplications, updateApplicationStatus, getProfile, getResumesByApplicant, getResumeDownloadUrl } from '@/lib/api';
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/lib/constants';
import { Application, ApplicationStatus, Profile, Resume } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { User, FileText, Download, CheckCircle, XCircle, Loader2, BadgeCheck } from 'lucide-react';

export default function EmployerApplications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewProfile, setViewProfile] = useState<Profile | null>(null);
  const [viewResumes, setViewResumes] = useState<Resume[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  const load = async () => { if (user) setApplications(await getApplications({ employer_user_id: user.id })); };
  useEffect(() => { load(); }, [user]);

  const changeStatus = async (id: string, status: ApplicationStatus, app: Application) => {
    await updateApplicationStatus(id, status);
    await load();
    toast({ title: `Статус изменён на: ${APPLICATION_STATUS_LABELS[status]}` });
    navigate('/employer/messages', { state: { contactUserId: app.user_id, vacancyId: app.vacancy_id } });
  };

  const openProfile = async (userId: string) => {
    setProfileLoading(true);
    setViewProfile(null);
    setViewResumes([]);
    try {
      const [p, r] = await Promise.all([getProfile(userId), getResumesByApplicant(userId)]);
      setViewProfile(p);
      setViewResumes(r);
    } catch { toast({ title: 'Не удалось загрузить профиль', variant: 'destructive' }); }
    setProfileLoading(false);
  };

  const downloadResume = async (resume: Resume) => {
    if (!resume.file_url) return;
    try {
      const url = await getResumeDownloadUrl(resume.file_url);
      window.open(url, '_blank');
    } catch { toast({ title: 'Ошибка загрузки файла', variant: 'destructive' }); }
  };

  const verificationLabels: Record<string, string> = { none: 'Не верифицирован', pending: 'На проверке', approved: 'Верифицирован', rejected: 'Отклонён' };
  const verificationColors: Record<string, string> = { none: 'text-muted-foreground', pending: 'text-yellow-600', approved: 'text-green-600', rejected: 'text-red-600' };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-foreground">Отклики кандидатов</h1>
      {applications.length === 0 ? (
        <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground">Откликов пока нет</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {applications.map(app => (
            <Card key={app.id} className="border-none shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <button onClick={() => openProfile(app.user_id)} className="font-bold text-primary hover:underline flex items-center gap-1">
                      <User className="w-4 h-4" /> {app.first_name} {app.last_name}
                    </button>
                    <p className="text-sm text-muted-foreground">Вакансия: {app.vacancy_title}</p>
                    {app.cover_letter && <p className="text-sm text-muted-foreground mt-2 italic">«{app.cover_letter}»</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${APPLICATION_STATUS_COLORS[app.status]}`}>{APPLICATION_STATUS_LABELS[app.status]}</span>
                    <div className="flex gap-1 flex-wrap">
                      {app.status !== 'reviewing' && <Button size="sm" variant="outline" className="rounded-lg text-xs" onClick={() => changeStatus(app.id, 'reviewing', app)}>Просмотрен</Button>}
                      {app.status !== 'accepted' && <Button size="sm" className="rounded-lg text-xs bg-green-600 hover:bg-green-700 text-white" onClick={() => changeStatus(app.id, 'accepted', app)}>Принять</Button>}
                      {app.status !== 'rejected' && <Button size="sm" variant="destructive" className="rounded-lg text-xs" onClick={() => changeStatus(app.id, 'rejected', app)}>Отклонить</Button>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!viewProfile || profileLoading} onOpenChange={() => { setViewProfile(null); setProfileLoading(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Профиль кандидата</DialogTitle></DialogHeader>
          {profileLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : viewProfile ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {viewProfile.first_name[0]}{viewProfile.last_name[0]}
                </div>
                <div>
                  <p className="font-bold text-lg text-foreground flex items-center gap-1">
                    {viewProfile.first_name} {viewProfile.last_name}
                    {viewProfile.is_verified && <BadgeCheck className="w-5 h-5 text-green-600" />}
                  </p>
                  <p className={`text-sm ${verificationColors[viewProfile.verification_status]}`}>
                    {verificationLabels[viewProfile.verification_status]}
                  </p>
                </div>
              </div>
              {viewProfile.bio && <p className="text-sm text-muted-foreground">{viewProfile.bio}</p>}
              {viewProfile.phone && <p className="text-sm text-foreground">📱 {viewProfile.phone}</p>}

              {viewResumes.length > 0 && (
                <div>
                  <h4 className="font-bold text-foreground mb-2 flex items-center gap-1"><FileText className="w-4 h-4" /> Резюме</h4>
                  <div className="space-y-2">
                    {viewResumes.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                        <span className="text-sm font-medium">{r.title}</span>
                        {r.file_url && (
                          <Button variant="ghost" size="sm" onClick={() => downloadResume(r)}><Download className="w-4 h-4" /></Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
