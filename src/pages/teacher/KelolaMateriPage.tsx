import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Upload, Check, FileText, Video, Image as ImageIcon, Link } from 'lucide-react';
import * as materialsApi from '../../api/materials';
import type { Material } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

export function KelolaMateriPage() {
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; materials_count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [form, setForm] = useState({ title: '', description: '', type: 'article', file_url: '', video_url: '', category_id: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadData(); }, [filterCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [matRes, catRes] = await Promise.all([
        materialsApi.getMaterials({ category_id: filterCategory ? Number(filterCategory) : undefined }),
        materialsApi.getCategories(),
      ]);
      setMaterials(matRes.materials || []);
      setCategories(catRes.categories);
    } catch { setError(t.errorLoadMaterials); } finally { setLoading(false); }
  };

  const resetForm = () => {
    setShowForm(false); setEditingId(null); setForm({ title: '', description: '', type: 'article', file_url: '', video_url: '', category_id: 0 }); setError('');
  };

  const handleEdit = (m: Material) => {
    setEditingId(m.id); setForm({ title: m.title, description: m.description || '', type: m.type, file_url: m.file_url || '', video_url: m.video_url || '', category_id: m.category_id || 0 }); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title) { setError(t.titleRequired); return; }
    setError('');
    try {
      const payload = { ...form, category_id: form.category_id || undefined };
      if (editingId) { await materialsApi.updateMaterial(editingId, payload); setSuccess(t.successMaterialUpdated); }
      else { await materialsApi.createMaterial(payload); setSuccess(t.successMaterialAdded); }
      resetForm(); await loadData(); setTimeout(() => setSuccess(''), 3000);
    } catch { setError(t.errorSaveMaterial); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDeleteMaterial)) return;
    try { await materialsApi.deleteMaterial(id); setSuccess(t.successMaterialDeleted); await loadData(); setTimeout(() => setSuccess(''), 3000); }
    catch { setError(t.errorDeleteMaterial); }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try { await materialsApi.createCategory(newCategory); setNewCategory(''); setShowCategoryForm(false); await loadData(); setSuccess(t.successCategoryAdded); setTimeout(() => setSuccess(''), 3000); }
    catch { setError(t.errorAddCategory); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const res = await materialsApi.uploadFile(file); setForm((f) => ({ ...f, file_url: res.url })); }
    catch { setError(t.errorUploadFile); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold text-foreground">{t.manageMaterialsTitle}</h2><p className="text-muted-foreground mt-1">{t.manageMaterialsSubtitle}</p></div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold hover:bg-primary/90 shadow-lg shadow-primary/30">
          <Plus className="w-5 h-5" /> {t.addMaterial}
        </button>
      </div>

      {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>}
      {success && <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-xl text-sm flex items-center gap-2"><Check className="w-4 h-4" /> {success}</div>}

      {/* Categories Row */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterCategory('')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${!filterCategory ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>{t.filterAll}</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setFilterCategory(String(c.id))} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filterCategory === String(c.id) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
            {c.name} ({c.materials_count})
          </button>
        ))}
        <button onClick={() => setShowCategoryForm(!showCategoryForm)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20 transition-all">
          {t.addCategory}
        </button>
      </div>

      {showCategoryForm && (
        <div className="flex gap-2 items-center">
          <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="flex-1 px-4 py-2 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" placeholder={t.newCategoryName} />
          <button onClick={handleAddCategory} className="bg-accent text-white px-4 py-2 rounded-xl font-semibold hover:bg-accent/90">{t.addCategoryLabel}</button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4">{editingId ? t.editMaterial : t.addNewMaterial}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="block text-sm font-semibold text-muted-foreground mb-2">{t.title}</label><input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" placeholder={t.sermonPlaceholder} /></div>
            <div className="md:col-span-2"><label className="block text-sm font-semibold text-muted-foreground mb-2">{t.description}</label><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring h-24 resize-none" placeholder={t.descriptionPlaceholder} /></div>
            <div><label className="block text-sm font-semibold text-muted-foreground mb-2">{t.typeLabel}</label>
              <div className="flex gap-2">
                {(['article', 'pdf', 'video', 'image'] as const).map((t) => (
                  <button key={t} onClick={() => setForm((f) => ({ ...f, type: t }))} className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${form.type === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:bg-secondary/60'}`}>
                    {t === 'article' && <FileText className="w-4 h-4" />}
                    {t === 'pdf' && <FileText className="w-4 h-4" />}
                    {t === 'video' && <Video className="w-4 h-4" />}
                    {t === 'image' && <ImageIcon className="w-4 h-4" />}
                    {t === 'article' ? t.articleType : t === 'pdf' ? 'PDF' : t === 'video' ? 'Video' : 'Gambar'}
                  </button>
                ))}
              </div>
            </div>
            <div><label className="block text-sm font-semibold text-muted-foreground mb-2">{t.category}</label><select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: Number(e.target.value) }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring">
              <option value={0}>{t.selectCategory}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
            {form.type === 'article' && <div className="md:col-span-2"><label className="block text-sm font-semibold text-muted-foreground mb-2">{t.urlFile}</label><input value={form.file_url} onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://..." /></div>}
            {form.type === 'pdf' && <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-muted-foreground mb-2">{t.uploadPdf}</label>
              <div className="flex gap-2 items-center">
                <input value={form.file_url} onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))} className="flex-1 px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" placeholder={t.pdfUrl} />
                <label className="cursor-pointer bg-secondary px-4 py-3 rounded-xl hover:bg-secondary/80"><Upload className="w-5 h-5" /><input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" /></label>
              </div>
            </div>}
            {form.type === 'video' && <div className="md:col-span-2"><label className="block text-sm font-semibold text-muted-foreground mb-2">{t.videoUrl}</label><input value={form.video_url} onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://www.youtube.com/embed/..." /></div>}
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
          <thead className="bg-muted border-b border-border"><tr><th className="text-left p-4 font-semibold text-foreground">{t.title}</th><th className="text-left p-4 font-semibold text-foreground">{t.type}</th><th className="text-left p-4 font-semibold text-foreground">{t.category}</th><th className="text-left p-4 font-semibold text-foreground">{t.status}</th><th className="text-left p-4 font-semibold text-foreground">{t.actions}</th></tr></thead>
          <tbody className="divide-y divide-border">
            {materials.map((m) => (
              <tr key={m.id} className="hover:bg-secondary/50 transition-all">
                <td className="p-4 font-semibold text-foreground">{m.title}</td>
                <td className="p-4">
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary">{m.type}</span>
                </td>
                <td className="p-4 text-muted-foreground">{m.category?.name || '-'}</td>
                <td className="p-4"><span className={`px-3 py-1 rounded-lg text-xs font-semibold ${m.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{m.is_active ? t.active : t.inactive}</span></td>
                <td className="p-4"><div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(m)} className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20"><Trash2 className="w-4 h-4" /></button>
                </div></td>
              </tr>
            ))}
            {materials.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">{t.noMaterialData}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
