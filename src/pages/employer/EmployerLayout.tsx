import { useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Briefcase, Send, MessageSquare, Building2, Plus, LayoutDashboard } from 'lucide-react';

const navItems = [
  { label: 'Обзор', href: '/employer', icon: LayoutDashboard },
  { label: 'Мои вакансии', href: '/employer/vacancies', icon: Briefcase },
  { label: 'Отклики', href: '/employer/applications', icon: Send },
  { label: 'Сообщения', href: '/employer/messages', icon: MessageSquare },
  { label: 'Компания', href: '/employer/company', icon: Building2 },
];

export default function EmployerLayout() {
  const { profile, isAuthenticated, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isInitialized && (!isAuthenticated || !profile || profile.role !== 'employer')) navigate('/login');
  }, [isInitialized, isAuthenticated, profile]);

  if (!isInitialized || !profile) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 container max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <nav className="bg-card rounded-2xl border border-border p-4 space-y-1 flex lg:flex-col flex-row overflow-x-auto lg:overflow-visible">
            {navItems.map(item => {
              const active = location.pathname === item.href;
              return (
                <Link key={item.href} to={item.href}>
                  <Button variant={active ? 'default' : 'ghost'} className={`w-full justify-start gap-2 rounded-xl font-bold text-sm whitespace-nowrap ${active ? '' : 'text-muted-foreground'}`}>
                    <item.icon className="w-4 h-4" />{item.label}
                  </Button>
                </Link>
              );
            })}
            <Link to="/employer/vacancy/new">
              <Button className="w-full justify-start gap-2 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground mt-4"><Plus className="w-4 h-4" />Новая вакансия</Button>
            </Link>
          </nav>
        </aside>
        <main className="flex-1 min-w-0"><Outlet /></main>
      </div>
      <Footer />
    </div>
  );
}
