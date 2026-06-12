// Helper localStorage
function getLocal<T>(key: string, def: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : def; }
  catch { return def; }
}

function getCurrentUserId(): number {
  try { const raw = localStorage.getItem('auth_user'); if (raw) return JSON.parse(raw).id || 0; } catch {}
  return 0;
}

function getCurrentUserInfo(): { id: number; name: string; class: string } {
  try { const raw = localStorage.getItem('auth_user'); if (raw) return JSON.parse(raw); } catch {}
  return { id: 0, name: '', class: '' };
}

function getTodayStr(): string { return new Date().toISOString().split('T')[0]; }
function getDaysAgo(n: number): string { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]; }

function getLocalStudents() {
  const stored = getLocal<any[]>('smartbook_students', []);
  const defaults = [
    { id: 1, name: 'Ahmad Fauzan', class: '9A', nisn: '1234567890' },
    { id: 2, name: 'Fatimah Azzahra', class: '9B', nisn: '0987654321' },
    { id: 3, name: 'Muhammad Alif', class: '9C', nisn: '1122334455' },
    { id: 4, name: 'Siti Nurhaliza', class: '9A', nisn: '5566778899' },
    { id: 5, name: 'Aisyah Ramadhani', class: '9A', nisn: '9988776655' },
    { id: 6, name: 'Zaki Abdullah', class: '9B', nisn: '5544332211' },
    { id: 7, name: 'Nabila Putri', class: '9A', nisn: '6677889900' },
    { id: 8, name: 'Farhan Maulana', class: '9C', nisn: '4433221100' },
  ];
  const merged = [...defaults];
  for (const s of stored) {
    const idx = merged.findIndex((m: any) => m.id === s.id);
    if (idx >= 0) merged[idx] = s;
    else merged.push(s);
  }
  return merged;
}

/** Student Report — data real dari localStorage untuk user yang login */
export async function getMyReport() {
  const userId = getCurrentUserId();
  const user = getCurrentUserInfo();
  const thirtyDaysAgo = getDaysAgo(30);
  const today = getTodayStr();

  // Prayer
  const prayerTrackings = getLocal<any[]>('smartbook_prayer_trackings', []);
  const myPrayers = prayerTrackings.filter((p: any) => p.user_id === userId && p.date >= thirtyDaysAgo);
  let total_sholat = 0, sholat_subuh = 0, sholat_dzuhur = 0, sholat_ashar = 0, sholat_maghrib = 0, sholat_isya = 0;
  let berjamaah_count = 0;
  for (const p of myPrayers) {
    if (p.subuh_checked) { total_sholat++; sholat_subuh++; }
    if (p.dzuhur_checked) { total_sholat++; sholat_dzuhur++; }
    if (p.ashar_checked) { total_sholat++; sholat_ashar++; }
    if (p.maghrib_checked) { total_sholat++; sholat_maghrib++; }
    if (p.isya_checked) { total_sholat++; sholat_isya++; }
    if (p.subuh_berjamaah) berjamaah_count++;
    if (p.dzuhur_berjamaah) berjamaah_count++;
    if (p.ashar_berjamaah) berjamaah_count++;
    if (p.maghrib_berjamaah) berjamaah_count++;
    if (p.isya_berjamaah) berjamaah_count++;
  }
  const maxPossible = 30 * 5;
  const sholat_percentage = maxPossible > 0 ? Math.round((total_sholat / maxPossible) * 100) : 0;

  // Friday
  const fridayPrayers = getLocal<any[]>('smartbook_friday_prayers', []);
  const friday_attendance = fridayPrayers.filter((f: any) => f.user_id === userId).length;

  // Doa
  const doaMaterials = getLocal<any[]>('smartbook_doa_materials', []);
  const total_doa_learned = doaMaterials.filter((d: any) => d.is_active).length;

  // Quiz
  const quizResults = getLocal<any[]>('smartbook_quiz_results', []);
  const myQuizResults = quizResults.filter((q: any) => q.user_id === userId);
  const total_quiz_taken = myQuizResults.length;
  const avg_quiz_score = total_quiz_taken > 0
    ? Math.round(myQuizResults.reduce((s: number, q: any) => s + (q.score || 0), 0) / total_quiz_taken)
    : 0;

  // Materials
  const materials = getLocal<any[]>('smartbook_materials', []);
  const total_materials_read = materials.filter((m: any) => m.is_active).length;

  // Journals
  const journals = getLocal<any[]>('smartbook_journals', []);
  const myJournals = journals.filter((j: any) => j.user_id === userId);
  const total_journals = myJournals.length;
  const journal_streak = total_journals;

  // Points
  const reading_points = total_materials_read * 100;
  const total_points = total_sholat * 50 + total_quiz_taken * 150 + total_materials_read * 100 + total_journals * 75;

  // Weekly progress (4 minggu)
  const weekly_progress = [];
  for (let w = 0; w < 4; w++) {
    const weekStart = getDaysAgo(30 - w * 7);
    const weekEnd = getDaysAgo(30 - (w + 1) * 7);
    let count = 0;
    for (const p of myPrayers) {
      if (p.date >= weekEnd && p.date <= weekStart) {
        for (const key of ['subuh_checked','dzuhur_checked','ashar_checked','maghrib_checked','isya_checked']) {
          if (p[key]) count++;
        }
      }
    }
    const maxCount = 5 * 7;
    weekly_progress.push(maxCount > 0 ? Math.round((count / maxCount) * 100) : 0);
  }

  // Quiz results detail
  const quizDetailResults = myQuizResults.slice(-10).reverse().map((r: any) => ({
    id: r.id,
    quiz_id: r.quiz_id,
    score: r.score,
    total_questions: r.total_questions,
    correct_answers: r.correct_answers,
    quiz: r.quiz || { id: r.quiz_id, title: 'Quiz', passing_score: 70 },
    created_at: r.created_at,
  }));

  return {
    period: { from: thirtyDaysAgo, to: today },
    total_sholat,
    sholat_percentage,
    sholat_subuh, sholat_dzuhur, sholat_ashar, sholat_maghrib, sholat_isya,
    berjamaah_count,
    friday_attendance,
    total_quiz_taken,
    avg_quiz_score,
    total_materials_read,
    reading_points,
    total_journals,
    journal_streak,
    total_doa_learned,
    total_points,
    weekly_progress,
    quiz_results: quizDetailResults,
  };
}

/** Detail report for a specific student (teacher view) */
export async function getStudentReport(studentId: number) {
  const allStudents = getLocalStudents();
  const student = allStudents.find((s) => s.id === studentId) || { id: studentId, name: 'Siswa', class: '', nisn: '' };
  const thirtyDaysAgo = getDaysAgo(30);

  const prayerTrackings = getLocal<any[]>('smartbook_prayer_trackings', []);
  const myPrayers = prayerTrackings.filter((p: any) => p.user_id === studentId && p.date >= thirtyDaysAgo);

  let total_sholat = 0, sholat_subuh = 0, sholat_dzuhur = 0, sholat_ashar = 0, sholat_maghrib = 0, sholat_isya = 0;
  for (const p of myPrayers) {
    if (p.subuh_checked) { total_sholat++; sholat_subuh++; }
    if (p.dzuhur_checked) { total_sholat++; sholat_dzuhur++; }
    if (p.ashar_checked) { total_sholat++; sholat_ashar++; }
    if (p.maghrib_checked) { total_sholat++; sholat_maghrib++; }
    if (p.isya_checked) { total_sholat++; sholat_isya++; }
  }
  const maxPossible = 30 * 5;
  const sholat_percentage = maxPossible > 0 ? Math.round((total_sholat / maxPossible) * 100) : 0;

  const fridayPrayers = getLocal<any[]>('smartbook_friday_prayers', []);
  const friday_attendance = fridayPrayers.filter((f: any) => f.user_id === studentId).length;

  const quizResults = getLocal<any[]>('smartbook_quiz_results', []);
  const sq = quizResults.filter((q: any) => q.user_id === studentId);
  const total_quiz_taken = sq.length;
  const avg_quiz_score = sq.length > 0 ? Math.round(sq.reduce((s: number, q: any) => s + (q.score || 0), 0) / sq.length) : 0;

  const journals = getLocal<any[]>('smartbook_journals', []);
  const total_journals = journals.filter((j: any) => j.user_id === studentId).length;

  const materials = getLocal<any[]>('smartbook_materials', []);
  const total_materials_read = materials.filter((m: any) => m.is_active).length;

  return {
    student: { id: studentId, name: student.name, class: student.class },
    total_sholat,
    sholat_percentage,
    sholat_subuh, sholat_dzuhur, sholat_ashar, sholat_maghrib, sholat_isya,
    total_quiz_taken,
    avg_quiz_score,
    total_journals,
    total_materials_read,
    friday_attendance,
    prayer_trackings: myPrayers,
    friday_prayers: fridayPrayers.filter((f: any) => f.user_id === studentId),
    journals: journals.filter((j: any) => j.user_id === studentId),
    quiz_results: sq,
  };
}

/** Class report — semua siswa per kelas */
export async function getClassReport(className?: string) {
  const students = getLocalStudents();
  const filtered = className ? students.filter((s: any) => s.class === className) : students;

  const prayerTrackings = getLocal<any[]>('smartbook_prayer_trackings', []);
  const fridayPrayers = getLocal<any[]>('smartbook_friday_prayers', []);
  const journals = getLocal<any[]>('smartbook_journals', []);
  const quizResults = getLocal<any[]>('smartbook_quiz_results', []);

  const report = filtered.map((s: any) => {
    const sp = prayerTrackings.filter((p: any) => p.user_id === s.id);
    let totalP = 0;
    for (const p of sp) {
      for (const key of ['subuh_checked','dzuhur_checked','ashar_checked','maghrib_checked','isya_checked']) {
        if (p[key]) totalP++;
      }
    }
    const daysCount = new Set(sp.map((p: any) => p.date)).size;
    const maxP = daysCount * 5;
    const prayer_percentage = maxP > 0 ? Math.round((totalP / maxP) * 100) : 0;

    const sq = quizResults.filter((q: any) => q.user_id === s.id);
    const quiz_avg = sq.length > 0 ? Math.round(sq.reduce((sum: number, q: any) => sum + (q.score || 0), 0) / sq.length) : 0;

    return {
      id: s.id,
      name: s.name,
      nisn: s.nisn,
      class: s.class,
      prayer_percentage,
      friday_count: fridayPrayers.filter((f: any) => f.user_id === s.id).length,
      journal_count: journals.filter((j: any) => j.user_id === s.id).length,
      quiz_count: sq.length,
      quiz_avg,
    };
  });

  return { report };
}

export async function exportReport(_type: string, _id?: number): Promise<Blob> {
  throw new Error('PDF export via API tidak tersedia');
}

export async function exportMyReportPdf(): Promise<Blob> {
  throw new Error('PDF export tidak tersedia dalam mode development');
}

export async function getClassReportOld(_classId?: number, _from?: string, _to?: string) {
  const students = getLocalStudents();
  return { report: students.map((s: any) => ({
    id: s.id, name: s.name, nisn: s.nisn, class: s.class,
    prayer_percentage: 0, friday_count: 0, journal_count: 0, quiz_count: 0, quiz_avg: 0,
  })) };
}