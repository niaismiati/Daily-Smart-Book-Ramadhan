const pool = require('../config/database');

// GET /api/prayer-schedule
exports.index = async (req, res) => {
  try {
    const { date } = req.query;

    let query = 'SELECT * FROM prayer_schedules';
    const params = [];

    if (date) {
      query += ' WHERE date = ?';
      params.push(date);
    }

    query += ' ORDER BY date DESC LIMIT 10';

    const [rows] = await pool.query(query, params);

    if (date && rows.length > 0) {
      return res.json({ schedule: rows[0] });
    }

    return res.json({ schedules: rows });
  } catch (error) {
    console.error('Get prayer schedule error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// POST /api/prayer-schedule (teacher)
exports.store = async (req, res) => {
  try {
    const { date, imsak, subuh, dzuhur, ashar, maghrib, isya } = req.body;

    if (!date || !subuh || !dzuhur || !ashar || !maghrib || !isya) {
      return res.status(400).json({ message: 'date, subuh, dzuhur, ashar, maghrib, isya wajib diisi' });
    }

    const [existing] = await pool.query('SELECT id FROM prayer_schedules WHERE date = ? LIMIT 1', [date]);

    if (existing.length > 0) {
      await pool.query(
        'UPDATE prayer_schedules SET imsak = ?, subuh = ?, dzuhur = ?, ashar = ?, maghrib = ?, isya = ?, updated_at = NOW() WHERE date = ?',
        [imsak || null, subuh, dzuhur, ashar, maghrib, isya, date]
      );
      const [updated] = await pool.query('SELECT * FROM prayer_schedules WHERE date = ? LIMIT 1', [date]);
      return res.json({ message: 'Jadwal sholat berhasil diperbarui', schedule: updated[0] });
    }

    const [result] = await pool.query(
      'INSERT INTO prayer_schedules (date, imsak, subuh, dzuhur, ashar, maghrib, isya, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [date, imsak || null, subuh, dzuhur, ashar, maghrib, isya]
    );

    const [inserted] = await pool.query('SELECT * FROM prayer_schedules WHERE id = ? LIMIT 1', [result.insertId]);
    return res.status(201).json({ message: 'Jadwal sholat berhasil disimpan', schedule: inserted[0] });
  } catch (error) {
    console.error('Store prayer schedule error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};