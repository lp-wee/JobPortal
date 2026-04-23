import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, X, Bell, Briefcase } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const { profile, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/'); };

  const displayName = profile?.first_name || '';
  const avatarLetter = displayName?.[0]?.toUpperCase() || '?';
  const cabinetRoute = profile?.role === 'employer' ? '/employer' : profile?.role === 'admin' ? '/admin' : '/cabinet';

  const navLinks = [
    { label: 'Вакансии', href: '/vacancies' },
    { label: 'Компании', href: '/companies' },
    { label: 'Услуги', href: '/services' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6 md:gap-8">
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground transition-transform group-hover:rotate-6">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="font-black text-lg sm:text-xl tracking-tighter text-foreground hidden sm:inline">JobPortal</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 md:gap-8">
              {navLinks.map(link => (
                <Link key={link.label} to={link.href} className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="text-muted-foreground font-bold hover:text-primary">Вход</Button>
                <Button size="sm" onClick={() => navigate('/register')} className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl px-6">Регистрация</Button>
              </>
            ) : (
              <>
                <button className="p-2 text-muted-foreground hover:text-primary transition-colors"><Bell className="w-5 h-5" /></button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 hover:bg-secondary rounded-xl px-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ring-2 ${
                        profile?.role === 'admin' ? 'bg-purple-100 text-purple-700 ring-purple-400'
                        : profile?.role === 'employer' ? 'bg-blue-100 text-blue-700 ring-blue-400'
                        : 'bg-green-100 text-green-700 ring-green-400'
                      }`}>{avatarLetter}</div>
                      <span className="hidden sm:inline text-sm font-bold text-foreground max-w-[140px] truncate">{displayName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border p-2 shadow-xl">
                    <DropdownMenuItem asChild className="rounded-xl font-bold"><Link to={cabinetRoute}>Личный кабинет</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive rounded-xl font-bold">Выйти</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            <button className="md:hidden p-2 text-muted-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card py-6 px-4 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <nav className="flex flex-col gap-4">
            {navLinks.map(link => (
              <Link key={link.label} to={link.href} className="text-lg font-black text-foreground" onClick={() => setMobileMenuOpen(false)}>{link.label}</Link>
            ))}
            <div className="h-px bg-border my-2" />
            {!isAuthenticated ? (
              <>
                <Button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} variant="outline" className="h-12 rounded-xl font-bold">Вход</Button>
                <Button onClick={() => { navigate('/register'); setMobileMenuOpen(false); }} className="h-12 rounded-xl font-black">Регистрация</Button>
              </>
            ) : (
              <>
                <Link to={cabinetRoute} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-12 rounded-xl font-bold">Личный кабинет</Button>
                </Link>
                <Button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} variant="ghost" className="h-12 rounded-xl font-bold text-destructive">Выйти</Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
