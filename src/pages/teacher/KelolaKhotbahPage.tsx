import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import * as sermonApi from '../../api/sermon';
import type { SermonTopic } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

export function KelolaKhotbahPage() {
  const { t } = useLanguage();
  const [topics, setTopics] = useState<SermonTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const res = await sermonApi.getAllTopics();
      setTopics(res.topics);
    } catch {
      setError(t.errorLoadSermon);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormTitle('');
    setFormDesc('');
    setError('');
  };

  const handleEdit = (topic: SermonTopic) => {
    setEditingId(topic.id);
    setFormTitle(topic.title);
    setFormDesc(topic.description);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      setError(t.titleRequired);
      return;
    }
    setError('');
    try {
      if (editingId) {
        await sermonApi.updateTopic(editingId, {
          title: formTitle,
          description: formDesc,
        });
        setSuccess(t.successSavedSermon);
      } else {
        await sermonApi.createTopic(formTitle, formDesc);
        setSuccess(t.successAddedSermon);
      }
      resetForm();
      await loadTopics();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError(t.errorSaveSermon);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDeleteSermon)) return;
    try {
      await sermonApi.deleteTopic(id);
      setSuccess(t.successDeletedSermon);
      await loadTopics();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError(t.errorDeleteSermon);
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
          <h2 className="text-3xl font-bold text-foreground">{t.manageSermonTitle}</h2>
          <p className="text-muted-foreground mt-1">{t.manageSermonSubtitle}</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
        >
          <Plus className="w-5 h-5" /> {t.addSermon}
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <Check className="w-4 h-4" /> {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4">
            {editingId ? t.editSermon : t.addNewSermon}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2">{t.sermonTitleField}</label>
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={t.sermonPlaceholder}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2">{t.sermonDescription}</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring h-24 resize-none"
                placeholder={t.descriptionPlaceholder}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all"
              >
                {editingId ? t.saveChanges : t.add}
              </button>
              <button
                onClick={resetForm}
                className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-xl font-semibold hover:bg-secondary/80 transition-all"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-3xl border border-border shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="text-left p-4 font-semibold text-foreground">{t.title}</th>
              <th className="text-left p-4 font-semibold text-foreground">{t.description}</th>
              <th className="text-left p-4 font-semibold text-foreground">{t.status}</th>
              <th className="text-left p-4 font-semibold text-foreground">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {topics.map((topic) => (
              <tr key={topic.id} className="hover:bg-secondary/50 transition-all">
                <td className="p-4 font-semibold text-foreground">{topic.title}</td>
                <td className="p-4 text-muted-foreground text-sm">
                  {topic.description || '-'}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${topic.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {topic.is_active ? t.active : t.inactive}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(topic)}
                      className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(topic.id)}
                      className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {topics.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  {t.noSermonData}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
