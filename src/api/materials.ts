import apiClient from './client';

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
  type: 'article' | 'video' | 'pdf' | 'link' | 'image';
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

export async function getMaterials(params?: { category_id?: number; type?: string; search?: string; page?: number }): Promise<MaterialResponse> {
  const queryParams: any = {};
  if (params?.category_id) queryParams.category_id = params.category_id;
  if (params?.type) queryParams.type = params.type;
  if (params?.search) queryParams.search = params.search;
  if (params?.page) queryParams.page = params.page;

  const { data } = await apiClient.get('/materials', { params: queryParams });
  return {
    materials: data.materials || [],
    total: data.total || 0,
    current_page: data.current_page || 1,
  };
}

export async function getMaterial(id: number): Promise<SingleMaterialResponse> {
  const { data } = await apiClient.get(`/materials/${id}`);
  return { material: data.material };
}

export async function createMaterial(dataBody: {
  title: string; description?: string; type: string; file_url?: string; video_url?: string; category_id?: number;
}): Promise<{ message: string; material: Material }> {
  const { data } = await apiClient.post('/materials', dataBody);
  return { message: data.message, material: data.material };
}

export async function updateMaterial(id: number, payload: Partial<Material>): Promise<{ message: string; material: Material }> {
  const { data } = await apiClient.put(`/materials/${id}`, payload);
  return { message: data.message, material: data.material };
}

export async function deleteMaterial(id: number): Promise<{ message: string }> {
  const { data } = await apiClient.delete(`/materials/${id}`);
  return { message: data.message };
}

export async function getCategories(): Promise<CategoriesResponse> {
  const { data } = await apiClient.get('/materials/categories');
  return { categories: data.categories || [] };
}

export async function createCategory(name: string): Promise<CategoryResponse> {
  const { data } = await apiClient.post('/materials/categories', { name });
  return { message: data.message, category: data.category };
}

export async function deleteCategory(id: number): Promise<{ message: string }> {
  const { data } = await apiClient.delete(`/materials/categories/${id}`);
  return { message: data.message };
}

export async function uploadFile(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/materials/upload', formData, {
    headers: { 'Content-Type': undefined },
  });
  return { url: data.url };
}

export async function markRead(materialId: number): Promise<{ message: string }> {
  const { data } = await apiClient.post(`/materials/${materialId}/read`);
  return { message: data.message };
}

export const markAsRead = markRead;

export async function getMyReadings(): Promise<{ readings: { material_id: number; read_at: string }[] }> {
  const { data } = await apiClient.get('/materials/readings');
  return { readings: data.readings || [] };
}
