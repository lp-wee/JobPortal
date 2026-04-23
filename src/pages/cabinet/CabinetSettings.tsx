import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { updateProfile, uploadVerificationDoc, submitVerification } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, BadgeCheck, Clock, XCircle, CheckCircle } from 'lucide-react';

export default function CabinetSettings() {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
  });

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, form);
      await refreshProfile();
      toast({ title: 'Профиль сохранён' });
    } catch (e: any) { toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };

  const handleVerificationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 10 * 1024 * 1024) { toast({ title: 'Файл слишком большой (макс. 10 МБ)', variant: 'destructive' }); return; }
    setUploading(true);
    try {
      const path = await uploadVerificationDoc(user.id, file);
      await submitVerification(user.id, path);
      await refreshProfile();
      toast({ title: 'Документ загружен и отправлен на проверку' });
    } catch (e: any) { toast({ title: 'Ошибка загрузки', description: e.message, variant: 'destructive' }); }
    setUploading(false);
  };

  const verificationStatus = profile?.verification_status || 'none';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-foreground">Настройки профиля</h1>
      <Card>
        <CardHeader><CardTitle>Личные данные</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Имя</Label><Input value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} className="rounded-xl mt-1" /></div>
            <div><Label>Фамилия</Label><Input value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} className="rounded-xl mt-1" /></div>
          </div>
          <div><Label>Телефон</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="rounded-xl mt-1" /></div>
          <div><Label>О себе</Label><Input value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} className="rounded-xl mt-1" placeholder="Расскажите о себе..." /></div>
          <Button onClick={handleSave} disabled={saving} className="rounded-xl">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Сохранить
          </Button>
        </CardContent>
      </Card>

      {profile?.role === 'job_seeker' && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2">Верификация студента <BadgeCheck className="w-5 h-5 text-primary" /></CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Загрузите фото студенческого билета или справку из учебного заведения для верификации. Верифицированные студенты получают специальный значок в профиле.
            </p>

            {verificationStatus === 'none' && (
              <div>
                <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleVerificationUpload} />
                <Button variant="outline" className="rounded-xl" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  Загрузить документ
                </Button>
              </div>
            )}

            {verificationStatus === 'pending' && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                <Clock className="w-5 h-5" />
                <span className="font-semibold text-sm">Документ на проверке. Ожидайте подтверждения от администратора.</span>
              </div>
            )}

            {verificationStatus === 'approved' && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold text-sm">Вы верифицированный студент! ✅</span>
              </div>
            )}

            {verificationStatus === 'rejected' && (
              <div>
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400 mb-3">
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold text-sm">Документ отклонён. Загрузите другой документ.</span>
                </div>
                <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleVerificationUpload} />
                <Button variant="outline" className="rounded-xl" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  Загрузить новый документ
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
