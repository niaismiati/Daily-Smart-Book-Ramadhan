const pool = require('../config/database');
const { success, failure } = require('../utils/response');

const parseId = (id) => {
  const n = parseInt(id, 10);
  return Number.isFinite(n) ? n : null;
};

// GET /api/sermon-topics/active
exports.getActiveTopics = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, description, created_by, status, created_at, updated_at FROM sermon_topics WHERE status = 'active' ORDER BY created_at DESC"
    );

    return success(res, { topics: rows });
  } catch (error) {
    console.error('getActiveTopics error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

// GET /api/sermon-topics/teacher
exports.getAllTopics = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, description, created_by, status, created_at, updated_at FROM sermon_topics ORDER BY created_at DESC'
    );

    return success(res, { topics: rows });
  } catch (error) {
    console.error('getAllTopics error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

// POST /api/sermon-topics/teacher
exports.createTopic = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title) return failure(res, 'title wajib diisi', 400);

    const createdBy = req.user?.id;
    if (!createdBy) return failure(res, 'Belum terautentikasi', 401);

    const normalizedStatus = status === 'inactive' ? 'inactive' : 'active';

    const [result] = await pool.query(
      'INSERT INTO sermon_topics (title, description, created_by, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [title, description || null, createdBy, normalizedStatus]
    );

    const [[row]] = await pool.query(
      'SELECT id, title, description, created_by, status, created_at, updated_at FROM sermon_topics WHERE id = ? LIMIT 1',
      [result.insertId]
    );

    return success(res, { message: 'Materi khotbah berhasil ditambahkan', topic: row }, 201);
  } catch (error) {
    console.error('createTopic error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

// PUT /api/sermon-topics/teacher/:id
exports.updateTopic = async (req, res) => {
  try {
    const topicId = parseId(req.params.id);
    if (!topicId) return failure(res, 'id tidak valid', 400);

    const { title, description, status } = req.body;

    const createdBy = req.user?.id;
    if (!createdBy) return failure(res, 'Belum terautentikasi', 401);

    const [existingRows] = await pool.query('SELECT id FROM sermon_topics WHERE id = ? LIMIT 1', [topicId]);
    if (!existingRows || existingRows.length === 0) {
      return failure(res, 'Topic tidak ditemukan', 404);
    }

    const normalizedStatus = status === 'inactive' ? 'inactive' : (status === 'active' ? 'active' : null);

    await pool.query(
      `UPDATE sermon_topics
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           status = COALESCE(?, status),
           updated_at = NOW()
       WHERE id = ?`,
      [
        title !== undefined ? title : null,
        description !== undefined ? description : null,
        normalizedStatus !== null ? normalizedStatus : null,
        topicId,
      ]
    );

    const [[row]] = await pool.query(
      'SELECT id, title, description, created_by, status, created_at, updated_at FROM sermon_topics WHERE id = ? LIMIT 1',
      [topicId]
    );

    return success(res, { message: 'Topic berhasil diubah', topic: row });
  } catch (error) {
    console.error('updateTopic error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

// DELETE /api/sermon-topics/teacher/:id
exports.deleteTopic = async (req, res) => {
  try {
    const topicId = parseId(req.params.id);
    if (!topicId) return failure(res, 'id tidak valid', 400);

    const [result] = await pool.query('DELETE FROM sermon_topics WHERE id = ?', [topicId]);

    if (result.affectedRows === 0) {
      return failure(res, 'Topic tidak ditemukan', 404);
    }

    return success(res, { message: 'Topic berhasil dihapus' });
  } catch (error) {
    console.error('deleteTopic error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

