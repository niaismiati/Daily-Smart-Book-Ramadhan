import type { TeacherDashboardStats, StudentRecap, FridayPrayer, DoaRecap, User } from '../types';

// Helper localStorage
function getLocal<T>(key: string, def: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : def; }
  catch { return def; }
}

function getAllUsers(): { id: number; name: string; class?: string; nisn?: string; role?: string }[] {
  try {
    const raw = localStorage.getItem('auth_users');
    if (raw) return JSON.parse(raw);
  } catch {}
  // fallback: ambil dari auth_user yang login
  try {
    const raw = localStorage.getItem('auth_user');
    if (raw) {
      const u = JSON.parse(raw);
      return u.role === 'guru' ? [] : [u];
    }
  } catch {}
  return [];
}

function getLocalStudents(): { id: number; name: string; class: string; nisn: string }[] {
  const stored = getLocal<{ id: number; name: string; class: string; nisn: string }[]>('smartbook_students', []);
  const defaultStudents = [
    { id: 1, name: 'Ahmad Fauzan', class: '9A', nisn: '1234567890' },
    { id: 2, name: 'Fatimah Azzahra', class: '9B', nisn: '0987654321' },
    { id: 3, name: 'Muhammad Alif', class: '9C', nisn: '1122334455' },
    { id: 4, name: 'Siti Nurhaliza', class: '9A', nisn: '5566778899' },
    { id: 5, name: 'Aisyah Ramadhani', class: '9A', nisn: '9988776655' },
    { id: 6, name: 'Zaki Abdullah', class: '9B', nisn: '5544332211' },
    { id: 7, name: 'Nabila Putri', class: '9A', nisn: '6677889900' },
    { id: 8, name: 'Farhan Maulana', class: '9C', nisn: '4433221100' },
  ];
  const merged = [...defaultStudents];
  for (const s of stored) {
    const idx = merged.findIndex((m) => m.id === s.id);
    if (idx >= 0) merged[idx] = s;
    else merged.push(s);
  }
  return merged;
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export async function getDashboardStats(): Promise<{ stats: TeacherDashboardStats }> {
  const students = getLocalStudents();
  const total_students = students.length;
  const students_by_class: Record<string, number> = {};
  for (const s of students) {
    students_by_class[s.class] = (students_by_class[s.class] || 0) + 1;
  }

  // Prayer trackings
  const prayerTrackings = getLocal<any[]>('smartbook_prayer_trackings', []);
  const today = getTodayStr();

  // Hitung per siswa: jumlah sholat hari ini
  const todayPrayers = prayerTrackings.filter((p: any) => p.date === today);
  const uniqueToday = new Set(todayPrayers.map((p: any) => p.user_id)).size;

  // Total sholat 30 hari
  const thirtyDaysAgo = getDaysAgo(30);
  const monthPrayers = prayerTrackings.filter((p: any) => p.date >= thirtyDaysAgo);
  const sholatKeys = ['subuh_checked','dzuhur_checked','ashar_checked','maghrib_checked','isya_checked'];
  const berjamaahKeys = ['subuh_berjamaah','dzuhur_berjamaah','ashar_berjamaah','maghrib_berjamaah','isya_berjamaah'];

  let total_sholat = 0;
  let total_berjamaah = 0;
  let sholat_subuh = 0, sholat_dzuhur = 0, sholat_ashar = 0, sholat_maghrib = 0, sholat_isya = 0;
  let berjamaah_subuh = 0, berjamaah_dzuhur = 0, berjamaah_ashar = 0, berjamaah_maghrib = 0, berjamaah_isya = 0;

  for (const p of monthPrayers) {
    if (p.subuh_checked) { total_sholat++; sholat_subuh++; }
    if (p.dzuhur_checked) { total_sholat++; sholat_dzuhur++; }
    if (p.ashar_checked) { total_sholat++; sholat_ashar++; }
    if (p.maghrib_checked) { total_sholat++; sholat_maghrib++; }
    if (p.isya_checked) { total_sholat++; sholat_isya++; }
    if (p.subuh_berjamaah) { total_berjamaah++; berjamaah_subuh++; }
    if (p.dzuhur_berjamaah) { total_berjamaah++; berjamaah_dzuhur++; }
    if (p.ashar_berjamaah) { total_berjamaah++; berjamaah_ashar++; }
    if (p.maghrib_berjamaah) { total_berjamaah++; berjamaah_maghrib++; }
    if (p.isya_berjamaah) { total_berjamaah++; berjamaah_isya++; }
  }

  const total_slots = total_students * 5 * 30;
  const avg_prayer_percentage = total_slots > 0 ? Math.round((total_sholat / total_slots) * 100) : 0;
  const berjamaah_percentage = total_sholat > 0 ? Math.round((total_berjamaah / total_sholat) * 100) : 0;

  // Friday prayers
  const fridayPrayers = getLocal<any[]>('smartbook_friday_prayers', []);
  const total_friday = fridayPrayers.length;
  const todayFriday = fridayPrayers.filter((f: any) => f.date === today).length;

  // Doa
  const doaMaterials = getLocal<any[]>('smartbook_doa_materials', []);
  const totalDoa = doaMaterials.filter((d: any) => d.is_active).length;
  const doaTrackings = getLocal<any[]>('smartbook_doa_trackings', []);
  const doaTracked = doaTrackings.length;

  // Quizzes
  const quizzes = getLocal<any[]>('smartbook_quizzes', []);
  const total_quizzes = quizzes.length;
  const quizResults = getLocal<any[]>('smartbook_quiz_results', []);
  const total_quiz_taken = quizResults.length;
  const avg_quiz_score = total_quiz_taken > 0
    ? Math.round(quizResults.reduce((s: number, q: any) => s + (q.score || 0), 0) / total_quiz_taken)
    : 0;

  // Quiz results list
  const recentQuizResults = quizResults.slice(-10).reverse().map((r: any) => ({
    id: r.id,
    user: r.user || { id: r.user_id, name: 'Siswa' },
    quiz: r.quiz || { id: r.quiz_id, title: 'Quiz' },
    score: r.score,
    created_at: r.created_at,
  }));

  // Quiz distribution
  const dist = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
  for (const r of quizResults) {
    const s = r.score || 0;
    if (s <= 20) dist['0-20']++;
    else if (s <= 40) dist['21-40']++;
    else if (s <= 60) dist['41-60']++;
    else if (s <= 80) dist['61-80']++;
    else dist['81-100']++;
  }

  // Journals
  const journals = getLocal<any[]>('smartbook_journals', []);
  const total_journals = journals.length;
  const studentsNotFilled = students.filter((s) => !journals.some((j: any) => j.user_id === s.id)).length;

  // Materials
  const materials = getLocal<any[]>('smartbook_materials', []);
  const total_materials = materials.filter((m: any) => m.is_active).length;
  const recentMaterials = materials.slice(-5).reverse().map((m: any) => ({
    id: m.id,
    title: m.title,
    type: m.type,
    category: m.category || null,
    created_at: m.created_at,
  }));

  // Weekly active (7 hari terakhir)
  const weekly_active = [];
  for (let i = 6; i >= 0; i--) {
    const day = getDaysAgo(i);
    const active = prayerTrackings.filter((p: any) => p.date === day).length;
    weekly_active.push(active || 0);
  }

  // Class stats
  const classStatsMap: Record<string, any> = {};
  for (const s of students) {
    if (!classStatsMap[s.class]) {
      classStatsMap[s.class] = { class: s.class, students: 0, total_sholat: 0, berjamaah: 0, avg_score: 0, journals: 0, friday_count: 0, quiz_count: 0, quiz_avg: 0 };
    }
    classStatsMap[s.class].students++;
    // Sholat untuk siswa ini
    const studentPrayers = monthPrayers.filter((p: any) => p.user_id === s.id);
    for (const p of studentPrayers) {
      for (const k of sholatKeys) { if (p[k]) classStatsMap[s.class].total_sholat++; }
      for (const k of berjamaahKeys) { if (p[k]) classStatsMap[s.class].berjamaah++; }
    }
    // Friday
    const studentFriday = fridayPrayers.filter((f: any) => f.user_id === s.id);
    classStatsMap[s.class].friday_count += studentFriday.length;
    // Journals
    const studentJournals = journals.filter((j: any) => j.user_id === s.id);
    classStatsMap[s.class].journals += studentJournals.length;
    // Quiz
    const studentQuiz = quizResults.filter((q: any) => q.user_id === s.id);
    classStatsMap[s.class].quiz_count += studentQuiz.length;
    if (studentQuiz.length > 0) {
      classStatsMap[s.class].quiz_avg += studentQuiz.reduce((sum: number, q: any) => sum + (q.score || 0), 0);
    }
  }
  const class_stats = Object.values(classStatsMap).map((c: any) => ({
    ...c,
    quiz_avg: c.quiz_count > 0 ? Math.round(c.quiz_avg / c.quiz_count) : 0,
    avg_score: c.total_sholat > 0 ? Math.round((c.berjamaah / c.total_sholat) * 100) : 0,
  }));

  // Weekly class progress (dummy 4 minggu)
  const weekly_class_progress = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'].map((week, wi) => {
    const row: any = { week };
    for (const cls of Object.keys(students_by_class)) {
      const clsStudents = students.filter((s) => s.class === cls);
      const weekStart = getDaysAgo(30 - wi * 7);
      const weekEnd = getDaysAgo(30 - (wi + 1) * 7);
      let count = 0;
      for (const cs of clsStudents) {
        const csPrayers = prayerTrackings.filter((p: any) => p.user_id === cs.id && p.date >= weekEnd && p.date <= weekStart);
        for (const p of csPrayers) {
          for (const k of sholatKeys) { if (p[k]) count++; }
        }
      }
      const maxPossible = clsStudents.length * 5 * 7;
      row[cls] = maxPossible > 0 ? Math.round((count / maxPossible) * 100) : 0;
    }
    return row;
  });

  const stats: TeacherDashboardStats = {
    total_students,
    active_students: uniqueToday,
    students_by_class,
    today_prayers: uniqueToday,
    total_sholat,
    total_slots,
    avg_prayer_percentage,
    total_berjamaah,
    berjamaah_percentage,
    sholat_subuh, sholat_dzuhur, sholat_ashar, sholat_maghrib, sholat_isya,
    berjamaah_subuh, berjamaah_dzuhur, berjamaah_ashar, berjamaah_maghrib, berjamaah_isya,
    total_puasa: 0, total_tadarus: 0,
    today_friday: todayFriday,
    total_friday,
    doa_tracked: doaTracked,
    doa_materials: totalDoa,
    total_quizzes,
    total_quiz_taken,
    avg_quiz_score,
    quiz_results: recentQuizResults,
    quiz_distribution: dist,
    total_journals,
    students_not_filled: studentsNotFilled,
    total_materials,
    total_material_readings: 0,
    recent_materials: recentMaterials,
    recent_activities: [],
    weekly_active,
    class_stats,
    weekly_class_progress,
  };

  return { stats };
}

export async function getStudents(classFilter?: string): Promise<{ students: User[] }> {
  const all = getLocalStudents();
  const filtered = classFilter ? all.filter((s) => s.class === classFilter) : all;
  return { students: filtered.map((s) => ({ id: s.id, name: s.name, nisn: s.nisn, class: s.class, role: 'siswa' as const, email: null, nip: null, phone: null })) };
}

export async function getPrayerRecap(classFilter?: string, _from?: string, _to?: string): Promise<{ recap: StudentRecap[] }> {
  const students = getLocalStudents();
  const filtered = classFilter ? students.filter((s) => s.class === classFilter) : students;
  const prayerTrackings = getLocal<any[]>('smartbook_prayer_trackings', []);
  const fridayPrayers = getLocal<any[]>('smartbook_friday_prayers', []);
  const journals = getLocal<any[]>('smartbook_journals', []);
  const quizResults = getLocal<any[]>('smartbook_quiz_results', []);

  const recap: StudentRecap[] = filtered.map((s) => {
    const sp = prayerTrackings.filter((p: any) => p.user_id === s.id);
    const sf = fridayPrayers.filter((f: any) => f.user_id === s.id);
    const sj = journals.filter((j: any) => j.user_id === s.id);
    const sq = quizResults.filter((q: any) => q.user_id === s.id);

    const totalDays = new Set(sp.map((p: any) => p.date)).size;
    let totalP = 0, berjamaah = 0, subuh = 0, dzuhur = 0, ashar = 0, maghrib = 0, isya = 0;
    for (const p of sp) {
      if (p.subuh_checked) { totalP++; subuh++; }
      if (p.dzuhur_checked) { totalP++; dzuhur++; }
      if (p.ashar_checked) { totalP++; ashar++; }
      if (p.maghrib_checked) { totalP++; maghrib++; }
      if (p.isya_checked) { totalP++; isya++; }
      if (p.subuh_berjamaah) berjamaah++;
      if (p.dzuhur_berjamaah) berjamaah++;
      if (p.ashar_berjamaah) berjamaah++;
      if (p.maghrib_berjamaah) berjamaah++;
      if (p.isya_berjamaah) berjamaah++;
    }
    const maxPossible = totalDays * 5;
    const prayer_percentage = maxPossible > 0 ? Math.round((totalP / maxPossible) * 100) : 0;
    const quiz_avg = sq.length > 0 ? Math.round(sq.reduce((sum: number, q: any) => sum + (q.score || 0), 0) / sq.length) : 0;

    return {
      id: s.id,
      name: s.name,
      nisn: s.nisn,
      class: s.class,
      total_days: totalDays,
      prayer_percentage,
      berjamaah_count: berjamaah,
      subuh, dzuhur, ashar, maghrib, isya,
      friday_count: sf.length,
      journal_count: sj.length,
      quiz_count: sq.length,
      quiz_avg,
    };
  });

  return { recap };
}

export async function getFridayPrayers(_classFilter?: string, _from?: string, _to?: string): Promise<{ friday_prayers: FridayPrayer[] }> {
  const prayers = getLocal<FridayPrayer[]>('smartbook_friday_prayers', []);
  return { friday_prayers: prayers };
}

export async function gradeFridayPrayer(id: number, comment: string, score?: number): Promise<{ message: string; friday_prayer: FridayPrayer }> {
  const prayers = getLocal<FridayPrayer[]>('smartbook_friday_prayers', []);
  const idx = prayers.findIndex((p) => p.id === id);
  if (idx >= 0) {
    prayers[idx].teacher_comment = comment;
    if (score !== undefined) prayers[idx].teacher_score = score;
    prayers[idx].is_graded = true;
    try { localStorage.setItem('smartbook_friday_prayers', JSON.stringify(prayers)); } catch {}
    return { message: 'Penilaian berhasil', friday_prayer: prayers[idx] };
  }
  throw new Error('Data tidak ditemukan');
}

export async function getDoaRecap(classFilter?: string): Promise<{ recap: DoaRecap[] }> {
  const students = getLocalStudents();
  const filtered = classFilter ? students.filter((s) => s.class === classFilter) : students;
  const doaMaterials = getLocal<any[]>('smartbook_doa_materials', []);
  const total_doa = doaMaterials.filter((d: any) => d.is_active).length;
  const doaTrackings = getLocal<any[]>('smartbook_doa_trackings', []);

  const recap: DoaRecap[] = filtered.map((s) => {
    const dt = doaTrackings.filter((t: any) => t.user_id === s.id);
    const tracked = dt.length;
    const memorized = dt.filter((t: any) => t.memorized).length;
    return {
      id: s.id,
      name: s.name,
      class: s.class,
      total_doa,
      tracked,
      memorized,
      progress_percentage: total_doa > 0 ? Math.round((tracked / total_doa) * 100) : 0,
    };
  });

  return { recap };
}

export async function getClasses(): Promise<{ classes: string[] }> {
  const students = getLocalStudents();
  const cls = [...new Set(students.map((s) => s.class))].sort();
  return { classes: cls };
}

export async function createUser(payload: {
  name: string; role: 'siswa' | 'guru'; nisn?: string; nip?: string;
  class?: string; email?: string; password: string;
}): Promise<{ message: string; user: User }> {
  const students = getLocal<any[]>('smartbook_students', []);
  const newUser: User = { id: Date.now(), name: payload.name, role: payload.role, nisn: payload.nisn || null, class: payload.class || null, email: payload.email || null, nip: payload.nip || null, phone: null };
  students.push({ id: newUser.id, name: newUser.name, class: newUser.class || '', nisn: newUser.nisn || '' });
  try { localStorage.setItem('smartbook_students', JSON.stringify(students)); } catch {}
  return { message: 'User berhasil ditambahkan', user: newUser };
}

export async function updateUser(id: number, payload: Partial<User> & { password?: string }): Promise<{ message: string; user: User }> {
  return { message: 'User berhasil diubah', user: { id, name: payload.name || '', role: 'siswa', nisn: null, class: null, email: null, nip: null, phone: null } };
}

export async function deleteUser(id: number): Promise<{ message: string }> {
  const students = getLocal<any[]>('smartbook_students', []);
  const idx = students.findIndex((s) => s.id === id);
  if (idx >= 0) { students.splice(idx, 1); try { localStorage.setItem('smartbook_students', JSON.stringify(students)); } catch {} }
  return { message: 'User berhasil dihapus' };
}