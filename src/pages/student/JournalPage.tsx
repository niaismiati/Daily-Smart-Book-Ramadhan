import { useEffect, useState } from 'react';
import { PenTool, Save, Trash2, Calendar, Smile, Meh, Frown, Brain, Heart, Star } from 'lucide-react';
import * as journalsApi from '../../api/journals';
import { useAuth } from '../../contexts/AuthContext';

const moodIcons: Record<string, any> = {
  happy: Smile, neutral: Meh, sad: Frown, excited: Star, grateful: Heart,
};

const moodLabels: Record<string, string> = {
  happy: 'Senang', neutral: 'Biasa', sad: 'Sedih', excited: 'Semangat', grateful: 'Bersyukur',
};

export function JournalPage() {
  const { user } = useAuth();
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ content: '', mood: 'neutral', reflection: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadJournals(); }, []);

  const loadJournals = async () => {
    setLoading(true);
    try {
      const res = await journalsApi.getMyJournals();
      setJournals(res.journals || []);
    } catch { } finally { setLoading(false); }
  };

  const resetForm = () => { setShowForm(false); setEditingId(null); setForm({ content: '', mood: 'neutral', reflection: '' }); setError(''); };

  const handleEdit = (j: any) => {
    setEditingId(j.id);
    setForm({ content: j.content, mood: j.mood || 'neutral', reflection: j.reflection || '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.content) { setError('Tulisan jurnal tidak boleh kosong'); return; }
    setError('');
    try {
      if (editingId) { await journalsApi.updateJournal(editingId, form); setSuccess('Jurnal diubah!'); }
      else { await journalsApi.createJournal(form); setSuccess('Jurnal baru ditambahkan!'); }
      resetForm(); await loadJournals(); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Gagal menyimpan jurnal'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus jurnal ini?')) return;
    try { await journalsApi.deleteJournal(id); setSuccess('Jurnal dihapus!'); await loadJournals(); setTimeout(() => setSuccess(''), 3000); }
    catch { setError('Gagal menghapus jurnal'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold text-foreground">Jurnal Ramadan</h2><p className="text-muted-foreground mt-1">Catat pengalaman ibadah dan refleksi harian</p></div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold hover:bg-primary/90 shadow-lg shadow-primary/30">
          <PenTool className="w-5 h-5" /> Tulis Jurnal
        </button>
      </div>

      {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>}
      {success && <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-xl text-sm">{success}</div>}

      {/* Streak */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl border border-border p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <Brain className="w-10 h-10 text-primary" />
          <div>
            <p className="text-lg font-bold text-foreground">Streak Jurnal: {journals.length} hari</p>
            <p className="text-sm text-muted-foreground">Catat refleksi setiap hari untuk menjaga konsistensi ibadah</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1">
          {Array.from({ length: 30 }, (_, i) => (
            <div key={i} className={`h-2 rounded-full ${i < journals.length ? 'bg-primary' : 'bg-secondary'}`}></div>
          ))}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4">{editingId ? 'Edit Jurnal' : 'Tulis Jurnal Baru'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2">Bagaimana perasaanmu hari ini?</label>
              <div className="flex gap-2">
                {(['happy', 'excited', 'grateful', 'neutral', 'sad'] as const).map((m) => {
                  const Icon = moodIcons[m];
                  return (
                    <button key={m} onClick={() => setForm((f) => ({ ...f, mood: m }))} className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all ${form.mood === m ? 'border-primary bg-primary/10' : 'border-border bg-background hover:bg-secondary/60'}`}>
                      <Icon className={`w-6 h-6 ${form.mood === m ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-xs font-semibold ${form.mood === m ? 'text-primary' : 'text-muted-foreground'}`}>{moodLabels[m]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2">Catatan & Refleksi</label>
              <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring h-40 resize-none" placeholder="Tulis pengalaman ibadah hari ini..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2">Refleksi Diri (opsional)</label>
              <input value={form.reflection} onChange={(e) => setForm((f) => ({ ...f, reflection: e.target.value }))} className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Apa yang bisa diperbaiki?" />
            </div>
            <div className="flex gap-2"><button onClick={handleSave} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90"><Save className="w-4 h-4" /> {editingId ? 'Simpan' : 'Simpan Jurnal'}</button><button onClick={resetForm} className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-xl font-semibold">Batal</button></div>
          </div>
        </div>
      )}

      {/* Journal List */}
      <div className="space-y-4">
        {journals.map((j) => {
          const MoodIcon = moodIcons[j.mood] || Smile;
          const date = new Date(j.created_at || j.date);
          return (
            <div key={j.id} className="bg-card rounded-3xl border border-border p-6 shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <MoodIcon className="w-5 h-5 text-primary" />
                  <span className="text-xs text-muted-foreground">{moodLabels[j.mood] || j.mood}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(j)} className="p-1.5 text-accent hover:bg-accent/10 rounded-lg"><PenTool className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(j.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-foreground whitespace-pre-wrap">{j.content}</p>
              {j.reflection && (
                <div className="mt-3 p-3 bg-accent/5 rounded-xl border border-accent/10">
                  <p className="text-xs font-semibold text-accent mb-1">Refleksi:</p>
                  <p className="text-sm text-muted-foreground">{j.reflection}</p>
                </div>
              )}
            </div>
          );
        })}
        {journals.length === 0 && !showForm && <div className="text-center py-12 text-muted-foreground">Belum ada jurnal. Mulai tulis jurnal pertamamu!</div>}
      </div>
    </div>
  );
}
