import { useEffect, useState } from 'react';
import { Award, Trophy, Star, Activity, TrendingUp, Users, Check } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import * as prayerApi from '../../api/prayer';
import * as fridayApi from '../../api/friday';
import * as sermonApi from '../../api/sermon';
import type { PrayerTracking, ShalatKey, SermonTopic } from '../../types';

const PRAYER_LIST: { key: ShalatKey; label: string; icon: string }[] = [
  { key: 'subuh', label: 'Shalat Subuh', icon: '🌅' },
  { key: 'dzuhur', label: 'Shalat Dzuhur', icon: '☀️' },
  { key: 'ashar', label: 'Shalat Ashar', icon: '🌤️' },
  { key: 'maghrib', label: 'Shalat Maghrib', icon: '🌆' },
  { key: 'isya', label: 'Shalat Isya', icon: '🌙' },
];

export function TrackerPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tracking, setTracking] = useState<PrayerTracking | null>(null);
  const [jumatData, setJumatData] = useState<{
    sudahJumat: boolean;
    khatibName: string;
    sermonTopicId: number | null;
    summary: string;
    lesson: string;
  }>({ sudahJumat: false, khatibName: '', sermonTopicId: null, summary: '', lesson: '' });
  const [sermonTopics, setSermonTopics] = useState<SermonTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const dateStr = selectedDate.toISOString().split('T')[0];
  const isFriday = selectedDate.getDay() === 5;

  useEffect(() => {
    loadData();
  }, [dateStr]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [prayerRes, fridayRes, topicsRes] = await Promise.all([
        prayerApi.getPrayerTracking(dateStr),
        fridayApi.getFridayPrayer(dateStr),
        sermonApi.getActiveTopics(),
      ]);
      setTracking(prayerRes.tracking);
      setSermonTopics(topicsRes.topics);

      if (fridayRes.friday_prayer) {
        setJumatData({
          sudahJumat: true,
          khatibName: fridayRes.friday_prayer.khatib_name,
          sermonTopicId: fridayRes.friday_prayer.sermon_topic_id,
          summary: fridayRes.friday_prayer.summary,
          lesson: fridayRes.friday_prayer.lesson,
        });
      } else {
        setJumatData({ sudahJumat: false, khatibName: '', sermonTopicId: null, summary: '', lesson: '' });
      }
    } catch {
      setError('Gagal memuat data. Pastikan server backend berjalan.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShalat = async (key: ShalatKey) => {
    if (!tracking) return;
    const current = tracking[`${key}_checked` as keyof PrayerTracking] as boolean;
    try {
      const res = await prayerApi.updatePrayer(dateStr, key, !current);
      setTracking(res.tracking);
    } catch {
      setError('Gagal menyimpan data shalat.');
    }
  };

  const handleBerjamaah = async (key: ShalatKey, value: boolean) => {
    try {
      const res = await prayerApi.updatePrayer(dateStr, key, true, value);
      setTracking(res.tracking);
    } catch {
      setError('Gagal menyimpan status berjamaah.');
    }
  };

  const handleJumatToggle = async (checked: boolean) => {
    setJumatData((prev) => ({ ...prev, sudahJumat: checked }));
    if (!checked) {
      setJumatData({ sudahJumat: false, khatibName: '', sermonTopicId: null, summary: '', lesson: '' });
    }
  };

  const handleSaveJumat = async () => {
    if (!jumatData.summary || jumatData.summary.length < 10) {
      setError('Ringkasan khotbah wajib diisi minimal 10 karakter.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await fridayApi.saveFridayPrayer({
        date: dateStr,
        khatib_name: jumatData.khatibName,
        sermon_topic_id: jumatData.sermonTopicId ?? undefined,
        summary: jumatData.summary,
        lesson: jumatData.lesson,
      });
      setSuccess('Data Shalat Jumat berhasil disimpan!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Gagal menyimpan data Shalat Jumat.');
    } finally {
      setSaving(false);
    }
  };

  const completedShalat = tracking
    ? PRAYER_LIST.filter((p) => tracking[`${p.key}_checked` as keyof PrayerTracking]).length
    : 0;
  const percentage = Math.round((completedShalat / 5) * 100);

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
        <h2 className="text-3xl font-bold text-foreground">Tracker Ibadah Harian</h2>
        <p className="text-muted-foreground mt-1">Pantau dan catat ibadahmu setiap hari</p>
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

      {/* Date Picker */}
      <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-foreground">Pilih Tanggal:</label>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
            className="px-4 py-2 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-primary to-emerald-700 rounded-3xl p-8 text-white shadow-2xl">
          <h3 className="text-2xl font-bold mb-6">Progress Hari Ini</h3>
          <div className="flex items-center gap-8">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.2)" strokeWidth="12" fill="none" />
                <circle
                  cx="80" cy="80" r="70" stroke="#d4af37" strokeWidth="12" fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentage / 100)}`}
                  className="transition-all duration-500" strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold">{percentage}%</p>
                  <p className="text-emerald-200 text-sm">Selesai</p>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <p className="text-emerald-100 text-sm mb-1">Tercatat</p>
                  <p className="text-3xl font-bold">{completedShalat}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <p className="text-emerald-100 text-sm mb-1">Tersisa</p>
                  <p className="text-3xl font-bold">{5 - completedShalat}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4">Pencapaian</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-xl border border-accent/20">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Konsisten 7 Hari</p>
                <p className="text-xs text-muted-foreground">Unlocked</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl border border-primary/20">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Konsisten 15 Hari</p>
                <p className="text-xs text-muted-foreground">Unlocked</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl opacity-50">
              <div className="w-12 h-12 bg-gray-400 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Konsisten 30 Hari</p>
                <p className="text-xs text-muted-foreground">Locked</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Shalat 5 Waktu + Berjamaah */}
      <div className="bg-card rounded-3xl border border-border p-8 shadow-lg">
        <h3 className="text-xl font-bold text-foreground mb-6">Monitoring Shalat Harian</h3>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Tanggal</p>
            <p className="font-semibold text-foreground">{dateStr}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Progress Shalat</p>
            <p className="text-2xl font-bold text-primary">{percentage}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRAYER_LIST.map((item) => {
            const checked = tracking?.[`${item.key}_checked` as keyof PrayerTracking] as boolean ?? false;
            const berjamaah = tracking?.[`${item.key}_berjamaah` as keyof PrayerTracking] as boolean ?? false;

            return (
              <div key={item.key} className="bg-secondary/40 border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">Status: {checked ? 'Sudah' : 'Belum'}</p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleShalat(item.key)}
                      className="w-5 h-5 rounded border-border text-primary focus:ring-ring"
                    />
                    <span className="text-sm font-semibold text-primary">{checked ? 'Tercatat' : 'Catat'}</span>
                  </label>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleBerjamaah(item.key, true)}
                    disabled={!checked}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${
                      checked && berjamaah
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border text-muted-foreground hover:bg-secondary/60'
                    } disabled:opacity-50`}
                  >
                    Berjamaah
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBerjamaah(item.key, false)}
                    disabled={!checked}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${
                      checked && !berjamaah
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border text-muted-foreground hover:bg-secondary/60'
                    } disabled:opacity-50`}
                  >
                    Tidak Berjamaah
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shalat Jumat - Only active on Friday */}
      <div className={`bg-card rounded-3xl border border-border p-8 shadow-lg ${!isFriday ? 'opacity-60' : ''}`}>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-xl font-bold text-foreground">Shalat Jumat</h3>
          {!isFriday && (
            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-lg text-xs font-semibold">
              Hanya aktif di hari Jumat
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Status Shalat Jumat</p>
            <p className="text-2xl font-bold text-primary">{jumatData.sudahJumat ? 'Sudah' : 'Belum'}</p>
          </div>

          <label className="flex items-center gap-3 bg-secondary/40 border border-border rounded-2xl px-5 py-4 cursor-pointer">
            <input
              type="checkbox"
              checked={jumatData.sudahJumat}
              onChange={(e) => handleJumatToggle(e.target.checked)}
              disabled={!isFriday}
              className="w-6 h-6 rounded border-border text-primary focus:ring-ring"
            />
            <span className="font-semibold text-foreground">Sudah Shalat Jumat</span>
          </label>
        </div>

        {jumatData.sudahJumat && isFriday && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-2">Nama Khatib</label>
                <input
                  value={jumatData.khatibName}
                  onChange={(e) => setJumatData((prev) => ({ ...prev, khatibName: e.target.value }))}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Masukkan nama khatib"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-2">Judul/Materi Khotbah</label>
                <select
                  value={jumatData.sermonTopicId ?? ''}
                  onChange={(e) => setJumatData((prev) => ({ ...prev, sermonTopicId: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">-- Pilih Materi Khotbah --</option>
                  {sermonTopics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-muted-foreground mb-2">
                Ringkasan Isi Khotbah <span className="text-destructive">*</span>
              </label>
              <textarea
                value={jumatData.summary}
                onChange={(e) => setJumatData((prev) => ({ ...prev, summary: e.target.value }))}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring h-28 resize-none"
                placeholder="Tulis ringkasan khotbah (minimal 10 karakter)..."
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-muted-foreground mb-2">Pelajaran yang Didapat</label>
              <textarea
                value={jumatData.lesson}
                onChange={(e) => setJumatData((prev) => ({ ...prev, lesson: e.target.value }))}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring h-20 resize-none"
                placeholder="Tuliskan pelajaran / hikmah..."
              />
            </div>

            <div className="mt-6">
              <button
                onClick={handleSaveJumat}
                disabled={saving}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Data Shalat Jumat'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
