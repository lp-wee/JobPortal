import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, Loader2, User, Building2 } from 'lucide-react';
import { UserRole } from '@/lib/types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '', password: '', confirm_password: '', first_name: '', last_name: '',
    company_name: '', phone: '', role: 'job_seeker' as UserRole,
  });
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (passwordError) setPasswordError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) { setPasswordError('Пароли не совпадают'); return; }
    if (formData.password.length < 6) { setPasswordError('Минимум 6 символов'); return; }
    try {
      const profile = await register(formData.email, formData.password, formData.first_name, formData.last_name, formData.role, formData.phone, formData.company_name);
      navigate(profile.role === 'employer' ? '/employer' : '/cabinet');
    } catch {}
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="border-none shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="text-center bg-card pt-10 pb-4">
              <CardTitle className="text-3xl font-black text-foreground tracking-tight">Регистрация</CardTitle>
              <CardDescription className="text-muted-foreground mt-2 font-medium">Создайте аккаунт на JobPortal</CardDescription>
            </CardHeader>
            <CardContent className="bg-card px-8 pb-10 pt-6">
              {(error || passwordError) && (
                <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm flex gap-3 items-center">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /><span className="font-semibold">{passwordError || error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground ml-1">Я регистрируюсь как</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setFormData(p => ({ ...p, role: 'job_seeker' }))} className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-bold text-sm ${formData.role === 'job_seeker' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                      <User className="w-5 h-5" /> Соискатель
                    </button>
                    <button type="button" onClick={() => setFormData(p => ({ ...p, role: 'employer' }))} className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-bold text-sm ${formData.role === 'employer' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                      <Building2 className="w-5 h-5" /> Работодатель
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label className="text-sm font-bold ml-1">Имя</Label><Input name="first_name" placeholder="Имя" className="h-12 rounded-xl" value={formData.first_name} onChange={handleChange} required disabled={isLoading} /></div>
                  <div className="space-y-2"><Label className="text-sm font-bold ml-1">Фамилия</Label><Input name="last_name" placeholder="Фамилия" className="h-12 rounded-xl" value={formData.last_name} onChange={handleChange} required disabled={isLoading} /></div>
                </div>
                {formData.role === 'employer' && (
                  <div className="space-y-2"><Label className="text-sm font-bold ml-1">Название компании</Label><Input name="company_name" placeholder="ООО «Компания»" className="h-12 rounded-xl" value={formData.company_name} onChange={handleChange} required disabled={isLoading} /></div>
                )}
                <div className="space-y-2"><Label className="text-sm font-bold ml-1">Email</Label><Input name="email" type="email" placeholder="example@mail.uz" className="h-12 rounded-xl" value={formData.email} onChange={handleChange} required disabled={isLoading} /></div>
                <div className="space-y-2"><Label className="text-sm font-bold ml-1">Телефон</Label><Input name="phone" placeholder="+998 90 123 45 67" className="h-12 rounded-xl" value={formData.phone} onChange={handleChange} disabled={isLoading} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label className="text-sm font-bold ml-1">Пароль</Label><Input name="password" type="password" placeholder="••••••" className="h-12 rounded-xl" value={formData.password} onChange={handleChange} required disabled={isLoading} /></div>
                  <div className="space-y-2"><Label className="text-sm font-bold ml-1">Повторите</Label><Input name="confirm_password" type="password" placeholder="••••••" className="h-12 rounded-xl" value={formData.confirm_password} onChange={handleChange} required disabled={isLoading} /></div>
                </div>
                <Button type="submit" className="w-full h-14 text-xl font-black bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
                </Button>
              </form>
              <p className="text-center text-muted-foreground font-medium mt-6">Уже есть аккаунт? <Link to="/login" className="text-primary font-black hover:underline">Войти</Link></p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
