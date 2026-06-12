import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Circle, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import * as doaApi from '../../api/doa';
import { useLanguage } from '../../i18n/LanguageContext';
import type { DoaMaterial, DoaTracking } from '../../types';

const CATEGORY_LABELS: Record<string, string> = {
  niat_puasa: 'Niat Puasa Ramadhan',
  berbuka: 'Doa Berbuka Puasa',
  after_berbuka: 'Doa Setelah Berbuka',
  sahur: 'Doa Sahur',
  lailatul_qadar: 'Doa Malam Lailatul Qadar',
};

const CATEGORY_ICONS: Record<string, string> = {
  niat_puasa: '🌙',
  berbuka: '🥥',
  after_berbuka: '🙏',
  sahur: '🌅',
  lailatul_qadar: '⭐',
};

export function DoaPage() {
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<DoaMaterial[]>([]);
  const [trackings, setTrackings] = useState<Record<number, DoaTracking>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [matRes, trackRes] = await Promise.all([
        doaApi.getActiveDoa(),
        doaApi.getDoaTrackings(),
      ]);
      setMaterials(matRes.materials);
      setTrackings(trackRes.trackings ?? {});
    } catch {
      toast.error(t.errorOccurred || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (materialId: number, memorized: boolean) => {
    try {
      const res = await doaApi.toggleDoaTracking(materialId, memorized);
      setTrackings((prev) => ({
        ...prev,
        [materialId]: res.tracking,
      }));
      toast.success(memorized ? 'Ditandai hafal' : 'Ditandai belum hafal');
    } catch {
      toast.error(t.errorOccurred || 'Gagal');
    }
  };

  const groupedMaterials = materials.reduce(
    (acc, m) => {
      if (!acc[m.category]) acc[m.category] = [];
      acc[m.category].push(m);
      return acc;
    },
    {} as Record<string, DoaMaterial[]>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">{t.doaTitle || 'Doa-Doa Puasa Ramadhan'}</h2>
        <p className="text-muted-foreground mt-1">{t.doaSubtitle || 'Pelajari dan hafalkan doa-doa harian'}</p>
      </div>

      {Object.entries(groupedMaterials).map(([category, items]) => (
        <div key={category} className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="text-2xl">{CATEGORY_ICONS[category]}</span>
            {CATEGORY_LABELS[category]}
          </h3>

          <div className="space-y-4">
            {items.map((material) => {
              const tracking = trackings[material.id];
              const memorized = tracking?.memorized ?? false;
              const isExpanded = expandedId === material.id;

              return (
                <div
                  key={material.id}
                  className="bg-secondary/30 border border-border rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : material.id)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-foreground">{material.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(material.id, !memorized);
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          memorized
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        {memorized ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                        {memorized ? (t.unlocked || 'Sudah Hafal') : (t.achievement || 'Tandai Hafal')}
                      </button>
                      <span className="text-muted-foreground transition-transform duration-200">
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4">
                      <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-right text-3xl font-arabic leading-loose text-foreground" dir="rtl">
                          {material.arabic_text}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Latin:</p>
                        <p className="text-foreground italic">{material.latin_text}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{t.translation}:</p>
                        <p className="text-foreground">{material.translation}</p>
                      </div>
                      {material.audio_url && (
                        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                          <Volume2 className="w-5 h-5 text-primary" />
                          <audio controls src={material.audio_url} className="flex-1 h-10">
                            {t.noData}
                          </audio>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {materials.length === 0 && (
        <div className="bg-card rounded-3xl border border-border p-12 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold text-foreground">{t.noData}</p>
          <p className="text-muted-foreground mt-1">{t.noData}</p>
        </div>
      )}
    </div>
  );
}
