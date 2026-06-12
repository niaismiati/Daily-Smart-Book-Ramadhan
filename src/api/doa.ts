import type { DoaMaterial, DoaTracking } from '../types';

interface DoaListResponse {
  materials: DoaMaterial[];
}

interface DoaResponse {
  message: string;
  material: DoaMaterial;
}

interface TrackingListResponse {
  trackings: Record<number, DoaTracking>;
}

interface TrackingResponse {
  message: string;
  tracking: DoaTracking;
}

const STORAGE_KEY = 'smartbook_doa_materials';

const DEFAULT_DOA: DoaMaterial[] = [
  { id: 1, title: 'Niat Puasa Ramadhan', arabic_text: 'نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هَذِهِ السَّنَةِ لِلَّهِ تَعَالَى', latin_text: 'Nawaitu shauma ghadin an adai fardhi syahri ramadhana hadzihis sanati lillahi ta\'ala', translation: 'Aku niat berpuasa esok hari untuk menunaikan kewajiban puasa bulan Ramadhan tahun ini karena Allah Ta\'ala', audio_url: null, category: 'niat_puasa', is_active: true, created_by: 1, creator: { id: 1, name: 'Guru Pembimbing' }, created_at: '2025-01-01T00:00:00.000Z' },
  { id: 2, title: 'Doa Berbuka Puasa', arabic_text: 'اللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ', latin_text: 'Allahumma laka shumtu wa bika aamantu wa ala rizqika afthartu', translation: 'Ya Allah, untuk-Mu aku berpuasa, kepada-Mu aku beriman, dan dengan rezeki-Mu aku berbuka', audio_url: null, category: 'berbuka', is_active: true, created_by: 1, creator: { id: 1, name: 'Guru Pembimbing' }, created_at: '2025-01-01T00:00:00.000Z' },
  { id: 3, title: 'Doa Setelah Berbuka', arabic_text: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ', latin_text: 'Dzahabaz zhama\'u wabtallatil \'uruqu wa tsabatal ajru insya Allah', translation: 'Telah hilang rasa haus, urat-urat telah basah, dan pahala telah ditetapkan insya Allah', audio_url: null, category: 'after_berbuka', is_active: true, created_by: 1, creator: { id: 1, name: 'Guru Pembimbing' }, created_at: '2025-01-01T00:00:00.000Z' },
];

function getStoredDoa(): DoaMaterial[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveStoredDoa(list: DoaMaterial[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

function getAllMaterials(): DoaMaterial[] {
  const stored = getStoredDoa();
  const merged = [...DEFAULT_DOA];
  for (const s of stored) {
    const idx = merged.findIndex((m) => m.id === s.id);
    if (idx >= 0) merged[idx] = s;
    else merged.push(s);
  }
  return merged;
}

let nextId = 100;

export async function getActiveDoa(): Promise<DoaListResponse> {
  return { materials: getAllMaterials().filter((d) => d.is_active) };
}

export async function getAllDoa(): Promise<DoaListResponse> {
  return { materials: getAllMaterials() };
}

export async function createDoa(payload: {
  title: string; arabic_text: string; latin_text: string; translation: string;
  audio_url?: string; category: string;
}): Promise<DoaResponse> {
  const newDoa: DoaMaterial = {
    id: ++nextId,
    title: payload.title,
    arabic_text: payload.arabic_text,
    latin_text: payload.latin_text,
    translation: payload.translation,
    audio_url: payload.audio_url || null,
    category: payload.category as DoaMaterial['category'],
    is_active: true,
    created_by: 1,
    creator: { id: 1, name: 'Guru Pembimbing' },
    created_at: new Date().toISOString(),
  };
  const stored = getStoredDoa();
  stored.push(newDoa);
  saveStoredDoa(stored);
  return { message: 'Materi doa berhasil ditambahkan', material: newDoa };
}

export async function updateDoa(id: number, payload: Partial<DoaMaterial>): Promise<DoaResponse> {
  const stored = getStoredDoa();
  const idx = stored.findIndex((d) => d.id === id);
  if (idx >= 0) {
    stored[idx] = { ...stored[idx], ...payload };
    saveStoredDoa(stored);
    return { message: 'Materi doa berhasil diubah', material: stored[idx] };
  }
  throw new Error('Doa tidak ditemukan');
}

export async function deleteDoa(id: number): Promise<{ message: string }> {
  const stored = getStoredDoa();
  const idx = stored.findIndex((d) => d.id === id);
  if (idx >= 0) {
    stored.splice(idx, 1);
    saveStoredDoa(stored);
  }
  return { message: 'Materi doa berhasil dihapus' };
}

export async function getDoaTrackings(): Promise<TrackingListResponse> {
  return { trackings: {} };
}

export async function toggleDoaTracking(doaMaterialId: number, memorized: boolean): Promise<TrackingResponse> {
  return { message: 'Status diubah', tracking: { id: 0, user_id: 1, doa_material_id: doaMaterialId, memorized, read_at: new Date().toISOString() } };
}