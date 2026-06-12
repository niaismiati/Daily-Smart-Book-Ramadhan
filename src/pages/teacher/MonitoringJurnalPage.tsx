import { useEffect, useState } from 'react';
import { BookOpen, Search, Filter, Calendar, Smile, Meh, Frown, Star, Heart } from 'lucide-react';
import * as journalsApi from '../../api/journals';
import { useLanguage } from '../../i18n/LanguageContext';

const moodIcons: Record<string, any> = {
  happy: Smile, neutral: Meh, sad: Frown, excited: Star, grateful: Heart,
};

const moodLabels: Record<string, string> = {
  happy: 'Senang', neutral: 'Biasa', sad: 'Sedih', excited: 'Semangat', grateful: 'Bersyukur',
};

export function MonitoringJurnalPage() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentJournals, setStudentJournals] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await journalsApi.getAllStudentsJournals();
      setStudents(res.students || []);
      const cls = [...new Set((res.students || []).map((s: any) => s.class).filter(Boolean))] as string[];
      setClasses(cls);
    } catch { setError(t.errorLoadMonitoring); } finally { setLoading(false); }
  };

  const loadStudentJournals = async (studentId: number) => {
    try {
      const res = await journalsApi.getStudentJournals(studentId);
      setStudentJournals(res.journals || []);
      setSelectedStudent(students.find((s) => s.id === studentId));
    } catch { setError(t.errorLoadStudentJournals); }
  };

  const filteredStudents = students.filter((s: any) => {
    const matchSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.nisn?.includes(search);
    const matchClass = !filterClass || s.class === filterClass;
    return matchSearch && matchClass;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div><h2 className="text-3xl font-bold text-foreground">{t.monitorJournalTitle}</h2><p className="text-muted-foreground mt-1">{t.monitorJournalSubtitle}</p></div>

      {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" placeholder={t.searchStudentPlaceholder} />
        </div>
        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">{t.allClasses}</option>
          {classes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((s: any) => (
          <div key={s.id} className="bg-card rounded-3xl border border-border p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:border-primary/30" onClick={() => loadStudentJournals(s.id)}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">{s.name?.charAt(0)}</div>
              <div>
                <h3 className="font-semibold text-foreground">{s.name}</h3>
                <p className="text-sm text-muted-foreground">{s.class} — {s.nisn}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground"><BookOpen className="w-4 h-4" /> {t.journalCount.replace('{count}', String(s.journals_count || 0))}</span>
              <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${(s.journals_count || 0) > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {(s.journals_count || 0) > 0 ? t.active : t.notFilledYet}
              </span>
            </div>
          </div>
        ))}
        {filteredStudents.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">{t.noStudentsFound}</div>}
      </div>

      {/* Journal Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setSelectedStudent(null); setStudentJournals([]); }}>
          <div className="bg-card rounded-3xl border border-border p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">{t.journalFor.replace('{name}', selectedStudent.name)}</h3>
                <p className="text-muted-foreground">{selectedStudent.class} — {selectedStudent.nisn}</p>
              </div>
              <button onClick={() => { setSelectedStudent(null); setStudentJournals([]); }} className="text-muted-foreground hover:text-foreground"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
            </div>

            <div className="space-y-4">
              {studentJournals.map((j) => {
                const MoodIcon = moodIcons[j.mood] || Smile;
                const date = new Date(j.created_at || j.date);
                return (
                  <div key={j.id} className="border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <MoodIcon className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">{moodLabels[j.mood] || j.mood}</span>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap">{j.content}</p>
                    {j.reflection && <p className="text-sm text-muted-foreground mt-2 italic">{t.reflection}: {j.reflection}</p>}
                  </div>
                );
              })}
              {studentJournals.length === 0 && <p className="text-center text-muted-foreground py-8">{t.noJournalsForStudent}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
