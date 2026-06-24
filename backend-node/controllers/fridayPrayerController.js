const pool = require('../config/database');

// GET /api/friday-prayer
exports.index = async (req, res) => {
  try {
    const { userId, date } = req.query;

    let query = 'SELECT fp.*, st.title as sermon_topic_title FROM friday_prayers fp LEFT JOIN sermon_topics st ON fp.sermon_topic_id = st.id';
    const params = [];
    const conditions = [];

    if (userId) {
      conditions.push('fp.user_id = ?');
      params.push(userId);
    }
    if (date) {
      conditions.push('fp.date = ?');
      params.push(date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY fp.date DESC';

    const [rows] = await pool.query(query, params);

    if (userId && date && rows.length === 0) {
      return res.json({ friday_prayer: null });
    }

    if (userId && date) {
      return res.json({ friday_prayer: rows[0] || null });
    }

    return res.json({ friday_prayers: rows });
  } catch (error) {
    console.error('Get friday prayers error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// POST /api/friday-prayer
exports.store = async (req, res) => {
  try {
    const { user_id, date, khatib_name, sermon_topic_id, summary, lesson } = req.body;

    const effectiveUserId = req.user.role === 'guru' ? user_id : req.user.id;

    if (!effectiveUserId || !date || !khatib_name || !summary) {
      return res.status(400).json({ message: 'user_id, date, khatib_name, dan summary wajib diisi' });
    }

    // Check if exists
    const [existing] = await pool.query(
      'SELECT id FROM friday_prayers WHERE user_id = ? AND date = ? LIMIT 1',
      [effectiveUserId, date]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE friday_prayers SET khatib_name = ?, sermon_topic_id = ?, summary = ?, lesson = ?, updated_at = NOW() WHERE user_id = ? AND date = ?',
        [khatib_name, sermon_topic_id || null, summary, lesson || null, effectiveUserId, date]
      );
      const [updated] = await pool.query('SELECT * FROM friday_prayers WHERE user_id = ? AND date = ? LIMIT 1', [effectiveUserId, date]);
      return res.json({ message: 'Data sholat Jumat berhasil diperbarui', friday_prayer: updated[0] });
    }

    const [result] = await pool.query(
      'INSERT INTO friday_prayers (user_id, date, khatib_name, sermon_topic_id, summary, lesson, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [effectiveUserId, date, khatib_name, sermon_topic_id || null, summary, lesson || null]
    );

    const [inserted] = await pool.query('SELECT * FROM friday_prayers WHERE id = ? LIMIT 1', [result.insertId]);
    return res.status(201).json({ message: 'Data sholat Jumat berhasil disimpan', friday_prayer: inserted[0] });
  } catch (error) {
    console.error('Store friday prayer error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// PUT /api/friday-prayer/:id (teacher grade)
exports.grade = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacher_comment, teacher_score } = req.body;

    const [existing] = await pool.query('SELECT id FROM friday_prayers WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    await pool.query(
      'UPDATE friday_prayers SET teacher_comment = ?, teacher_score = ?, is_graded = 1, updated_at = NOW() WHERE id = ?',
      [teacher_comment || null, teacher_score || null, id]
    );

    const [updated] = await pool.query('SELECT * FROM friday_prayers WHERE id = ? LIMIT 1', [id]);
    return res.json({ message: 'Nilai berhasil disimpan', friday_prayer: updated[0] });
  } catch (error) {
    console.error('Grade friday prayer error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// DELETE /api/friday-prayer/:id
exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM friday_prayers WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data sholat Jumat tidak ditemukan' });
    }
    return res.json({ message: 'Data sholat Jumat berhasil dihapus' });
  } catch (error) {
    console.error('Delete friday prayer error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
