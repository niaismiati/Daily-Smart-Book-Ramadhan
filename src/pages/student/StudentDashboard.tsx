import { useEffect, useState, useCallback, useRef } from 'react';
import { CheckCircle, BookOpen, Award, PenTool, Sparkles, Moon, Clock, Target, BarChart3 } from 'lucide-react';
import * as dashboardApi from '../../api/dashboard';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

interface DashboardData {
  today_prayer: number;
  week_percentage: number;
  streak: number;
  total_points: number;
  sholat_points: number;
  materi_points: number;
  quiz_points: number;
  jurnal_points: number;
  total_journals: number;
  total_materials_read: number;
  total_quiz_taken: number;
  avg_quiz_score: number;
  last_quiz_score: number | null;
  quiz_available: number;
  sholat_subuh: number;
  sholat_dzuhur: number;
  sholat_ashar: number;
  sholat_maghrib: number;
  sholat_isya: number;
  friday_attendance: number;
  total_doa_learned: number;
  total_doa_materials: number;
  weekly_progress: number[];
  reading_points: number;
  recent_materials: any[];
  prayer_schedule: any;
  notifications: any[];
}

export function StudentDashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      setLoading(true);
      setError('');
      const res = await dashboardApi.getStudentDashboard();
      setStats(res);
    } catch {
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-secondary/60 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-secondary/40 rounded-2xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-secondary/40 rounded-3xl animate-pulse" />
          <div className="h-64 bg-secondary/40 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  const dateLocale = language === 'id' ? 'id-ID' : language === 'en' ? 'en-US' : 'ar-SA';
  const todayDate = new Date().toLocaleDateString(dateLocale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const prayerSchedule = stats?.prayer_schedule;
  const nextPrayer = prayerSchedule ? getNextPrayer(prayerSchedule) : null;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {/* Greeting */}
      <div className="bg-gradient-to-br from-primary via-primary/80 to-accent rounded-3xl p-6 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">{t.welcome}</p>
            <h1 className="text-2xl font-bold mt-1">{user?.name}</h1>
            <p className="text-white/80 text-sm mt-1">{todayDate}</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-primary mb-2"><CheckCircle className="w-5 h-5" /> <span className="text-sm font-semibold text-foreground">{t.fajrPrayer?.replace('Shalat ', '') || 'Sholat'}</span></div>
          <p className="text-2xl font-bold text-foreground">{stats?.today_prayer ?? 0}<span className="text-sm text-muted-foreground font-normal">/5</span></p>
          <p className="text-xs text-muted-foreground mt-1">{stats?.week_percentage ?? 0}% {t.consistency}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-accent mb-2"><BookOpen className="w-5 h-5" /> <span className="text-sm font-semibold text-foreground">{t.materialMenu}</span></div>
          <p className="text-2xl font-bold text-accent">{stats?.total_materials_read || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">+{stats?.reading_points || 0} {t.total}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-primary mb-2"><Award className="w-5 h-5" /> <span className="text-sm font-semibold text-foreground">{t.quizMenu}</span></div>
          <p className="text-2xl font-bold text-foreground">{stats?.total_quiz_taken || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">{t.avgScore}: {stats?.avg_quiz_score || '-'}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-accent mb-2"><PenTool className="w-5 h-5" /> <span className="text-sm font-semibold text-foreground">{t.journalMenu}</span></div>
          <p className="text-2xl font-bold text-accent">{stats?.total_journals || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">{t.totalEntries}</p>
        </div>
      </div>

      {/* Main Grid: Streak + Points + Prayer Schedule + Quiz */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ramadan Streak */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" /> {t.worshipStreak}
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
              {stats?.streak || 0}
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats?.streak || 0} {t.days}</p>
              <p className="text-muted-foreground text-sm">{t.consistency}: {stats?.week_percentage ?? 0}%</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }, (_, i) => (
              <div key={i} className={`h-2 rounded-full ${i < (stats?.streak || 0) ? 'bg-primary' : 'bg-secondary'}`} />
            ))}
          </div>
        </div>

        {/* Total Points */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" /> {t.total}
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
              {stats?.total_points || 0}
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats?.total_points || 0} {t.total}</p>
              <p className="text-muted-foreground text-sm">{t.achievements}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {[
              { label: t.fajrPrayer?.replace('Shalat ', '') || 'Sholat', points: stats?.sholat_points || 0 },
              { label: t.materialMenu, points: stats?.reading_points || 0 },
              { label: t.quizMenu, points: stats?.quiz_points || 0 },
              { label: t.journalMenu, points: stats?.jurnal_points || 0 },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold text-foreground">+{item.points}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prayer Schedule Today */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> {t.prayerSchedule}
          </h3>
          {prayerSchedule ? (
            <div className="space-y-2">
              {['imsak', 'subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'].map((p) => {
                const label = t[p as keyof typeof t] as string || p;
                const time = prayerSchedule[p];
                const isNext = nextPrayer === p;
                return (
                  <div key={p} className={`flex items-center justify-between p-2 rounded-xl ${isNext ? 'bg-primary/10 border border-primary/20' : ''}`}>
                    <span className={`text-sm ${isNext ? 'font-bold text-primary' : 'text-foreground'}`}>{label}</span>
                    <span className={`text-sm font-semibold ${isNext ? 'text-primary' : 'text-muted-foreground'}`}>{time || '-'}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-6">{t.noData}</p>
          )}
        </div>
      </div>

      {/* Recent Materials + Quiz Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" /> {t.materialMenu} {t.reportMenu === 'Laporan Saya' ? 'Terbaru' : 'Terbaru'}
          </h3>
          {stats?.recent_materials?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_materials.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.category?.name || ''}</p>
                  </div>
                  <span className="text-xs text-primary font-semibold">{t.readMore}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-6">{t.noData}</p>
          )}
        </div>

        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" /> {t.quizTitle}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-primary/5 p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-primary">{stats?.total_quiz_taken || 0}</p>
              <p className="text-xs text-muted-foreground">{t.quizCompleted}</p>
            </div>
            <div className="bg-accent/5 p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-accent">{stats?.avg_quiz_score || 0}</p>
              <p className="text-xs text-muted-foreground">{t.avgScore}</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
            <span className="text-sm text-foreground">{t.quizMenu} {t.availableStatus === 'Tersedia' ? 'Tersedia' : t.availableStatus}</span>
            <span className="font-bold text-primary">{stats?.quiz_available || 0}</span>
          </div>
          {stats?.last_quiz_score != null && (
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl mt-2">
              <span className="text-sm text-foreground">{t.yourScore}</span>
              <span className="font-bold text-foreground">{stats.last_quiz_score}</span>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" /> {t.weeklyProgress}
        </h3>
        <div className="flex items-end justify-around gap-3 h-48 px-2">
          {['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'].map((week, i) => {
            const pct = Math.min(stats?.weekly_progress?.[i] ?? 0, 100);
            return (
              <div key={week} className="flex-1 flex flex-col items-center gap-2 max-w-[80px]">
                <span className="text-sm font-bold text-foreground">{pct}%</span>
                <div className="w-full bg-secondary rounded-xl relative flex-1 min-h-[40px]">
                  <div
                    className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-primary/60 rounded-xl transition-all duration-700"
                    style={{ height: `${Math.max(pct, 2)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground text-center">{week}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getNextPrayer(schedule: any): string | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const prayers = [
    { key: 'subuh', name: 'subuh' },
    { key: 'dzuhur', name: 'dzuhur' },
    { key: 'ashar', name: 'ashar' },
    { key: 'maghrib', name: 'maghrib' },
    { key: 'isya', name: 'isya' },
  ];
  for (const p of prayers) {
    if (schedule[p.key]) {
      const [h, m] = schedule[p.key].split(':').map(Number);
      const prayerMinutes = h * 60 + m;
      if (prayerMinutes > currentMinutes) return p.key;
    }
  }
  return 'subuh';
}
