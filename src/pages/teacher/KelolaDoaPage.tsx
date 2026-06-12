import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import * as doaApi from '../../api/doa';
import { useLanguage } from '../../i18n/LanguageContext';
import type { DoaMaterial } from '../../types';


export function KelolaDoaPage() {
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<DoaMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: '',
    arabic_text: '',
    latin_text: '',
    translation: '',
    audio_url: '',
    category: 'niat_puasa',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDoa();
  }, []);

  const loadDoa = async () => {
    setLoading(true);
    try {
      const res = await doaApi.getAllDoa();
      setMaterials(res.materials);
    } catch {
      toast.error('Gagal memuat data doa');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ title: '', arabic_text: '', latin_text: '', translation: '', audio_url: '', category: 'niat_puasa' });
  };

  const handleEdit = (m: DoaMaterial) => {
    setEditingId(m.id);
    setForm({
      title: m.title,
      arabic_text: m.arabic_text,
      latin_text: m.latin_text,
      translation: m.translation,
      audio_url: m.audio_url ?? '',
      category: m.category,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.arabic_text.trim() || !form.latin_text.trim() || !form.translation.trim()) {
      toast.error('Semua field wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await doaApi.updateDoa(editingId, form);
        toast.success(t.successUpdated || 'Data berhasil diupdate');
      } else {
        await doaApi.createDoa(form);
        toast.success(t.successSaved || 'Data berhasil disimpan');
      }
      resetForm();
      await loadDoa();
    } catch (err: any) {
      const msg = err?.response?.data?.message || t.errorOccurred || 'Gagal menyimpan';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete || 'Hapus data ini?')) return;
    try {
      await doaApi.deleteDoa(id);
      toast.success(t.successDeleted || 'Data berhasil dihapus');
      await loadDoa();
    } catch (err: any) {
      const msg = err?.response?.data?.message || t.errorOccurred || 'Gagal menghapus';
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">{t.doaTitle || 'Materi Doa-Doa Puasa'}</h2>
          <p className="text-muted-foreground mt-1">{t.doaSubtitle || 'Kelola doa-doa harian Ramadhan'}</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
        >
          <Plus className="w-5 h-5" /> {t.add}
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4">
            {editingId ? (t.editItem || 'Edit') : (t.addNew || 'Tambah Baru')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-muted-foreground mb-2">{t.title}</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={t.titlePlaceholder || 'Judul doa'}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2">Audio URL ({t.or || 'atau'} opsional)</label>
              <input
                value={form.audio_url}
                onChange={(e) => setForm((f) => ({ ...f, audio_url: e.target.value }))}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://example.com/audio.mp3"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-muted-foreground mb-2">Teks Arab</label>
              <textarea
                value={form.arabic_text}
                onChange={(e) => setForm((f) => ({ ...f, arabic_text: e.target.value }))}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring h-20 resize-none font-arabic text-right text-xl"
                placeholder="النص العربي"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2">Latin</label>
              <textarea
                value={form.latin_text}
                onChange={(e) => setForm((f) => ({ ...f, latin_text: e.target.value }))}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring h-20 resize-none"
                placeholder="Teks latin / transliterasi"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2">{t.translation}</label>
              <textarea
                value={form.translation}
                onChange={(e) => setForm((f) => ({ ...f, translation: e.target.value }))}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring h-20 resize-none"
                placeholder={t.translation}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={submitting} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all">
              {submitting ? t.saving : (editingId ? t.save : t.add)}
            </button>
            <button onClick={resetForm} className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-xl font-semibold hover:bg-secondary/80 transition-all">
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-3xl border border-border shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="text-left p-4 font-semibold text-foreground">{t.title}</th>
              <th className="text-left p-4 font-semibold text-foreground">{t.status}</th>
              <th className="text-left p-4 font-semibold text-foreground">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {materials.map((m) => (
              <tr key={m.id} className="hover:bg-secondary/50 transition-all">
                <td className="p-4 font-semibold text-foreground">{m.title}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${m.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {m.is_active ? t.active : t.inactive}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(m)} className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {materials.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-muted-foreground">
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