import { useEffect, useState, useCallback } from 'react';
import { Users, Activity, Star, BookOpen, AlertTriangle, TrendingUp, BarChart3, FileText, CheckCircle, Target, Brain, Bookmark, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import * as teacherApi from '../../api/teacher';
import { useLanguage } from '../../i18n/LanguageContext';
import type { TeacherDashboardStats, StudentRecap, DoaRecap } from '../../types';

const COLORS = ['#16a34a', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

function StatCard({ icon: Icon, label, value, subtext, color, loading }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string | number; subtext: string;
  color: 'emerald' | 'amber' | 'red' | 'blue' | 'purple' | 'indigo' | 'pink';
  loading?: boolean;
}) {
  const colorClasses = {
    emerald: 'bg-primary/10 text-primary',
    amber: 'bg-accent/10 text-accent',
    red: 'bg-destructive/10 text-destructive',
    blue: 'bg-blue-500/10 text-blue-500',
    purple: 'bg-purple-500/10 text-purple-500',
    indigo: 'bg-indigo-500/10 text-indigo-500',
    pink: 'bg-pink-500/10 text-pink-500',
  };
  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-7 w-20 bg-secondary/60 rounded-lg" />
          <div className="h-4 w-32 bg-secondary/40 rounded-lg" />
          <div className="h-3 w-24 bg-secondary/30 rounded-lg" />
        </div>
      ) : (
        <>
          <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
          <p className="font-semibold text-foreground text-sm">{label}</p>
          <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        </>
      )}
    </div>
  );
}

function StatRow({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 text-${color}`} />
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <span className="text-xl font-bold text-foreground">{value}</span>
    </div>
  );
}

export function TeacherDashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [recap, setRecap] = useState<StudentRecap[]>([]);
  const [doaRecap, setDoaRecap] = useState<DoaRecap[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [filterClass, setFilterClass] = useState('');
  const [tab, setTab] = useState<'shalat' | 'doa'>('shalat');
  const [chartTab, setChartTab] = useState<'ibadah' | 'kelas'>('ibadah');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, recapRes, doaRes, classesRes] = await Promise.all([
        teacherApi.getDashboardStats(),
        teacherApi.getPrayerRecap(filterClass || undefined),
        teacherApi.getDoaRecap(filterClass || undefined),
        teacherApi.getClasses(),
      ]);
      setStats(statsRes.stats);
      setRecap(recapRes.recap);
      setDoaRecap(doaRes.recap);
      setClasses(classesRes.classes);
    } catch {
      setError('Gagal memuat data dashboard. Pastikan backend berjalan.');
    } finally {
      setLoading(false);
    }
  }, [filterClass]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 bg-secondary/40 rounded-3xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-secondary/40 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-semibold">{error || t.noData}</p>
        </div>
      </div>
    );
  }

  const weeklyChartData = stats.weekly_active?.map((count: number, i: number) => ({
    day: [t.sunday, t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday][i] || `H${i + 1}`,
    aktif: count,
  })) || [];

  const classChartData = stats.class_stats || [];

  const sholatChartData = [
    { name: 'Subuh', jumlah: stats.sholat_subuh },
    { name: 'Dzuhur', jumlah: stats.sholat_dzuhur },
    { name: 'Ashar', jumlah: stats.sholat_ashar },
    { name: 'Maghrib', jumlah: stats.sholat_maghrib },
    { name: 'Isya', jumlah: stats.sholat_isya },
  ];

  const berjamaahChartData = [
    { name: 'Subuh', jumlah: stats.berjamaah_subuh },
    { name: 'Dzuhur', jumlah: stats.berjamaah_dzuhur },
    { name: 'Ashar', jumlah: stats.berjamaah_ashar },
    { name: 'Maghrib', jumlah: stats.berjamaah_maghrib },
    { name: 'Isya', jumlah: stats.berjamaah_isya },
  ];

  const quizPieData = Object.entries(stats.quiz_distribution || {}).map(([key, value]) => ({
    name: key,
    value,
  }));

  const weeklyClassData = stats.weekly_class_progress || [];

  const totalSiswa = stats.total_students;
  const avgSholat = stats.avg_prayer_percentage;
  const doneSholat = stats.total_sholat;
  const totalSlots = stats.total_slots;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">{t.dashboard} {t.teacher}</h2>
          <p className="text-muted-foreground mt-1">{t.studentActivity}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-3 bg-card border border-border rounded-xl hover:bg-secondary transition-all disabled:opacity-50"
          >
            <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t.allClasses || 'Semua Kelas'}</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Ringkasan Siswa */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> {t.totalStudents}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label={t.totalStudents} value={totalSiswa} subtext={t.active} color="emerald" />
          <StatCard icon={CheckCircle} label={t.activeStudent} value={stats.today_prayers > 0 ? stats.today_prayers : 0} subtext={`${totalSiswa > 0 ? Math.round((stats.today_prayers / totalSiswa) * 100) : 0}% ${t.active}`} color="blue" />
          <StatCard icon={AlertTriangle} label={t.notYetFill} value={stats.students_not_filled} subtext={t.students} color="red" />
          <StatCard icon={BarChart3} label={t.totalClass} value={Object.keys(stats.students_by_class || {}).length} subtext={t.class} color="purple" />
        </div>
        {Object.keys(stats.students_by_class || {}).length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(stats.students_by_class).map(([cls, count]) => (
              <div key={cls} className="bg-card border border-border rounded-2xl p-4 text-center">
                <p className="text-lg font-bold text-primary">{cls}</p>
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground">{t.students}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Monitoring Ibadah Ramadan */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-accent" /> {t.worshipReport}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard icon={Activity} label={t.todayWorship} value={stats.today_prayers} subtext={`${stats.total_students} ${t.students}`} color="emerald" />
          <StatCard icon={Target} label={`${t.prayerMenu === 'Jadwal Shalat' ? 'Shalat Wajib' : 'Prayer'}`} value={`${avgSholat}%`} subtext={`${doneSholat}/${totalSlots}`} color="blue" />
          <StatCard icon={Users} label={t.congregation} value={stats.total_berjamaah} subtext={`${stats.berjamaah_percentage}%`} color="purple" />
          <StatCard icon={Star} label={t.fridayPrayer} value={stats.total_friday} subtext={`${stats.today_friday} ${t.today}`} color="amber" />
          <StatCard icon={BookOpen} label={t.doaMenu} value={stats.doa_tracked} subtext={`${stats.doa_materials} ${t.materials}`} color="indigo" />
          <StatCard icon={FileText} label={t.journalMenu === 'Jurnal Ramadan' ? 'Jurnal' : 'Journal'} value={stats.total_journals} subtext={t.journalSubmitted} color="pink" />
        </div>

        {/* Grafik Shalat per-waktu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
            <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> {t.prayerMenu === 'Jadwal Shalat' ? 'Rekap Shalat per Waktu' : 'Prayer Recap per Time'}
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sholatChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="jumlah" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
            <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" /> {t.congregation} per Waktu
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={berjamaahChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="jumlah" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Statistik Quiz */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-500" /> {t.quizDistribution}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Bookmark} label={t.totalQuizzes} value={stats.total_quizzes} subtext={t.quizMenu} color="blue" />
          <StatCard icon={Users} label={t.studentsWorked} value={stats.total_quiz_taken} subtext={t.quizTaken} color="purple" />
          <StatCard icon={Target} label={t.avgScore} value={stats.avg_quiz_score} subtext={`${t.from} 100`} color="emerald" />
          <StatCard icon={Brain} label={t.totalMaterials} value={stats.total_quizzes} subtext={t.quizMenu} color="indigo" />
        </div>

        {quizPieData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
              <h4 className="text-lg font-bold text-foreground mb-4">{t.quizDistribution}</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={quizPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {quizPieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
              <h4 className="text-lg font-bold text-foreground mb-4">{t.quizResult} {t.recent}</h4>
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                {(stats.quiz_results || []).slice(0, 10).map((qr: any) => (
                  <div key={qr.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{qr.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{qr.quiz?.title || 'Quiz'}</p>
                    </div>
                    <span className={`text-lg font-bold ${qr.score >= 70 ? 'text-primary' : 'text-destructive'}`}>
                      {qr.score}
                    </span>
                  </div>
                ))}
                {(!stats.quiz_results || stats.quiz_results.length === 0) && (
                  <p className="text-center text-muted-foreground py-6">{t.noData}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Monitoring Materi */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" /> {t.materialMenu}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BookOpen} label={t.totalMaterials} value={stats.total_materials} subtext={t.materialMenu} color="indigo" />
          <StatCard icon={Users} label={t.materialsRead} value={stats.total_material_readings || 0} subtext={t.totalRead} color="blue" />
        </div>
        {stats.recent_materials && stats.recent_materials.length > 0 && (
          <div className="mt-4 bg-card rounded-3xl border border-border p-6 shadow-lg">
            <h4 className="text-lg font-bold text-foreground mb-4">{t.recentMaterials}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.recent_materials.map((m: any) => (
                <div key={m.id} className="p-4 bg-secondary/40 rounded-2xl border border-border">
                  <p className="font-semibold text-foreground">{m.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {m.category?.name || ''} | {m.type || 'article'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Grafik Dashboard */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> {t.studentActivity}
        </h3>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setChartTab('ibadah')} className={`px-4 py-2 rounded-xl font-semibold transition-all ${chartTab === 'ibadah' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
            {t.worshipReport}
          </button>
          <button onClick={() => setChartTab('kelas')} className={`px-4 py-2 rounded-xl font-semibold transition-all ${chartTab === 'kelas' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
            {t.class} {t.progressReport}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartTab === 'ibadah' ? (
            <>
              <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
                <h4 className="text-lg font-bold text-foreground mb-4">{t.studentActivity} (7 {t.days})</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="aktif" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
                <h4 className="text-lg font-bold text-foreground mb-4">{t.progressReport} Kelas (4 {t.weeks})</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weeklyClassData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    {Object.keys(weeklyClassData[0] || {}).filter(k => k !== 'week').map((cls, idx) => (
                      <Line key={cls} type="monotone" dataKey={cls} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={{ r: 4 }} name={cls} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <>
              <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
                <h4 className="text-lg font-bold text-foreground mb-4">{t.quizDistribution}</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={classChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="class" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="avg_score" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 6 }} name={t.avgScore} />
                    <Line type="monotone" dataKey="quiz_avg" stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 6 }} name={`${t.quizMenu} ${t.avgScore}`} />
                    <Line type="monotone" dataKey="journals" stroke="var(--color-blue-500)" strokeWidth={2} dot={{ r: 6 }} name={t.journalMenu} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
                <h4 className="text-lg font-bold text-foreground mb-4">{t.totalStudents} per Kelas</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={classChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="class" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="students" fill="var(--color-primary)" radius={[8, 8, 0, 0]} name={t.students} />
                    <Bar dataKey="quiz_count" fill="var(--color-accent)" radius={[8, 8, 0, 0]} name={t.quizTaken} />
                    <Bar dataKey="friday_count" fill="var(--color-blue-500)" radius={[8, 8, 0, 0]} name={t.fridayPrayer} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recap Tables */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setTab('shalat')}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
            tab === 'shalat' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {t.worshipReport || 'Rekap Shalat'}
        </button>
        <button
          onClick={() => setTab('doa')}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
            tab === 'doa' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {t.doaMenu || 'Rekap Doa'}
        </button>
      </div>

      <div className="bg-card rounded-3xl border border-border shadow-lg overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="text-left p-4 font-semibold text-foreground text-sm">{t.studentName}</th>
              <th className="text-left p-4 font-semibold text-foreground text-sm">{t.class}</th>
              {tab === 'shalat' && (
                <>
                  <th className="text-left p-4 font-semibold text-foreground text-sm">% {t.prayerMenu === 'Jadwal Shalat' ? 'Shalat' : 'Prayer'}</th>
                  <th className="text-left p-4 font-semibold text-foreground text-sm">{t.congregation}</th>
                  <th className="text-left p-4 font-semibold text-foreground text-sm">{t.fridayPrayer}</th>
                  <th className="text-left p-4 font-semibold text-foreground text-sm">{t.journalMenu}</th>
                  <th className="text-left p-4 font-semibold text-foreground text-sm">{t.quizMenu}</th>
                  <th className="text-left p-4 font-semibold text-foreground text-sm">{t.avgScore}</th>
                </>
              )}
              {tab === 'doa' && (
                <>
                  <th className="text-left p-4 font-semibold text-foreground text-sm">{t.progressReport || 'Progress'}</th>
                  <th className="text-left p-4 font-semibold text-foreground text-sm">{t.memorized}</th>
                  <th className="text-left p-4 font-semibold text-foreground text-sm">%</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tab === 'shalat' && recap.map((s) => (
              <tr key={s.id} className="hover:bg-secondary/50 transition-all">
                <td className="p-4 font-semibold text-foreground">{s.name}</td>
                <td className="p-4 text-muted-foreground">{s.class}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                      <div className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full" style={{ width: `${s.prayer_percentage}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-primary">{s.prayer_percentage}%</span>
                  </div>
                </td>
                <td className="p-4 text-foreground">{s.berjamaah_count}x</td>
                <td className="p-4 text-foreground">{s.friday_count}x</td>
                <td className="p-4 text-foreground">{s.journal_count}</td>
                <td className="p-4 text-foreground">{s.quiz_count}</td>
                <td className="p-4 text-foreground">{s.quiz_avg}</td>
              </tr>
            ))}
            {tab === 'doa' && doaRecap.map((d) => (
              <tr key={d.id} className="hover:bg-secondary/50 transition-all">
                <td className="p-4 font-semibold text-foreground">{d.name}</td>
                <td className="p-4 text-muted-foreground">{d.class}</td>
                <td className="p-4 text-foreground">{d.tracked}/{d.total_doa}</td>
                <td className="p-4 text-foreground">{d.memorized}/{d.total_doa}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                      <div className="h-full bg-gradient-to-r from-accent to-amber-400 rounded-full" style={{ width: `${d.progress_percentage}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-accent">{d.progress_percentage}%</span>
                  </div>
                </td>
              </tr>
            ))}
            {(tab === 'shalat' ? recap.length === 0 : doaRecap.length === 0) && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  {t.noData}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
