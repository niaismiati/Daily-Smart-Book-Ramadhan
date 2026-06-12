import {
  LayoutDashboard,
  BookMarked,
  CheckSquare,
  Clock,
  GraduationCap,
  Trophy,
  BarChart3,
  User,
  Users,
  Activity,
  Video,
  FileText,
  LogOut,
  Moon,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

export type Page =
  | 'login'
  | 'dashboard'
  | 'journal'
  | 'tracker'
  | 'prayer'
  | 'doa'
  | 'materi'
  | 'quiz'
  | 'laporan'
  | 'profil'
  | 'kelola-siswa'
  | 'monitoring-jurnal'
  | 'monitoring-tracker'
  | 'kelola-materi'
  | 'kelola-khotbah'
  | 'kelola-doa'
  | 'kelola-quiz'
  | 'laporan-guru';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user, isSiswa, isGuru, logout } = useAuth();
  const { t } = useLanguage();

  const studentMenus = [
    { id: 'dashboard' as Page, label: t.dashboard, icon: LayoutDashboard },
    { id: 'journal' as Page, label: t.journalMenu, icon: BookMarked },
    { id: 'tracker' as Page, label: t.trackerMenu, icon: CheckSquare },
    { id: 'doa' as Page, label: t.doaMenu, icon: BookOpen },
    { id: 'prayer' as Page, label: t.prayerMenu, icon: Clock },
    { id: 'materi' as Page, label: t.materialMenu, icon: GraduationCap },
    { id: 'quiz' as Page, label: t.quizMenu, icon: Trophy },
    { id: 'laporan' as Page, label: t.reportMenu, icon: BarChart3 },
    { id: 'profil' as Page, label: t.profileMenu, icon: User },
  ];

  const teacherMenus = [
    { id: 'dashboard' as Page, label: t.dashboard, icon: LayoutDashboard },
    { id: 'kelola-siswa' as Page, label: t.studentsMenu, icon: Users },
    { id: 'monitoring-jurnal' as Page, label: t.journalMonitorMenu, icon: BookMarked },
    { id: 'monitoring-tracker' as Page, label: t.trackerMonitorMenu, icon: Activity },
    { id: 'kelola-khotbah' as Page, label: 'Sermon Topics', icon: Video },
    { id: 'kelola-doa' as Page, label: t.doaMenu, icon: BookOpen },
    { id: 'kelola-materi' as Page, label: t.materialManageMenu, icon: Video },
    { id: 'kelola-quiz' as Page, label: t.quizManageMenu, icon: Trophy },
    { id: 'laporan-guru' as Page, label: t.reportMenu, icon: FileText },
    { id: 'profil' as Page, label: t.profileMenu, icon: User },
  ];

  const menus = isSiswa ? studentMenus : teacherMenus;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col shadow-xl z-50">
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <Moon className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">Daily Smart Book</h3>
            <p className="text-xs text-muted-foreground">Ramadan 1447 H</p>
          </div>
        </div>
      </div>

      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">{user?.name ?? 'User'}</p>
            <p className="text-xs text-muted-foreground">
              {isSiswa ? `Kelas ${user?.class ?? '-'}` : 'Guru'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const isActive = currentPage === menu.id;
          return (
            <button
              key={menu.id}
              onClick={() => onNavigate(menu.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{menu.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">{t.logout}</span>
        </button>
      </div>
    </aside>
  );
}
