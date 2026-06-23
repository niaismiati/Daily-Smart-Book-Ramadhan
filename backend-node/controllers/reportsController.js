const pool = require('../config/database');
const { success, failure } = require('../utils/response');

const getStudentReportData = async (userId) => {

  const [[student]] = await pool.query(
    'SELECT id, name, nisn, class, email FROM users WHERE id = ? AND role = "siswa" LIMIT 1',
    [userId]
  );

  if (!student) {
    return null;
  }

  const [prayers] = await pool.query('SELECT * FROM prayer_trackings WHERE user_id = ? ORDER BY date DESC', [userId]);
  const [fridayPrayers] = await pool.query('SELECT * FROM friday_prayers WHERE user_id = ? ORDER BY date DESC', [userId]);
  const [journals] = await pool.query('SELECT * FROM journals WHERE user_id = ? ORDER BY date DESC', [userId]);
  const [quizResults] = await pool.query(
    `SELECT qr.*, q.title as quiz_title, q.passing_score
     FROM quiz_results qr
     JOIN quizzes q ON qr.quiz_id = q.id
     WHERE qr.user_id = ?
     ORDER BY qr.created_at DESC`,
    [userId]
  );
  const [[materialsRead]] = await pool.query('SELECT COUNT(*) as total FROM material_readings WHERE user_id = ?', [userId]);
  const [[doaLearned]] = await pool.query('SELECT COUNT(*) as total FROM doa_trackings WHERE user_id = ? AND memorized = 1', [userId]);

  const prayerTotals = { total_sholat: 0, sholat_subuh: 0, sholat_dzuhur: 0, sholat_ashar: 0, sholat_maghrib: 0, sholat_isya: 0, berjamaah_count: 0 };
  for (const row of prayers) {
    for (const prayer of ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya']) {
      if (row[`${prayer}_checked`]) {
        prayerTotals.total_sholat++;
        prayerTotals[`sholat_${prayer}`]++;
      }
      if (row[`${prayer}_berjamaah`]) {
        prayerTotals.berjamaah_count++;
      }
    }
  }

  const avgQuizScore = quizResults.length > 0
    ? Math.round(quizResults.reduce((sum, result) => sum + (result.score || 0), 0) / quizResults.length)
    : 0;
  const sholatPercentage = prayers.length > 0 ? Math.round((prayerTotals.total_sholat / (prayers.length * 5)) * 100) : 0;

  return {
    student,
    ...prayerTotals,
    sholat_percentage: sholatPercentage,
    friday_attendance: fridayPrayers.length,
    total_quiz_taken: quizResults.length,
    avg_quiz_score: avgQuizScore,
    total_materials_read: materialsRead.total || 0,
    reading_points: (materialsRead.total || 0) * 100,
    total_journals: journals.length,
    journal_streak: journals.length,
    total_doa_learned: doaLearned.total || 0,
    total_points: prayerTotals.total_sholat * 50 + quizResults.length * 150 + (materialsRead.total || 0) * 100 + journals.length * 75,
    weekly_progress: [],
    quiz_results: quizResults.map((row) => ({
      ...row,
      quiz: { id: row.quiz_id, title: row.quiz_title, passing_score: row.passing_score },
    })),
    prayer_trackings: prayers,
    friday_prayers: fridayPrayers,
    journals,
  };
};

exports.student = async (req, res) => {
  try {
    const report = await getStudentReportData(req.params.userId);
    if (!report) {
      return failure(res, 'Siswa tidak ditemukan', 404);
    }
    return success(res, report);
  } catch (error) {
    console.error('Student report error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

exports.teacher = async (req, res) => {
  try {
    const { class: className } = req.query;
    const params = [];
    let query = 'SELECT id, name, nisn, class, email FROM users WHERE role = "siswa"';
    if (className) {
      query += ' AND class = ?';
      params.push(className);
    }
    query += ' ORDER BY class, name';
    const [students] = await pool.query(query, params);

    const report = [];
    for (const student of students) {
      const data = await getStudentReportData(student.id);
      if (data) {
        report.push({
          id: student.id,
          name: student.name,
          nisn: student.nisn,
          class: student.class,
          prayer_percentage: data.sholat_percentage,
          friday_count: data.friday_attendance,
          journal_count: data.total_journals,
          quiz_count: data.total_quiz_taken,
          quiz_avg: data.avg_quiz_score,
        });
      }
    }

    return success(res, { report });
  } catch (error) {
    console.error('Teacher report error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

exports.export = async (req, res) => {

  try {
    const { userId } = req.query;
    const payload = userId ? await getStudentReportData(userId) : { generated_at: new Date().toISOString() };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="smartbook-report.json"');
    // tetap kirim raw JSON untuk export (kontrak payload di frontend bukan success wrapper)
    return res.send(JSON.stringify(payload, null, 2));
  } catch (error) {
    console.error('Export report error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};
