// Dashboard API — mengambil data dari localStorage untuk dashboard siswa

function getLocal<T>(key: string, def: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : def;
  } catch { return def; }
}

function getCurrentUserId(): number {
  try {
    const raw = localStorage.getItem('auth_user');
    if (raw) return JSON.parse(raw).id || 0;
  } catch {}
  return 0;
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export const getStudentDashboard = async () => {
  const userId = getCurrentUserId();
  const today = getTodayStr();

  // ---- PRAYER TRACKING (Sholat 5 waktu) ----
  const prayerTrackings = getLocal<any[]>('smartbook_prayer_trackings', []);
  const todayPrayer = prayerTrackings.find((p: any) => p.user_id === userId && p.date === today);
  let todayPrayerCount = 0;
  if (todayPrayer) {
    const checks = ['subuh_checked','dzuhur_checked','ashar_checked','maghrib_checked','isya_checked'];
    todayPrayerCount = checks.filter((k) => todayPrayer[k]).length;
  }

  // Hitung statistik sholat per jenis (total 30 hari)
  const monthPrayers = prayerTrackings.filter((p: any) => p.user_id === userId);
  const sholatCounts: Record<string, number> = { subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 };
  for (const p of monthPrayers) {
    for (const key of Object.keys(sholatCounts)) {
      if (p[`${key}_checked`]) sholatCounts[key]++;
    }
  }

  // ---- FRIDAY PRAYER ----
  const fridayPrayers = getLocal<any[]>('smartbook_friday_prayers', []);
  const fridayCount = fridayPrayers.filter((f: any) => f.user_id === userId).length;

  // ---- DOA MATERIALS ----
  const doaMaterials = getLocal<any[]>('smartbook_doa_materials', []);
  const totalDoa = doaMaterials.filter((d: any) => d.is_active).length;

  // ---- JOURNALS ----
  const journals = getLocal<any[]>('smartbook_journals', []);
  const myJournals = journals.filter((j: any) => j.user_id === userId);
  const journalCount = myJournals.length;

  // ---- MATERIALS & READINGS ----
  const materials = getLocal<any[]>('smartbook_materials', []);
  const activeMaterials = materials.filter((m: any) => m.is_active);
  const totalMaterials = activeMaterials.length;
  const recentMaterials = activeMaterials.slice(-5).reverse().map((m: any) => ({
    id: m.id,
    title: m.title,
    type: m.type,
    category: m.category || { name: 'Umum' },
  }));

  // ---- QUIZ (dari localStorage) ----
  const quizzes = getLocal<any[]>('smartbook_quizzes', []);
  const quizResults = getLocal<any[]>('smartbook_quiz_results', []);
  const myQuizResults = quizResults.filter((q: any) => q.user_id === userId);
  const totalQuizTaken = myQuizResults.length;
  const avgQuizScore = myQuizResults.length > 0
    ? Math.round(myQuizResults.reduce((s: number, q: any) => s + (q.score || 0), 0) / myQuizResults.length)
    : 0;

  // ---- POINTS ----
  const sholatPoints = todayPrayerCount * 50;
  const materiPoints = recentMaterials.length * 100;
  const quizPoints = totalQuizTaken * 150;
  const jurnalPoints = journalCount * 75;
  const totalPoints = sholatPoints + materiPoints + quizPoints + jurnalPoints;

  // ---- WEEKLY PROGRESS ----
  const weeklyProgress = [65, 72, 80, 78]; // default sementara

  // ---- PRAYER SCHEDULE TODAY (default) ----
  const prayerSchedule = {
    imsak: '04:20',
    subuh: '04:30',
    dzuhur: '12:00',
    ashar: '15:15',
    maghrib: '18:00',
    isya: '19:15',
  };

  // ---- NOTIFICATIONS ----
  const notifications = [
    {
      id: 1,
      title: 'Jangan lupa isi jurnal hari ini',
      message: 'Catat aktivitas Ramadhanmu',
      is_read: false,
      created_at: new Date().toISOString(),
    },
  ];

  return {
    // Data sholat
    today_prayer: todayPrayerCount,
    week_percentage: Math.round((todayPrayerCount / 5) * 100),
    streak: journalCount,
    total_points: totalPoints,
    sholat_points: sholatPoints,
    materi_points: materiPoints,
    quiz_points: quizPoints,
    jurnal_points: jurnalPoints,

    // Data jurnal & baca
    total_journals: journalCount,
    total_materials_read: recentMaterials.length,
    reading_points: materiPoints,

    // Data quiz
    total_quiz_taken: totalQuizTaken,
    avg_quiz_score: avgQuizScore,
    last_quiz_score: myQuizResults.length > 0 ? myQuizResults[myQuizResults.length - 1].score : null,
    quiz_available: quizzes.filter((q: any) => q.is_active !== false).length,

    // Data sholat per jenis
    sholat_subuh: sholatCounts.subuh,
    sholat_dzuhur: sholatCounts.dzuhur,
    sholat_ashar: sholatCounts.ashar,
    sholat_maghrib: sholatCounts.maghrib,
    sholat_isya: sholatCounts.isya,

    // Data jumat & doa
    friday_attendance: fridayCount,
    total_doa_learned: totalDoa,
    total_doa_materials: totalDoa,

    // Progress & schedule
    weekly_progress: weeklyProgress,
    recent_materials: recentMaterials,
    prayer_schedule: prayerSchedule,
    notifications,
  };
};

export const getTeacherDashboard = async () => {
  // Sementara return data dummy untuk teacher dashboard
  return {
    total_students: 0,
    active_students: 0,
    students_by_class: {},
    today_prayers: 0,
    total_sholat: 0,
    total_slots: 0,
    avg_prayer_percentage: 0,
    total_berjamaah: 0,
    berjamaah_percentage: 0,
    sholat_subuh: 0,
    sholat_dzuhur: 0,
    sholat_ashar: 0,
    sholat_maghrib: 0,
    sholat_isya: 0,
    berjamaah_subuh: 0,
    berjamaah_dzuhur: 0,
    berjamaah_ashar: 0,
    berjamaah_maghrib: 0,
    berjamaah_isya: 0,
    total_puasa: 0,
    total_tadarus: 0,
    today_friday: 0,
    total_friday: 0,
    doa_tracked: 0,
    doa_materials: 0,
    total_quizzes: 0,
    total_quiz_taken: 0,
    avg_quiz_score: 0,
    quiz_results: [],
    quiz_distribution: {},
    total_journals: 0,
    students_not_filled: 0,
    total_materials: 0,
    total_material_readings: 0,
    recent_materials: [],
    recent_activities: [],
    weekly_active: [],
    class_stats: [],
    weekly_class_progress: [],
  };
};