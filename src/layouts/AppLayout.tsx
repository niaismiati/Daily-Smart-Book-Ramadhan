import { useState, type ReactNode } from 'react';
import { Sidebar, type Page } from './Sidebar';
import { Header } from './Header';
import { useLanguage } from '../i18n/LanguageContext';

interface AppLayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: ReactNode;
}

export function AppLayout({ currentPage, onNavigate, children }: AppLayoutProps) {
  const { isRTL } = useLanguage();

  return (
    <div className={`min-h-screen bg-background font-sans ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-pattern-layout" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50 0 L100 50 L50 100 L0 50 Z M25 25 L50 50 L25 75 L0 50 Z M75 25 L100 50 L75 75 L50 50 Z" fill="currentColor" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern-layout)" />
        </svg>
      </div>

      <div className="relative flex">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />

        <main className="flex-1 ml-64">
          <Header />

          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
