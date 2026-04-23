import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Building2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateProfile, getCompanyByUserId, upsertCompany } from '@/lib/api';

export default function EmployerCompany() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    description: '',
    location: '',
    industry: '',
    website: '',
  });
  const email = user?.email ?? '';

  useEffect(() => {
    if (!profile || !user) return;
    let cancelled = false;
    (async () => {
      const company = await getCompanyByUserId(user.id);
      if (cancelled) return;
      setForm({
        company_name: profile.company_name || company?.name || '',
        contact_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        phone: profile.phone || '',
        description: company?.description || '',
        location: company?.location || '',
        industry: company?.industry || '',
        website: company?.website || '',
      });
    })();
    return () => { cancelled = true; };
  }, [profile, user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const parts = form.contact_name.trim().split(/\s+/);
      const first_name = parts[0] || '';
      const last_name = parts.slice(1).join(' ');
      await updateProfile(user.id, {
        first_name,
        last_name,
        phone: form.phone,
        company_name: form.company_name,
      });
      if (form.company_name.trim()) {
        await upsertCompany(user.id, {
          name: form.company_name.trim(),
          description: form.description,
          location: form.location,
          industry: form.industry,
          website: form.website,
        });
      }
      await refreshProfile?.();
      toast({ title: 'Профиль компании сохранён' });
    } catch (e: any) {
      toast({ title: 'Ошибка', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-foreground">Профиль компании</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />Информация о компании
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Название компании</Label>
            <Input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Контактное лицо</Label>
            <Input value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={email} disabled className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Телефон</Label>
            <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Сфера деятельности</Label>
            <Input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Локация</Label>
            <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Сайт</Label>
            <Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://" className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Описание компании</Label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="rounded-xl mt-1" />
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving} className="rounded-xl">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
