import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAdminStats, getAllProfiles, getAllVacancies, getAllApplications, toggleVacancyActive, deleteVacancy, deleteApplication, updateApplicationStatus, updateProfile, approveVerification, rejectVerification, getVerificationDocUrl, blockUser, deleteUser } from '@/lib/api';
import { formatSalary } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Pencil, Eye, EyeOff, BadgeCheck, Clock, FileText, CheckCircle, XCircle, Ban, ShieldOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Profile, Vacancy, Application, ApplicationStatus } from '@/lib/types';

export default function AdminPage() {
  const { profile, isAuthenticated, isInitialized } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({ users: 0, vacancies: 0, applications: 0, activeVacancies: 0 });
  const [users, setUsers] = useState<Profile[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', role: '' as string });
  const [verificationDocUrl, setVerificationDocUrl] = useState<string | null>(null);
  const [viewingVerification, setViewingVerification] = useState<Profile | null>(null);

  useEffect(() => {
    if (isInitialized && (!isAuthenticated || profile?.role !== 'admin')) navigate('/login');
  }, [isInitialized, isAuthenticated, profile]);

  const load = async () => {
    const [s, u, v, a] = await Promise.all([getAdminStats(), getAllProfiles(), getAllVacancies(), getAllApplications()]);
    setStats(s); setUsers(u); setVacancies(v); setApplications(a);
  };
  useEffect(() => { if (profile?.role === 'admin') load(); }, [profile]);

  if (!profile || profile.role !== 'admin') return null;

  const roleLabels: Record<string, string> = { job_seeker: 'Соискатель', employer: 'Работодатель', admin: 'Админ' };
  const statusLabels: Record<string, string> = { pending: 'Ожидает', reviewing: 'На рассмотрении', accepted: 'Принят', rejected: 'Отклонён' };
  const verificationLabels: Record<string, string> = { none: '', pending: 'На проверке', approved: 'Верифицирован', rejected: 'Отклонён' };

  const handleToggleVacancy = async (id: string, isActive: boolean) => {
    try { await toggleVacancyActive(id, !isActive); toast({ title: isActive ? 'Вакансия скрыта' : 'Вакансия активирована' }); await load(); }
    catch (e: any) { toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }); }
  };
  const handleDeleteVacancy = async (id: string) => {
    if (!confirm('Удалить вакансию?')) return;
    try { await deleteVacancy(id); toast({ title: 'Вакансия удалена' }); await load(); }
    catch (e: any) { toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }); }
  };
  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Удалить отклик?')) return;
    try { await deleteApplication(id); toast({ title: 'Отклик удалён' }); await load(); }
    catch (e: any) { toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }); }
  };
  const handleChangeStatus = async (id: string, status: ApplicationStatus) => {
    try { await updateApplicationStatus(id, status); toast({ title: 'Статус обновлён' }); await load(); }
    catch (e: any) { toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }); }
  };
  const openEditUser = (u: Profile) => { setEditUser(u); setEditForm({ first_name: u.first_name, last_name: u.last_name, role: u.role }); };
  const handleSaveUser = async () => {
    if (!editUser) return;
    try { await updateProfile(editUser.user_id, { first_name: editForm.first_name, last_name: editForm.last_name }); toast({ title: 'Профиль обновлён' }); setEditUser(null); await load(); }
    catch (e: any) { toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }); }
  };
  const handleBlockUser = async (userId: string, currentlyBlocked: boolean) => {
    try { await blockUser(userId, !currentlyBlocked); toast({ title: currentlyBlocked ? 'Пользователь разблокирован' : 'Пользователь заблокирован' }); await load(); }
    catch (e: any) { toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }); }
  };
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Удалить пользователя? Это действие необратимо!')) return;
    try { await deleteUser(userId); toast({ title: 'Пользователь удалён' }); await load(); }
    catch (e: any) { toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }); }
  };

  const openVerification = async (u: Profile) => {
    setViewingVerification(u);
    setVerificationDocUrl(null);
    if (u.verification_doc_url) {
      try { const url = await getVerificationDocUrl(u.verification_doc_url); setVerificationDocUrl(url); } catch {}
    }
  };

  const handleApprove = async (userId: string) => {
    try { await approveVerification(userId); toast({ title: 'Студент верифицирован ✅' }); setViewingVerification(null); await load(); }
    catch (e: any) { toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }); }
  };
  const handleReject = async (userId: string) => {
    try { await rejectVerification(userId); toast({ title: 'Верификация отклонена' }); setViewingVerification(null); await load(); }
    catch (e: any) { toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }); }
  };

  const pendingVerifications = users.filter(u => u.verification_status === 'pending');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-foreground mb-8">Админ-панель JobPortal</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Пользователей</p><p className="text-3xl font-bold text-foreground">{stats.users}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Вакансий</p><p className="text-3xl font-bold text-foreground">{stats.vacancies}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Активных</p><p className="text-3xl font-bold text-foreground">{stats.activeVacancies}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Откликов</p><p className="text-3xl font-bold text-foreground">{stats.applications}</p></CardContent></Card>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Пользователи ({users.length})</TabsTrigger>
            <TabsTrigger value="vacancies">Вакансии ({vacancies.length})</TabsTrigger>
            <TabsTrigger value="applications">Отклики ({applications.length})</TabsTrigger>
            <TabsTrigger value="verification" className="relative">
              Верификация
              {pendingVerifications.length > 0 && <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-yellow-500 text-white">{pendingVerifications.length}</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="space-y-2">{users.map(u => (
              <Card key={u.id} className={`border-none shadow-sm ${u.is_blocked ? 'opacity-60' : ''}`}><CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="font-bold text-foreground flex items-center gap-1">
                      {u.first_name} {u.last_name}
                      {u.is_verified && <BadgeCheck className="w-4 h-4 text-green-600" />}
                      {u.is_blocked && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Заблокирован</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">{roleLabels[u.role] || u.role}{u.company_name ? ` • ${u.company_name}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditUser(u)}><Pencil className="w-4 h-4 mr-1" />Изменить</Button>
                  {u.role !== 'admin' && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleBlockUser(u.user_id, u.is_blocked)} title={u.is_blocked ? 'Разблокировать' : 'Заблокировать'}>
                        {u.is_blocked ? <ShieldOff className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteUser(u.user_id)} className="text-destructive hover:text-destructive" title="Удалить">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent></Card>
            ))}</div>
          </TabsContent>

          <TabsContent value="vacancies">
            <div className="space-y-2">{vacancies.map(v => (
              <Card key={v.id} className="border-none shadow-sm"><CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-foreground">{v.title}</p>
                  <p className="text-sm text-muted-foreground">{v.company_name} • {v.applications_count || 0} откликов • {formatSalary(v.salary_min, v.salary_max)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${v.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{v.is_active ? 'Активна' : 'Скрыта'}</span>
                  <Button variant="outline" size="sm" onClick={() => handleToggleVacancy(v.id, v.is_active)}>{v.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteVacancy(v.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent></Card>
            ))}</div>
          </TabsContent>

          <TabsContent value="applications">
            <div className="space-y-2">{applications.map(a => (
              <Card key={a.id} className="border-none shadow-sm"><CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-foreground">{a.first_name} {a.last_name}</p>
                  <p className="text-sm text-muted-foreground">Вакансия: {a.vacancy_title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={a.status} onValueChange={(val) => handleChangeStatus(a.id, val as ApplicationStatus)}>
                    <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Ожидает</SelectItem>
                      <SelectItem value="reviewing">На рассмотрении</SelectItem>
                      <SelectItem value="accepted">Принят</SelectItem>
                      <SelectItem value="rejected">Отклонён</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteApplication(a.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent></Card>
            ))}</div>
          </TabsContent>

          <TabsContent value="verification">
            {pendingVerifications.length === 0 ? (
              <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground">Нет заявок на верификацию</p></CardContent></Card>
            ) : (
              <div className="space-y-2">{pendingVerifications.map(u => (
                <Card key={u.id} className="border-none shadow-sm"><CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-foreground flex items-center gap-1"><Clock className="w-4 h-4 text-yellow-600" /> {u.first_name} {u.last_name}</p>
                    <p className="text-sm text-muted-foreground">Загружен документ для верификации</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openVerification(u)}><FileText className="w-4 h-4 mr-1" />Просмотреть</Button>
                </CardContent></Card>
              ))}</div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Редактировать пользователя</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Имя</Label><Input value={editForm.first_name} onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))} className="mt-1" /></div>
            <div><Label>Фамилия</Label><Input value={editForm.last_name} onChange={e => setEditForm(p => ({ ...p, last_name: e.target.value }))} className="mt-1" /></div>
            <div><Label>Роль</Label><p className="text-sm text-muted-foreground mt-1">{roleLabels[editForm.role] || editForm.role}</p></div>
            <Button onClick={handleSaveUser} className="w-full">Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingVerification} onOpenChange={() => setViewingVerification(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Верификация студента</DialogTitle></DialogHeader>
          {viewingVerification && (
            <div className="space-y-4">
              <p className="font-bold text-foreground">{viewingVerification.first_name} {viewingVerification.last_name}</p>
              {verificationDocUrl ? (
                <div className="rounded-xl overflow-hidden border">
                  {verificationDocUrl.match(/\.pdf/i) ? (
                    <a href={verificationDocUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-4 text-primary hover:underline">
                      <FileText className="w-5 h-5" /> Открыть PDF документ
                    </a>
                  ) : (
                    <img src={verificationDocUrl} alt="Документ верификации" className="w-full max-h-96 object-contain" />
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Загрузка документа...</p>
              )}
              <div className="flex gap-3">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl" onClick={() => handleApprove(viewingVerification.user_id)}>
                  <CheckCircle className="w-4 h-4 mr-2" /> Подтвердить
                </Button>
                <Button variant="destructive" className="flex-1 rounded-xl" onClick={() => handleReject(viewingVerification.user_id)}>
                  <XCircle className="w-4 h-4 mr-2" /> Отклонить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
