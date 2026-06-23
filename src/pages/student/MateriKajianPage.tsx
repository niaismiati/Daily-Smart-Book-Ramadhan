import { useEffect, useState } from 'react';
import { BookOpen, FileText, Video, Image as ImageIcon, Search, ChevronRight, ExternalLink, CheckCircle } from 'lucide-react';
import * as materialsApi from '../../api/materials';
import { useLanguage } from '../../i18n/LanguageContext';

export function MateriKajianPage() {
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; materials_count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [readIds, setReadIds] = useState<number[]>([]);

  useEffect(() => { loadMaterials(); loadReadings(); }, [filterCategory, search]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const [matRes, catRes] = await Promise.all([
        materialsApi.getMaterials({
          category_id: filterCategory ? Number(filterCategory) : undefined,
          search: search || undefined,
        }),
        materialsApi.getCategories(),
      ]);
      setMaterials(matRes.materials || []);
      setCategories(catRes.categories);
    } catch { } finally { setLoading(false); }
  };

  const loadReadings = async () => {
    try {
      const res = await materialsApi.getMyReadings();
      setReadIds(res.readings?.map((r: any) => r.material_id) || []);
    } catch { }
  };

  const handleRead = async (material: any) => {
    setSelectedMaterial(material);
  };

  const handleMarkAsRead = async (materialId: number) => {
    try {
      await materialsApi.markAsRead(materialId);
      setReadIds((prev) => [...new Set([...prev, materialId])]);
    } catch { }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'pdf': return <FileText className="w-5 h-5" />;
      case 'image': return <ImageIcon className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div><h2 className="text-3xl font-bold text-foreground">{t.materialsListTitle}</h2><p className="text-muted-foreground mt-1">{t.materialsListSubtitle}</p></div>

      {/* Search & Filter */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" placeholder={t.searchMaterials} />
        </div>
        <button onClick={() => setFilterCategory('')} className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${!filterCategory ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>{t.allFilter} ({materials.length})</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setFilterCategory(String(c.id))} className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${filterCategory === String(c.id) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
            {c.name} ({c.materials_count})
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((m) => {
          const isRead = readIds.includes(m.id);
          return (
            <div key={m.id} className="bg-card rounded-3xl border border-border p-5 shadow-lg hover:shadow-xl transition-all hover:border-primary/30 cursor-pointer" onClick={() => handleRead(m)}>
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 bg-primary/10 text-primary rounded-xl">{getIcon(m.type)}</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase">{m.type}</span>
                {isRead && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
              </div>
              <h3 className="font-bold text-foreground mb-2">{m.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{m.description || t.noDescription}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-secondary px-3 py-1 rounded-lg text-muted-foreground">{m.category?.name || t.generalCategory}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          );
        })}
        {materials.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">{t.noMaterials}</div>}
      </div>

      {/* Detail Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMaterial(null)}>
          <div className="bg-card rounded-3xl border border-border p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground">{selectedMaterial.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedMaterial.category?.name} — {selectedMaterial.type}</p>
              </div>
              <button onClick={() => setSelectedMaterial(null)} className="text-muted-foreground hover:text-foreground"><ChevronRight className="w-5 h-5 rotate-180" /></button>
            </div>

            {selectedMaterial.description && <p className="text-foreground mb-4">{selectedMaterial.description}</p>}

            {selectedMaterial.type === 'video' && selectedMaterial.video_url && (
              <div className="aspect-video rounded-xl overflow-hidden mb-4">
                <iframe src={selectedMaterial.video_url} className="w-full h-full" allowFullScreen onLoad={() => handleMarkAsRead(selectedMaterial.id)}></iframe>
              </div>
            )}

            {selectedMaterial.type === 'pdf' && (
              selectedMaterial.file_url ? (
                <div className="mb-4">
                  <div className="rounded-xl overflow-hidden border border-border" style={{ height: '500px' }}>
                    <iframe
                      src={selectedMaterial.file_url}
                      className="w-full h-full"
                      title={selectedMaterial.title}
                    />
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <a
                      href={selectedMaterial.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleMarkAsRead(selectedMaterial.id)}
                      className="flex items-center gap-2 text-sm text-primary hover:underline font-semibold"
                    >
                      <ExternalLink className="w-4 h-4" /> {t.openFile} (Tab Baru)
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-foreground">{t.pdfFile}</p>
                    <p className="text-sm text-muted-foreground">File PDF belum tersedia</p>
                  </div>
                </div>
              )
            )}

            {selectedMaterial.type === 'article' && selectedMaterial.file_url && (
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
                <div><p className="font-semibold text-foreground">{t.articleType}</p><a href={selectedMaterial.file_url} target="_blank" rel="noopener noreferrer" onClick={() => handleMarkAsRead(selectedMaterial.id)} className="text-sm text-primary hover:underline">{t.readFull} <ExternalLink className="w-3 h-3 inline" /></a></div>
              </div>
            )}

            {selectedMaterial.type === 'image' && selectedMaterial.file_url && (
              <img src={selectedMaterial.file_url} alt={selectedMaterial.title} className="w-full rounded-xl mb-4" onLoad={() => handleMarkAsRead(selectedMaterial.id)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
