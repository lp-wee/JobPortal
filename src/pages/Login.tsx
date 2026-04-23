import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, Loader2, Briefcase } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const profile = await login(email, password);
      navigate(profile.role === 'employer' ? '/employer' : profile.role === 'admin' ? '/admin' : '/cabinet');
    } catch {}
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="border-none shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="text-center bg-card pt-10 pb-4">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
                  <Briefcase className="w-9 h-9" />
                </div>
              </div>
              <CardTitle className="text-3xl font-black text-foreground tracking-tight">Вход в JobPortal</CardTitle>
              <CardDescription className="text-muted-foreground mt-3 font-medium px-6">Роль определяется автоматически по вашему аккаунту</CardDescription>
            </CardHeader>
            <CardContent className="bg-card px-8 pb-10 pt-6">
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm flex gap-3 border border-destructive/20 items-center">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /><span className="font-semibold">{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-foreground ml-1">Электронная почта</Label>
                  <Input id="email" type="email" placeholder="example@mail.uz" className="h-14 rounded-xl px-5 text-lg" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-bold text-foreground ml-1">Пароль</Label>
                  <Input id="password" type="password" placeholder="••••••••" className="h-14 rounded-xl px-5 text-lg" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
                </div>
                <Button type="submit" className="w-full h-14 text-xl font-black bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'ВОЙТИ'}
                </Button>
              </form>
              <p className="text-center text-muted-foreground font-medium mt-8 pt-6 border-t border-border">Нет аккаунта? <Link to="/register" className="text-primary font-black hover:underline">Зарегистрироваться</Link></p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
