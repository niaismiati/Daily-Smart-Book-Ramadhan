import { Moon } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';

export function Header() {
  const { t } = useLanguage();
  const hijriDate = '15 Ramadan 1447 H';
  const gregorianDate = new Date().toLocaleDateString(t.dateFormat, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-card border-b border-border px-8 py-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            Assalamu'alaikum Warahmatullahi Wabarakatuh
          </h1>
          <p className="text-muted-foreground mt-1">{t.welcomeMessage}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2 text-accent font-semibold mb-1">
              <Moon className="w-5 h-5" />
              <span>{hijriDate}</span>
            </div>
            <p className="text-sm text-muted-foreground">{gregorianDate}</p>
          </div>
          <LanguageSelector variant="compact" />
        </div>
      </div>
    </header>
  );
}
