interface MaterialCategory {
  id: number;
  name: string;
  slug: string;
  materials_count: number;
}

interface Material {
  id: number;
  title: string;
  description?: string;
  type: 'article' | 'video' | 'pdf' | 'link';
  file_url: string | null;
  video_url: string | null;
  thumbnail: string | null;
  category_id: number;
  category: { id: number; name: string } | null;
  created_by: number;
  creator: { id: number; name: string };
  is_active: boolean;
  created_at: string;
}

interface MaterialResponse {
  materials: Material[];
  total: number;
  current_page: number;
}

interface SingleMaterialResponse {
  material: Material;
}

interface CategoriesResponse {
  categories: MaterialCategory[];
}

interface CategoryResponse {
  message: string;
  category: MaterialCategory;
}

const CATEGORIES_KEY = 'smartbook_material_categories';
const MATERIALS_KEY = 'smartbook_materials';

function getStoredCategories(): MaterialCategory[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCategories(list: MaterialCategory[]) {
  try { localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list)); } catch {}
}

function getStoredMaterials(): Material[] {
  try {
    const raw = localStorage.getItem(MATERIALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMaterials(list: Material[]) {
  try { localStorage.setItem(MATERIALS_KEY, JSON.stringify(list)); } catch {}
}

const DEFAULT_CATEGORIES: MaterialCategory[] = [
  { id: 1, name: 'Puasa', slug: 'puasa', materials_count: 0 },
  { id: 2, name: 'Shalat', slug: 'shalat', materials_count: 0 },
  { id: 3, name: 'Doa', slug: 'doa', materials_count: 0 },
];

function getAllCategories(): MaterialCategory[] {
  const stored = getStoredCategories();
  const merged = [...DEFAULT_CATEGORIES];
  for (const s of stored) {
    const idx = merged.findIndex((c) => c.id === s.id);
    if (idx >= 0) merged[idx] = s;
    else merged.push(s);
  }
  // hitung jumlah materi per kategori
  const allMats = getAllMaterials();
  for (const cat of merged) {
    cat.materials_count = allMats.filter((m) => m.category_id === cat.id).length;
  }
  return merged;
}

function getAllMaterials(): Material[] {
  return getStoredMaterials();
}

let nextCatId = 50;
let nextMatId = 50;

export async function getMaterials(params?: { category_id?: number; type?: string; search?: string; page?: number }): Promise<MaterialResponse> {
  let filtered = getAllMaterials().filter((m) => m.is_active);
  if (params?.category_id) filtered = filtered.filter((m) => m.category_id === params.category_id);
  if (params?.type) filtered = filtered.filter((m) => m.type === params.type);
  if (params?.search) filtered = filtered.filter((m) => m.title.toLowerCase().includes(params.search!.toLowerCase()));
  return { materials: filtered, total: filtered.length, current_page: params?.page || 1 };
}

export async function getMaterial(id: number): Promise<SingleMaterialResponse> {
  const material = getAllMaterials().find((m) => m.id === id) || null;
  return { material: material as Material };
}

export async function createMaterial(data: {
  title: string; description?: string; type: string; file_url?: string; video_url?: string; category_id?: number;
}): Promise<{ message: string; material: Material }> {
  const categories = getAllCategories();
  const cat = categories.find((c) => c.id === data.category_id);
  const material: Material = {
    id: ++nextMatId,
    title: data.title,
    description: data.description || '',
    type: data.type as Material['type'],
    file_url: data.file_url || null,
    video_url: data.video_url || null,
    thumbnail: null,
    category_id: data.category_id || 0,
    category: cat ? { id: cat.id, name: cat.name } : null,
    created_by: 1,
    creator: { id: 1, name: 'Guru Pembimbing' },
    is_active: true,
    created_at: new Date().toISOString(),
  };
  const all = getStoredMaterials();
  all.push(material);
  saveMaterials(all);
  return { message: 'Materi berhasil ditambahkan', material };
}

export async function updateMaterial(id: number, payload: Partial<Material>): Promise<{ message: string; material: Material }> {
  const all = getStoredMaterials();
  const idx = all.findIndex((m) => m.id === id);
  if (idx < 0) throw new Error('Materi tidak ditemukan');
  all[idx] = { ...all[idx], ...payload };
  if (payload.category_id) {
    const categories = getAllCategories();
    const cat = categories.find((c) => c.id === payload.category_id);
    if (cat) all[idx].category = { id: cat.id, name: cat.name };
  }
  saveMaterials(all);
  return { message: 'Materi berhasil diubah', material: all[idx] };
}

export async function deleteMaterial(id: number): Promise<{ message: string }> {
  const all = getStoredMaterials();
  const idx = all.findIndex((m) => m.id === id);
  if (idx >= 0) {
    all.splice(idx, 1);
    saveMaterials(all);
  }
  return { message: 'Materi berhasil dihapus' };
}

export async function getCategories(): Promise<CategoriesResponse> {
  return { categories: getAllCategories() };
}

export async function createCategory(name: string): Promise<CategoryResponse> {
  const categories = getStoredCategories();
  const cat: MaterialCategory = {
    id: ++nextCatId,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    materials_count: 0,
  };
  categories.push(cat);
  saveCategories(categories);
  return { message: 'Kategori ditambahkan', category: cat };
}

export async function deleteCategory(id: number): Promise<{ message: string }> {
  const categories = getStoredCategories();
  const idx = categories.findIndex((c) => c.id === id);
  if (idx >= 0) {
    categories.splice(idx, 1);
    saveCategories(categories);
  }
  return { message: 'Kategori berhasil dihapus' };
}

export async function uploadFile(file: File): Promise<{ url: string }> {
  return { url: URL.createObjectURL(file) };
}

export async function markRead(materialId: number): Promise<{ message: string }> {
  return { message: 'Tercatat' };
}

export const markAsRead = markRead;

export async function getMyReadings(): Promise<{ readings: { material_id: number; read_at: string }[] }> {
  return { readings: [] };
}