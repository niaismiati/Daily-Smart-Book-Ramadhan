const pool = require('../config/database');

const today = () => new Date().toISOString().slice(0, 10);

const countPrayers = (trackings) => {
  const totals = {
    total_sholat: 0,
    total_berjamaah: 0,
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
  };

  for (const row of trackings) {
    for (const prayer of ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya']) {
      if (row[`${prayer}_checked`]) {
        totals.total_sholat++;
        totals[`sholat_${prayer}`]++;
      }
      if (row[`${prayer}_berjamaah`]) {
        totals.total_berjamaah++;
        totals[`berjamaah_${prayer}`]++;
      }
    }
  }

  return totals;
};

exports.student = async (req, res) => {
  try {
    const { userId } = req.params;
    const todayDate = today();

    const [[todayPrayer]] = await pool.query('SELECT * FROM prayer_trackings WHERE user_id = ? AND date = ? LIMIT 1', [userId, todayDate]);
    const [trackings] = await pool.query('SELECT * FROM prayer_trackings WHERE user_id = ? ORDER BY date DESC LIMIT 30', [userId]);
    const prayerTotals = countPrayers(trackings);

    const [[journalCount]] = await pool.query('SELECT COUNT(*) as total FROM journals WHERE user_id = ?', [userId]);
    const [[fridayCount]] = await pool.query('SELECT COUNT(*) as total FROM friday_prayers WHERE user_id = ?', [userId]);
    const [[doaTracked]] = await pool.query('SELECT COUNT(*) as total FROM doa_trackings WHERE user_id = ? AND memorized = 1', [userId]);
    const [[doaMaterials]] = await pool.query('SELECT COUNT(*) as total FROM doa_materials WHERE is_active = 1');
    const [[quizAvailable]] = await pool.query('SELECT COUNT(*) as total FROM quizzes WHERE is_active = 1');
    const [[quizStats]] = await pool.query(
      'SELECT COUNT(*) as total, AVG(score) as avg_score, MAX(id) as last_id FROM quiz_results WHERE user_id = ?',
      [userId]
    );
    const [[lastQuiz]] = await pool.query('SELECT score FROM quiz_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId]);
    const [[readStats]] = await pool.query('SELECT COUNT(*) as total FROM material_readings WHERE user_id = ?', [userId]);
    const [recentMaterials] = await pool.query(
      `SELECT m.id, m.title, m.type, mc.name as category_name
       FROM materials m
       LEFT JOIN material_categories mc ON m.category_id = mc.id
       WHERE m.is_active = 1
       ORDER BY m.created_at DESC
       LIMIT 5`
    );
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [userId]
    );
    const [[schedule]] = await pool.query('SELECT * FROM prayer_schedules WHERE date = ? LIMIT 1', [todayDate]);

    const todayPrayerCount = todayPrayer
      ? ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'].filter((prayer) => todayPrayer[`${prayer}_checked`]).length
      : 0;
    const totalQuizTaken = quizStats.total || 0;
    const totalMaterialsRead = readStats.total || 0;
    const totalJournals = journalCount.total || 0;
    const totalPoints = prayerTotals.total_sholat * 50 + totalMaterialsRead * 100 + totalQuizTaken * 150 + totalJournals * 75;

    return res.json({
      today_prayer: todayPrayerCount,
      week_percentage: Math.round((todayPrayerCount / 5) * 100),
      streak: totalJournals,
      total_points: totalPoints,
      sholat_points: prayerTotals.total_sholat * 50,
      materi_points: totalMaterialsRead * 100,
      quiz_points: totalQuizTaken * 150,
      jurnal_points: totalJournals * 75,
      total_journals: totalJournals,
      total_materials_read: totalMaterialsRead,
      reading_points: totalMaterialsRead * 100,
      total_quiz_taken: totalQuizTaken,
      avg_quiz_score: quizStats.avg_score ? Math.round(quizStats.avg_score) : 0,
      last_quiz_score: lastQuiz ? lastQuiz.score : null,
      quiz_available: quizAvailable.total || 0,
      ...prayerTotals,
      friday_attendance: fridayCount.total || 0,
      total_doa_learned: doaTracked.total || 0,
      total_doa_materials: doaMaterials.total || 0,
      weekly_progress: [],
      recent_materials: recentMaterials.map((m) => ({
        ...m,
        category: m.category_name ? { name: m.category_name } : null,
      })),
      prayer_schedule: schedule || null,
      notifications,
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.teacher = async (req, res) => {
  try {
    const todayDate = today();
    const [[studentCount]] = await pool.query("SELECT COUNT(*) as total FROM users WHERE role = 'siswa'");
    const [classRows] = await pool.query("SELECT COALESCE(class, '-') as class_name, COUNT(*) as total FROM users WHERE role = 'siswa' GROUP BY class");
    const [trackings] = await pool.query('SELECT * FROM prayer_trackings WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)');
    const prayerTotals = countPrayers(trackings);
    const [[activeToday]] = await pool.query('SELECT COUNT(DISTINCT user_id) as total FROM prayer_trackings WHERE date = ?', [todayDate]);
    const [[fridayTotal]] = await pool.query('SELECT COUNT(*) as total FROM friday_prayers');
    const [[fridayToday]] = await pool.query('SELECT COUNT(*) as total FROM friday_prayers WHERE date = ?', [todayDate]);
    const [[doaMaterials]] = await pool.query('SELECT COUNT(*) as total FROM doa_materials WHERE is_active = 1');
    const [[doaTracked]] = await pool.query('SELECT COUNT(*) as total FROM doa_trackings');
    const [[quizTotal]] = await pool.query('SELECT COUNT(*) as total FROM quizzes');
    const [[quizStats]] = await pool.query('SELECT COUNT(*) as total, AVG(score) as avg_score FROM quiz_results');
    const [[journalTotal]] = await pool.query('SELECT COUNT(*) as total FROM journals');
    const [[notFilled]] = await pool.query(
      "SELECT COUNT(*) as total FROM users u WHERE u.role = 'siswa' AND NOT EXISTS (SELECT 1 FROM journals j WHERE j.user_id = u.id AND j.date = CURDATE())"
    );
    const [[materialTotal]] = await pool.query('SELECT COUNT(*) as total FROM materials WHERE is_active = 1');
    const [[materialReadings]] = await pool.query('SELECT COUNT(*) as total FROM material_readings');
    const [quizResults] = await pool.query(
      `SELECT qr.id, qr.score, qr.created_at, u.id as user_id, u.name as user_name, q.id as quiz_id, q.title as quiz_title
       FROM quiz_results qr
       JOIN users u ON qr.user_id = u.id
       JOIN quizzes q ON qr.quiz_id = q.id
       ORDER BY qr.created_at DESC
       LIMIT 10`
    );
    const [recentMaterials] = await pool.query('SELECT id, title, type, created_at FROM materials WHERE is_active = 1 ORDER BY created_at DESC LIMIT 5');
    const [classStats] = await pool.query(
      `SELECT u.class, COUNT(DISTINCT u.id) as students,
        COUNT(j.id) as journals,
        COUNT(DISTINCT fp.id) as friday_count,
        COUNT(DISTINCT qr.id) as quiz_count,
        ROUND(AVG(qr.score)) as quiz_avg
       FROM users u
       LEFT JOIN journals j ON j.user_id = u.id
       LEFT JOIN friday_prayers fp ON fp.user_id = u.id
       LEFT JOIN quiz_results qr ON qr.user_id = u.id
       WHERE u.role = 'siswa'
       GROUP BY u.class`
    );

    const totalStudents = studentCount.total || 0;
    const totalSlots = totalStudents * 5 * 30;
    const studentsByClass = classRows.reduce((acc, row) => {
      acc[row.class_name] = row.total;
      return acc;
    }, {});
    const distribution = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    for (const result of quizResults) {
      const score = result.score || 0;
      if (score <= 20) distribution['0-20']++;
      else if (score <= 40) distribution['21-40']++;
      else if (score <= 60) distribution['41-60']++;
      else if (score <= 80) distribution['61-80']++;
      else distribution['81-100']++;
    }

    const stats = {
      total_students: totalStudents,
      active_students: activeToday.total || 0,
      students_by_class: studentsByClass,
      today_prayers: activeToday.total || 0,
      total_slots: totalSlots,
      avg_prayer_percentage: totalSlots > 0 ? Math.round((prayerTotals.total_sholat / totalSlots) * 100) : 0,
      berjamaah_percentage: prayerTotals.total_sholat > 0 ? Math.round((prayerTotals.total_berjamaah / prayerTotals.total_sholat) * 100) : 0,
      total_puasa: 0,
      total_tadarus: 0,
      today_friday: fridayToday.total || 0,
      total_friday: fridayTotal.total || 0,
      doa_tracked: doaTracked.total || 0,
      doa_materials: doaMaterials.total || 0,
      total_quizzes: quizTotal.total || 0,
      total_quiz_taken: quizStats.total || 0,
      avg_quiz_score: quizStats.avg_score ? Math.round(quizStats.avg_score) : 0,
      quiz_results: quizResults.map((row) => ({
        id: row.id,
        score: row.score,
        created_at: row.created_at,
        user: { id: row.user_id, name: row.user_name },
        quiz: { id: row.quiz_id, title: row.quiz_title },
      })),
      quiz_distribution: distribution,
      total_journals: journalTotal.total || 0,
      students_not_filled: notFilled.total || 0,
      total_materials: materialTotal.total || 0,
      total_material_readings: materialReadings.total || 0,
      recent_materials: recentMaterials,
      recent_activities: [],
      weekly_active: [],
      class_stats: classStats.map((row) => ({
        class: row.class || '-',
        students: row.students,
        journals: row.journals,
        friday_count: row.friday_count,
        quiz_count: row.quiz_count,
        quiz_avg: row.quiz_avg || 0,
        total_sholat: 0,
        berjamaah: 0,
        avg_score: 0,
      })),
      weekly_class_progress: [],
      ...prayerTotals,
    };

    return res.json({ stats, ...stats });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
