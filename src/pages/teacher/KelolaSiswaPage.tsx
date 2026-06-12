import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Upload, Download, Key, Check, X } from 'lucide-react';
import * as studentsApi from '../../api/students';
import type { User } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

export function KelolaSiswaPage() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', nisn: '', class_id: 1, password: '' });
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadData(); }, [search, filterClass]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [res, clsRes] = await Promise.all([
        studentsApi.getStudents({ search: search || undefined, status: 'active' }),
        studentsApi.getClasses(),
      ]);
      setStudents(res.data);
      setClasses(clsRes.classes);
    } catch {
      setError(t.errorLoadStudents);
    } finally { setLoading(false); }
  };

  const resetForm = () => {
    setShowForm(false); setEditingId(null); setForm({ name: '', nisn: '', class_id: 1, password: '' }); setError('');
  };

  const handleEdit = (s: User) => {
    const classIdx = classes.indexOf(s.class || '');
    setEditingId(s.id); setForm({ name: s.name, nisn: s.nisn || '', class_id: classIdx >= 0 ? classIdx + 1 : 1, password: '' }); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.nisn) { setError(t.nameRequired); return; }
    setError('');
    try {
      if (editingId) {
        await studentsApi.updateStudent(editingId, form);
        setSuccess(t.successStudentSaved);
      } else {
        if (!form.password || form.password.length < 6) { setError(t.passwordMinLength); return; }
        await studentsApi.createStudent(form);
        setSuccess(t.successStudentAdded);
      }
      resetForm(); await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError(t.errorSaveStudent); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDeleteStudent)) return;
    try { await studentsApi.deleteStudent(id); setSuccess(t.successStudentDeleted); await loadData(); setTimeout(() => setSuccess(''), 3000); }
    catch { setError(t.errorDeleteStudent); }
  };

  const handleResetPassword = async (id: number) => {
    const newPw = prompt(t.newPasswordPrompt);
    if (!newPw || newPw.length < 6) return;
    try { await studentsApi.resetPassword(id, newPw); setSuccess(t.successPasswordReset); setTimeout(() => setSuccess(''), 3000); }
    catch { setError(t.errorResetPassword); }
  };

  const handleImport = async () => {
    try {
      const rows = importData.trim().split('\n').map((line) => {
        const [name, nisn, className, password] = line.split(',').map((s) => s.trim());
        const classIdx = classes.indexOf(className) + 1;
        return { name, nisn, class_id: classIdx > 0 ? classIdx : 1, password: password || 'siswa123' };
      });
      const res = await studentsApi.importStudents(rows);
      setSuccess(res.message);
      setShowImport(false); setImportData(''); await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError(t.errorImport); }
  };

  const handleExport = async () => {
    try {
      const classId = filterClass ? classes.indexOf(filterClass) + 1 : undefined;
      const res = await studentsApi.exportStudents(classId);
      const csv = [Object.keys(res.students[0] || {}).join(','), ...res.students.map((r) => Object.values(r).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'data-siswa.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch { setError(t.errorExport); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold text-foreground">{t.manageStudentsTitle}</h2><p className="text-muted-foreground mt-1">{t.manageStudentsSubtitle}</p></div>
        <div className="flex gap-2">
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
            <Plus className="w-5 h-5" /> {t.addStudent}
          </button>
          <button onClick={() => setShowImport(!showImport)} className="flex items-center gap-2 bg-accent/10 text-accent px-5 py-3 rounded-xl font-semibold hover:bg-accent/20 transition-all border border-accent/20">
            <Upload className="w-5 h-5" /> {t.importStudents}
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 bg-primary/10 text-primary px-5 py-3 rounded-xl font-semibold hover:bg-primary/20 transition-all border border-primary/20">
            <Download className="w-5 h-5" /> {t.exportStudents}
          </button>
        </div>
      </div>

      {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>}
      {success && <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-xl text-sm flex items-center gap-2"><Check className="w-4 h-4" /> {success}</div>}

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchStudentPlaceholder} className="w-full pl-12 pr-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">{t.allClasses}</option>
          {classes.map((c) => <option key={c} value={c}>Kelas {c}</option>)}
        </select>
      </div>

      {/* Import Form */}
      {showImport && (
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-2">{t.importTitle}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t.importFormat}</p>
          <textarea value={importData} onChange={(e) => setImportData(e.target.value)} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl h-32 resize-none" placeholder={`Ahmad Fauzan,1234567890,9A,siswa123\nSiti Aminah,9988776655,9B,siswa123`} />
          <div className="flex gap-2 mt-3">
            <button onClick={handleImport} className="bg-accent text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-accent/90">{t.importButton}</button>
            <button onClick={() => setShowImport(false)} className="bg-secondary text-secondary-foreground px-5 py-2.5 rounded-xl font-semibold">{t.cancel}</button>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4">{editingId ? t.editStudent : t.addNewStudent}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-muted-foreground mb-2">{t.name}</label><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" placeholder={t.fullNamePlaceholder} /></div>
            <div><label className="block text-sm font-semibold text-muted-foreground mb-2">{t.nisn}</label><input value={form.nisn} onChange={(e) => setForm((f) => ({ ...f, nisn: e.target.value }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" placeholder={t.nisnPlaceholder} /></div>
            <div><label className="block text-sm font-semibold text-muted-foreground mb-2">{t.class}</label><select value={form.class_id} onChange={(e) => setForm((f) => ({ ...f, class_id: Number(e.target.value) }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring">
              {classes.map((c, i) => <option key={c} value={i + 1}>Kelas {c}</option>)}
            </select></div>
            <div><label className="block text-sm font-semibold text-muted-foreground mb-2">{t.password} {editingId && t.emptyPasswordHint}</label><input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" placeholder={t.minLengthHint} /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90">{editingId ? t.save : t.add}</button>
            <button onClick={resetForm} className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-xl font-semibold">{t.cancel}</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-3xl border border-border shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="text-left p-4 font-semibold text-foreground">{t.name}</th>
              <th className="text-left p-4 font-semibold text-foreground">{t.nisn}</th>
              <th className="text-left p-4 font-semibold text-foreground">{t.class}</th>
              <th className="text-left p-4 font-semibold text-foreground">{t.email}</th>
              <th className="text-left p-4 font-semibold text-foreground">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-secondary/50 transition-all">
                <td className="p-4 font-semibold text-foreground">{s.name}</td>
                <td className="p-4 text-muted-foreground">{s.nisn}</td>
                <td className="p-4 text-foreground">{s.class}</td>
                <td className="p-4 text-muted-foreground">{s.email || '-'}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(s)} className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-all"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleResetPassword(s.id)} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-all"><Key className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">{t.noStudentData}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
