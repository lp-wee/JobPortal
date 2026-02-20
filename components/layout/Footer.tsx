'use client'

import Link from 'next/link'
import { ROUTES } from '@/lib/utils/constants'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-100 py-6">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-8">
            <Link href={ROUTES.HOME} className="flex items-center gap-2 group">
              <div className="w-5 h-5 rounded bg-primary flex items-center justify-center text-white text-[8px] font-black transition-transform group-hover:scale-110">
                JP
              </div>
              <span className="font-black text-xs tracking-tighter text-gray-900 uppercase">JobPortal</span>
            </Link>
            <nav className="flex gap-6">
              <Link href={ROUTES.VACANCIES} className="text-[10px] font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest">Вакансии</Link>
              <Link href={ROUTES.VACANCIES} className="text-[10px] font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest">Компании</Link>
              <Link href="#" className="text-[10px] font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest">Помощь</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex gap-4">
              <Link href="#" className="text-gray-300 hover:text-primary transition-colors text-[9px] font-black uppercase tracking-tighter">VKontakte</Link>
              <Link href="#" className="text-gray-300 hover:text-primary transition-colors text-[9px] font-black uppercase tracking-tighter">Telegram</Link>
            </div>
            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">
              © {currentYear} • Все права защищены
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
