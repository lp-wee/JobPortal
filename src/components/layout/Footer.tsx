import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-6">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-5 h-5 rounded bg-primary flex items-center justify-center text-primary-foreground text-[8px] font-black">JP</div>
              <span className="font-black text-xs tracking-tighter text-foreground uppercase">JobPortal</span>
            </Link>
            <nav className="flex gap-6">
              <Link to="/vacancies" className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Вакансии</Link>
              <Link to="/companies" className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Компании</Link>
              <Link to="/services" className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Услуги</Link>
            </nav>
          </div>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">© {new Date().getFullYear()} JobPortal • Все права защищены</p>
        </div>
      </div>
    </footer>
  );
}
