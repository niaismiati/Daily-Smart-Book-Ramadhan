import { useEffect, useState, useMemo, useCallback } from 'react';
import { FileText, Download, Search, BarChart3, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as reportsApi from '../../api/reports';
import * as studentsApi from '../../api/students';
import { useLanguage } from '../../i18n/LanguageContext';

const PAGE_SIZE = 10;

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="p-4"><div className="h-4 w-36 bg-secondary/60 rounded-lg" /></td>
      <td className="p-4"><div className="h-4 w-24 bg-secondary/60 rounded-lg" /></td>
      <td className="p-4"><div className="h-4 w-16 bg-secondary/60 rounded-lg" /></td>
      <td className="p-4"><div className="h-8 w-20 bg-secondary/60 rounded-xl" /></td>
    </tr>
  );
}

export function LaporanGuruPage() {
  const { t, language } = useLanguage();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentReport, setStudentReport] = useState<any>(null);
  const [classReport, setClassReport] = useState<any>(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState('');

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await studentsApi.getStudents();
      const list = res.data || res.students || [];
      setStudents(list);
      const cls = [...new Set(list.map((s: any) => s.class).filter(Boolean))] as string[];
      setClasses(cls);
    } catch { setError('Gagal memuat data siswa'); } finally { setLoading(false); }
  };

  const loadStudentReport = async (studentId: number) => {
    try {
      const report = await reportsApi.getStudentReport(studentId);
      setStudentReport(report);
      setSelectedStudent(students.find((s) => s.id === studentId) || null);
    } catch { setError('Gagal memuat laporan siswa'); }
  };

  const loadClassReport = useCallback(async (className: string) => {
    if (!className) return;
    try {
      const res = await reportsApi.getClassReport(className);
      setClassReport(res);
    } catch { setError('Gagal memuat laporan kelas'); }
  }, []);

  const generatePDF = (title: string, rows: string[][], headers: string[], studentName?: string) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.setTextColor(22, 163, 74);
    doc.text('Daily Smart Book Ramadan', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(t.appSubtitle, pageWidth / 2, 22, { align: 'center' });
    doc.setDrawColor(22, 163, 74);
    doc.line(14, 27, pageWidth - 14, 27);

    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    const dateLocale = language === 'id' ? 'id-ID' : language === 'en' ? 'en-US' : 'ar-SA';
    const dateStr = new Date().toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`${t.date}: ${dateStr}`, 14, 34);
    if (studentName) doc.text(`${t.studentName}: ${studentName}`, 14, 41);

    doc.autoTable({
      startY: studentName ? 45 : 38,
      head: [headers],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { textColor: [30, 41, 59], fontSize: 9 },
      alternateRowStyles: { fillColor: [240, 253, 244] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`${t.summary}: ${t.total} ${rows.length} ${t.students}`, 14, finalY);

    doc.save(`${title}_${Date.now()}.pdf`);
  };

  const handleExport = async (type: string, id?: number) => {
    setExporting(type);
    try {
      if (type === 'student' && studentReport) {
        const headers = [t.studentName, t.class, t.score, t.percentage];
        const rows = [[
          selectedStudent?.name || '-',
          selectedStudent?.class || '-',
          String(studentReport.avg_quiz_score ?? '-'),
          `${studentReport.sholat_percentage || 0}%`,
        ]];
        generatePDF('laporan-siswa', rows, headers, selectedStudent?.name);
      } else if (type === 'all') {
        const headers = [t.studentName, 'NISN', t.class, t.status];
        const rows = students.map((s) => [
          s.name, s.nisn || '-', s.class || '-',
          s.last_active_today ? t.active : t.inactive,
        ]);
        generatePDF('laporan-semua-siswa', rows, headers);
      } else if (type === 'class' && classReport) {
        const headers = [t.studentName, t.class, t.score, t.status];
        const rows = [[
          t.total || 'Total',
          filterClass || '-',
          String(classReport.avg_quiz_score ?? '-'),
          `${classReport.total_students || 0} ${t.students}`,
        ]];
        generatePDF('laporan-kelas', rows, headers);
      }
    } catch {
      setError('Gagal mengekspor PDF.');
    } finally {
      setExporting('');
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.nisn?.includes(search);
      const matchClass = !filterClass || s.class === filterClass;
      return matchSearch && matchClass;
    });
  }, [students, search, filterClass]);

  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);
  const pagedStudents = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeToday = useMemo(() => students.filter((s: any) => s.last_active_today).length, [students]);

  useEffect(() => { setPage(1); }, [search, filterClass]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-secondary/60 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-secondary/40 rounded-3xl animate-pulse" />
          <div className="h-48 bg-secondary/40 rounded-3xl animate-pulse" />
        </div>
        <div className="h-64 bg-secondary/40 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold text-foreground">{t.reportMenu} & {t.monitoringTitle}</h2><p className="text-muted-foreground mt-1">{t.progressReport}</p></div>
        <button onClick={() => handleExport('all')} disabled={!!exporting} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 shadow-lg shadow-primary/30 transition-all">
          {exporting === 'all' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          {exporting === 'all' ? t.processing : t.exportPDF}
        </button>
      </div>

      {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>}

      {/* Class Report & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4">{t.selectClass}</h3>
          <div className="flex gap-2 mb-4">
            <select value={filterClass} onChange={(e) => { setFilterClass(e.target.value); setPage(1); }} className="flex-1 px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">-- {t.allClasses || 'Semua Kelas'} --</option>
              {classes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => loadClassReport(filterClass)} disabled={!filterClass} className="bg-accent text-white px-4 py-3 rounded-xl font-semibold hover:bg-accent/90 disabled:opacity-50 transition-all">{t.view}</button>
          </div>
          {classReport ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary/5 p-3 rounded-xl">
                  <p className="text-sm text-muted-foreground">{t.totalStudents}</p>
                  <p className="text-xl font-bold text-foreground">{classReport.total_students}</p>
                </div>
                <div className="bg-accent/5 p-3 rounded-xl">
                  <p className="text-sm text-muted-foreground">{t.avgScore}</p>
                  <p className="text-xl font-bold text-accent">{classReport.avg_quiz_score ?? '-'}</p>
                </div>
                <div className="bg-primary/5 p-3 rounded-xl">
                  <p className="text-sm text-muted-foreground">{t.todayWorship}</p>
                  <p className="text-xl font-bold text-foreground">{classReport.total_sholat || 0}</p>
                </div>
                <div className="bg-accent/5 p-3 rounded-xl">
                  <p className="text-sm text-muted-foreground">{t.journalMenu}</p>
                  <p className="text-xl font-bold text-accent">{classReport.total_journals || 0}</p>
                </div>
              </div>
              <button onClick={() => handleExport('class')} disabled={!!exporting} className="text-sm text-primary hover:underline disabled:opacity-50">
                {exporting === 'class' ? t.processing : t.exportPDF}
              </button>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6 text-sm">{t.noData}</p>
          )}
        </div>

        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4">{t.summary}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="text-foreground">{t.studentActivity}</span>
              </div>
              <span className="text-xl font-bold text-foreground">{activeToday}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-accent" />
                <span className="text-foreground">{t.totalQuizzes}</span>
              </div>
              <span className="text-xl font-bold text-accent">{classReport?.total_quiz_taken || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-foreground">{t.totalStudents}</span>
              </div>
              <span className="text-xl font-bold text-foreground">{students.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-accent" />
                <span className="text-foreground">{t.avgScore}</span>
              </div>
              <span className="text-xl font-bold text-accent">{classReport?.avg_quiz_score || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-card rounded-3xl border border-border shadow-lg">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">{t.reportMenu} <span className="text-sm font-normal text-muted-foreground">({filteredStudents.length} {t.students})</span></h3>
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" placeholder={`${t.search}...`} />
            </div>
            <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">{t.allClasses || 'Semua Kelas'}</option>
              {classes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 font-semibold text-foreground text-sm">{t.studentName}</th>
              <th className="text-left p-4 font-semibold text-foreground text-sm">NISN</th>
              <th className="text-left p-4 font-semibold text-foreground text-sm">{t.class}</th>
              <th className="text-left p-4 font-semibold text-foreground text-sm">{t.status}</th>
              <th className="text-left p-4 font-semibold text-foreground text-sm">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pagedStudents.length > 0 ? (
              pagedStudents.map((s) => (
                <tr key={s.id} className="hover:bg-secondary/30 transition-all">
                  <td className="p-4 font-semibold text-foreground">{s.name}</td>
                  <td className="p-4 text-muted-foreground text-sm">{s.nisn || '-'}</td>
                  <td className="p-4 text-muted-foreground text-sm">{s.class || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${s.last_active_today ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {s.last_active_today ? t.active : t.inactive}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => loadStudentReport(s.id)} className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all">
                      {t.viewDetail}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">{t.noStudents}</td></tr>
            )}
            {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">{t.showing} {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredStudents.length)} {t.of} {filteredStudents.length}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl hover:bg-secondary disabled:opacity-30 transition-all"><ChevronLeft className="w-5 h-5" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${p === page ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-xl hover:bg-secondary disabled:opacity-30 transition-all"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Student Report Modal */}
      {selectedStudent && studentReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setSelectedStudent(null); setStudentReport(null); }}>
          <div className="bg-card rounded-3xl border border-border p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">{selectedStudent.name}</h3>
                <p className="text-muted-foreground text-sm">{selectedStudent.nisn} — {selectedStudent.class}</p>
              </div>
              <button onClick={() => { setSelectedStudent(null); setStudentReport(null); }} className="p-2 hover:bg-secondary rounded-xl transition-all"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-primary/5 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground">{t.avgScore}</p>
                <p className="text-2xl font-bold text-foreground">{studentReport.avg_quiz_score ?? '-'}</p>
              </div>
              <div className="bg-accent/5 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground">{t.totalQuizzes}</p>
                <p className="text-2xl font-bold text-accent">{studentReport.total_quiz_taken || 0}</p>
              </div>
              <div className="bg-primary/5 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground">{t.todayWorship}</p>
                <p className="text-2xl font-bold text-foreground">{studentReport.total_sholat || 0}/150</p>
              </div>
              <div className="bg-accent/5 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground">{t.journalMenu}</p>
                <p className="text-2xl font-bold text-accent">{studentReport.total_journals || 0}</p>
              </div>
              <div className="bg-primary/5 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground">{t.materialMenu}</p>
                <p className="text-2xl font-bold text-foreground">{studentReport.total_materials_read || 0}</p>
              </div>
              <div className="bg-accent/5 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground">{t.prayerMenu === 'Jadwal Shalat' ? 'Kehadiran Jumat' : 'Friday Attendance'}</p>
                <p className="text-2xl font-bold text-accent">{studentReport.friday_attendance || 0}</p>
              </div>
            </div>

            <button onClick={() => handleExport('student', selectedStudent.id)} disabled={!!exporting} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all">
              {exporting === 'student' ? t.processing : t.exportPDF}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}