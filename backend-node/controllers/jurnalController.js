const pool = require('../config/database');
const { success, failure } = require('../utils/response');

// GET /api/journals/:userId
exports.getByUser = async (req, res) => {

  try {
    const { userId } = req.params;
    const { date } = req.query;

    let query = 'SELECT * FROM journals WHERE user_id = ?';
    const params = [userId];

    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }

    query += ' ORDER BY date DESC';

    const [rows] = await pool.query(query, params);

    if (rows.length === 0 && date) {
      return success(res, {
        journal: {
          id: null,
          user_id: parseInt(userId),
          date,
          content: '',
          mood: null,
          teacher_comment: null,
        },
      });
    }

    if (date && rows.length > 0) {
      return success(res, { journal: rows[0] });
    }

    return success(res, { journals: rows });
  } catch (error) {
    console.error('Get journal error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// POST /api/journals
exports.store = async (req, res) => {
  try {
    const { user_id, date, content, mood } = req.body;

    const effectiveUserId = req.user.role === 'guru' ? user_id : req.user.id;

    if (!effectiveUserId || !date || !content) {
      return failure(res, 'user_id, date, dan content wajib diisi', 400);
    }


    // Check if exists
    const [existing] = await pool.query(
      'SELECT id FROM journals WHERE user_id = ? AND date = ? LIMIT 1',
      [effectiveUserId, date]
    );

    if (existing.length > 0) {
      // Update
      await pool.query(
        'UPDATE journals SET content = ?, mood = ?, updated_at = NOW() WHERE user_id = ? AND date = ?',
        [content, mood || null, effectiveUserId, date]
      );

      const [updated] = await pool.query(
        'SELECT * FROM journals WHERE user_id = ? AND date = ? LIMIT 1',
        [effectiveUserId, date]
      );

      return success(res, { message: 'Jurnal berhasil diperbarui', journal: updated[0] });
    }


    // Insert
    const [result] = await pool.query(
      `INSERT INTO journals (user_id, date, content, mood, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [effectiveUserId, date, content, mood || null]
    );

    const [inserted] = await pool.query(
      'SELECT * FROM journals WHERE id = ? LIMIT 1',
      [result.insertId]
    );

    return success(res, { message: 'Jurnal berhasil disimpan', journal: inserted[0] }, 201);
  } catch (error) {
    console.error('Store journal error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// PUT /api/journals/:id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, mood, date } = req.body;

    const [existing] = await pool.query('SELECT * FROM journals WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return failure(res, 'Jurnal tidak ditemukan', 404);
    }

    if (req.user.role !== 'guru' && existing[0].user_id !== req.user.id) {
      return failure(res, 'Akses ditolak', 403);
    }

    await pool.query(
      'UPDATE journals SET content = COALESCE(?, content), mood = COALESCE(?, mood), date = COALESCE(?, date), updated_at = NOW() WHERE id = ?',
      [content || null, mood || null, date || null, id]
    );

    const [updated] = await pool.query('SELECT * FROM journals WHERE id = ? LIMIT 1', [id]);
    return success(res, { message: 'Jurnal berhasil diperbarui', journal: updated[0] });
  } catch (error) {
    console.error('Update journal error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

// DELETE /api/journals/:id
exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT user_id FROM journals WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return failure(res, 'Jurnal tidak ditemukan', 404);
    }

    if (req.user.role !== 'guru' && existing[0].user_id !== req.user.id) {
      return failure(res, 'Akses ditolak', 403);
    }

    await pool.query('DELETE FROM journals WHERE id = ?', [id]);
    return success(res, { message: 'Jurnal berhasil dihapus' });
  } catch (error) {
    console.error('Delete journal error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

// GET /api/journals (all students — for teachers)
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT j.*, u.name as user_name, u.class as user_class
       FROM journals j
       JOIN users u ON j.user_id = u.id
       ORDER BY j.created_at DESC`
    );
    return success(res, { students: rows });
  } catch (error) {
    console.error('Get all journals error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

// POST /api/journals/:id/comment
exports.comment = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacher_comment } = req.body;

    if (!teacher_comment) {
      return failure(res, 'teacher_comment wajib diisi', 400);
    }

    const [existing] = await pool.query('SELECT id FROM journals WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return failure(res, 'Jurnal tidak ditemukan', 404);
    }

    await pool.query('UPDATE journals SET teacher_comment = ?, updated_at = NOW() WHERE id = ?', [teacher_comment, id]);
    const [updated] = await pool.query('SELECT * FROM journals WHERE id = ? LIMIT 1', [id]);
    return success(res, { message: 'Komentar jurnal berhasil disimpan', journal: updated[0] });
  } catch (error) {
    console.error('Comment journal error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};
