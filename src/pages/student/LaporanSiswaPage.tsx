import { useEffect, useState, useMemo, useCallback } from 'react';
import { Award, BookOpen, PenTool, CheckCircle, Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as reportsApi from '../../api/reports';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

function SkeletonStat() {
  return (
    <div className="animate-pulse bg-card rounded-3xl border border-border p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-secondary/60 rounded-xl" />
        <div className="h-4 w-20 bg-secondary/60 rounded-lg" />
      </div>
      <div className="h-8 w-16 bg-secondary/60 rounded-xl mb-2" />
      <div className="h-3 w-24 bg-secondary/40 rounded-lg" />
    </div>
  );
}

export function LaporanSiswaPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reportsApi.getMyReport();
      setReport(res);
    } catch {
      setError('Gagal memuat laporan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(18);
      doc.setTextColor(22, 163, 74);
      doc.text('Daily Smart Book Ramadan', pageWidth / 2, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(t.appSubtitle, pageWidth / 2, 28, { align: 'center' });

      // Separator
      doc.setDrawColor(22, 163, 74);
      doc.setLineWidth(0.5);
      doc.line(14, 33, pageWidth - 14, 33);

      // User Info
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text(`${t.studentName}: ${user?.name || '-'}`, 14, 42);
      doc.text(`${t.class}: ${user?.class || '-'}`, 14, 49);
      const dateLocale = language === 'id' ? 'id-ID' : language === 'en' ? 'en-US' : 'ar-SA';
      doc.text(`${t.date}: ${new Date().toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 56);

      // Summary stats
      doc.setFontSize(14);
      doc.setTextColor(22, 163, 74);
      doc.text(t.summary, 14, 67);

      const summaryData = [
        [t.fajrPrayer?.replace('Shalat ', '') || 'Sholat', `${report?.total_sholat || 0} / 150 (${report?.sholat_percentage || 0}%)`],
        [t.quizMenu, `${report?.total_quiz_taken || 0} ${t.quizCompleted} (${t.avgScore}: ${report?.avg_quiz_score || '-'})`],
        [t.materialMenu, `${report?.total_materials_read || 0} ${t.materialMenu}`],
        [t.journalMenu, `${report?.total_journals || 0} ${t.journalMenu}`],
      ];

      doc.autoTable({
        startY: 71,
        head: [['Item', 'Detail']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255], fontStyle: 'bold' },
        bodyStyles: { textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [240, 253, 244] },
      });

      // Prayer detail table
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.setTextColor(22, 163, 74);
      doc.text(t.prayerSchedule, 14, finalY);

      const prayerData = [
        [t.fajrPrayer || 'Subuh', `${report?.sholat_subuh || 0}/30`],
        [t.dhuhrPrayer || 'Dzuhur', `${report?.sholat_dzuhur || 0}/30`],
        [t.asrPrayer || 'Ashar', `${report?.sholat_ashar || 0}/30`],
        [t.maghribPrayer || 'Maghrib', `${report?.sholat_maghrib || 0}/30`],
        [t.ishaPrayer || 'Isya', `${report?.sholat_isya || 0}/30`],
      ];

      doc.autoTable({
        startY: finalY + 4,
        head: [[t.prayerMenu === 'Jadwal Shalat' ? 'Shalat' : 'Prayer', t.total]],
        body: prayerData,
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255], fontStyle: 'bold' },
        bodyStyles: { textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [240, 253, 244] },
      });

      // Conclusion
      const conclY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.setTextColor(22, 163, 74);
      doc.text(t.summary, 14, conclY);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      const totalPoin = report?.total_points || 0;
      doc.text(`${t.total} ${t.total}: ${totalPoin}`, 14, conclY + 8);

      // Save PDF
      doc.save(`laporan_ramadan_${user?.name || 'saya'}_${Date.now()}.pdf`);
    } catch (e) {
      setError('Gagal mengekspor PDF. Coba lagi.');
    } finally {
      setExporting(false);
    }
  };

  const stats = useMemo(() => [
    {
      icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10',
      label: t.worshipRecorded || 'Sholat Wajib', value: report?.total_sholat || 0,
      sub: `${report?.sholat_percentage || 0}% ${t.consistency}`, suffix: '/150',
    },
    {
      icon: Award, color: 'text-accent', bg: 'bg-accent/10',
      label: t.quizMenu, value: report?.total_quiz_taken || 0,
      sub: `${t.avgScore}: ${report?.avg_quiz_score || '-'}`, suffix: '',
    },
    {
      icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10',
      label: t.materialMenu, value: report?.total_materials_read || 0,
      sub: `${report?.reading_points || 0} ${t.total}`, suffix: '',
    },
    {
      icon: PenTool, color: 'text-accent', bg: 'bg-accent/10',
      label: t.journalMenu, value: report?.total_journals || 0,
      sub: t.totalEntries, suffix: '',
    },
  ], [report, t]);

  const prayerDetails = useMemo(() => [
    { label: t.fajrPrayer || 'Subuh', value: report?.sholat_subuh || 0 },
    { label: t.dhuhrPrayer || 'Dzuhur', value: report?.sholat_dzuhur || 0 },
    { label: t.asrPrayer || 'Ashar', value: report?.sholat_ashar || 0 },
    { label: t.maghribPrayer || 'Maghrib', value: report?.sholat_maghrib || 0 },
    { label: t.ishaPrayer || 'Isya', value: report?.sholat_isya || 0 },
  ], [report, t]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-secondary/60 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">{t.reportMenu}</h2>
          <p className="text-muted-foreground mt-1">{t.progressReport}</p>
        </div>
        <button onClick={handleExportPDF} disabled={exporting} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 shadow-lg shadow-primary/30 transition-all">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {exporting ? t.processing : t.exportPDF}
        </button>
      </div>

      {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-3xl border border-border p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 ${s.bg} rounded-xl ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <span className="font-semibold text-foreground">{s.label}</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {s.value}<span className="text-sm text-muted-foreground font-normal">{s.suffix}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4">{t.worshipReport || 'Detail Sholat Wajib'}</h3>
          <div className="space-y-3">
            {prayerDetails.map((s) => {
              const pct = Math.min((s.value / 30) * 100, 100);
              return (
                <div key={s.label} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <span className="text-foreground">{s.label}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-bold text-foreground w-10 text-right">{s.value}/30</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4">{t.journalReport || 'Aktivitas Lainnya'}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <span className="text-foreground">{t.prayerMenu === 'Jadwal Shalat' ? 'Shalat Jumat' : 'Friday Prayer'}</span>
              <span className="font-bold text-foreground">{report?.friday_attendance || 0} {t.entries}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <span className="text-foreground">{t.trackerMenu || 'Doa Harian'}</span>
              <span className="font-bold text-foreground">{report?.total_doa_learned || 0} {t.total}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <span className="text-foreground">{t.total} {t.total}</span>
              <span className="font-bold text-foreground text-lg">{report?.total_points || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <span className="text-foreground">{t.worshipStreak || 'Streak Jurnal'}</span>
              <span className="font-bold text-foreground">{report?.journal_streak || 0} {t.days}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
        <h3 className="text-lg font-bold text-foreground mb-4">{t.weeklyProgress}</h3>
        <div className="flex items-end justify-around gap-3 h-48 px-2">
          {['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'].map((week, i) => {
            const pct = Math.min(report?.weekly_progress?.[i] ?? 0, 100);
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