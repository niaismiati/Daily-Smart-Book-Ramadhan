import apiClient from './client';
import type { User } from '../types';

const MOCK_CLASSES = ['9A', '9B', '9C'];
const MOCK_STUDENTS: User[] = [
  { id: 1, name: 'Ahmad Fauzan', role: 'siswa', nisn: '1234567890', class: '9A', email: 'ahmad@student.sch.id', nip: null, phone: '081234567890' },
  { id: 2, name: 'Fatimah Azzahra', role: 'siswa', nisn: '0987654321', class: '9B', email: 'fatimah@student.sch.id', nip: null, phone: null },
  { id: 3, name: 'Muhammad Alif', role: 'siswa', nisn: '1122334455', class: '9C', email: 'alif@student.sch.id', nip: null, phone: null },
  { id: 4, name: 'Siti Nurhaliza', role: 'siswa', nisn: '5566778899', class: '9A', email: 'siti@student.sch.id', nip: null, phone: null },
  { id: 5, name: 'Aisyah Ramadhani', role: 'siswa', nisn: '9988776655', class: '9A', email: 'aisyah@student.sch.id', nip: null, phone: null },
  { id: 6, name: 'Zaki Abdullah', role: 'siswa', nisn: '5544332211', class: '9B', email: 'zaki@student.sch.id', nip: null, phone: null },
  { id: 7, name: 'Nabila Putri', role: 'siswa', nisn: '6677889900', class: '9A', email: 'nabila@student.sch.id', nip: null, phone: null },
  { id: 8, name: 'Farhan Maulana', role: 'siswa', nisn: '4433221100', class: '9C', email: 'farhan@student.sch.id', nip: null, phone: null },
];

export async function getStudents(params?: {
  search?: string; class_id?: number; status?: string; per_page?: number; page?: number;
}): Promise<{ data: User[]; total: number; current_page: number }> {
  try {
    const { data } = await apiClient.get('/teacher/students', { params });
    return data;
  } catch {
    let filtered = [...MOCK_STUDENTS];
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter((u) => u.name.toLowerCase().includes(s) || u.nisn?.includes(s));
    }
    if (params?.class_id) {
      const className = MOCK_CLASSES[params.class_id - 1] || '';
      filtered = filtered.filter((u) => u.class === className);
    }
    if (params?.status === 'active') filtered = filtered.filter((u) => true);
    if (params?.status === 'inactive') filtered = [];
    return { data: filtered, total: filtered.length, current_page: 1 };
  }
}

export async function createStudent(data: {
  name: string; nisn: string; class_id?: number; email?: string; password: string;
}): Promise<{ message: string; student: User }> {
  try {
    const res = await apiClient.post('/teacher/students', data);
    return res.data;
  } catch {
    const student: User = { id: Date.now(), role: 'siswa', ...data, nisn: data.nisn, class: MOCK_CLASSES[(data.class_id || 1) - 1], email: data.email || null, nip: null, phone: null };
    MOCK_STUDENTS.push(student);
    return { message: 'Siswa ditambahkan (mode development)', student };
  }
}

export async function updateStudent(id: number, data: Partial<User>): Promise<{ message: string; student: User }> {
  try {
    const res = await apiClient.put(`/teacher/students/${id}`, data);
    return res.data;
  } catch {
    const idx = MOCK_STUDENTS.findIndex((s) => s.id === id);
    if (idx !== -1) MOCK_STUDENTS[idx] = { ...MOCK_STUDENTS[idx], ...data };
    return { message: 'Siswa diubah (mode development)', student: MOCK_STUDENTS[idx] || MOCK_STUDENTS[0] };
  }
}

export async function deleteStudent(id: number): Promise<{ message: string }> {
  try {
    const res = await apiClient.delete(`/teacher/students/${id}`);
    return res.data;
  } catch {
    const idx = MOCK_STUDENTS.findIndex((s) => s.id === id);
    if (idx !== -1) MOCK_STUDENTS.splice(idx, 1);
    return { message: 'Siswa dihapus (mode development)' };
  }
}

export async function resetPassword(id: number, password: string): Promise<{ message: string }> {
  try {
    const res = await apiClient.post(`/teacher/students/${id}/reset-password`, { password });
    return res.data;
  } catch {
    return { message: 'Password direset (mode development)' };
  }
}

export async function importStudents(students: { name: string; nisn: string; class_id: number; password: string }[]): Promise<{ message: string; imported: number }> {
  try {
    const res = await apiClient.post('/teacher/students/import', { students });
    return res.data;
  } catch {
    let imported = 0;
    for (const s of students) {
      if (!MOCK_STUDENTS.find((u) => u.nisn === s.nisn)) {
        MOCK_STUDENTS.push({ id: Date.now() + imported, role: 'siswa', ...s, nisn: s.nisn, class: MOCK_CLASSES[s.class_id - 1] || '', email: null, nip: null, phone: null } as User);
        imported++;
      }
    }
    return { message: `${imported} siswa diimpor (mode development)`, imported };
  }
}

export async function exportStudents(classId?: number): Promise<{ students: Record<string, string>[] }> {
  try {
    const res = await apiClient.get('/teacher/students/export', { params: { class_id: classId } });
    return res.data;
  } catch {
    let list = [...MOCK_STUDENTS];
    if (classId) list = list.filter((s) => s.class === MOCK_CLASSES[classId - 1]);
    const students = list.map((s) => ({ Nama: s.name, NISN: s.nisn || '', Kelas: s.class || '', Email: s.email || '', Status: 'Aktif' }));
    return { students };
  }
}

export async function getClasses(): Promise<{ classes: string[] }> {
  try {
    const res = await apiClient.get('/teacher/classes');
    return res.data;
  } catch {
    return { classes: MOCK_CLASSES };
  }
}
