const pool = require('../config/database');

// GET /api/doa
exports.index = async (req, res) => {
  try {
    const { is_active } = req.query;

    let query = 'SELECT d.*, u.name as creator_name FROM doa_materials d LEFT JOIN users u ON d.created_by = u.id';
    const params = [];

    if (is_active === '1' || is_active === 'true') {
      query += ' WHERE d.is_active = 1';
    }

    query += ' ORDER BY d.category, d.title';

    const [rows] = await pool.query(query, params);

    return res.json({ materials: rows });
  } catch (error) {
    console.error('Get doa materials error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// POST /api/doa
exports.store = async (req, res) => {
  try {
    const { title, arabic_text, latin_text, translation, audio_url, category } = req.body;
    const created_by = req.user.id;

    if (!title || !arabic_text || !latin_text || !translation || !category) {
      return res.status(400).json({ message: 'title, arabic_text, latin_text, translation, dan category wajib diisi' });
    }

    const validCategories = ['niat_puasa', 'berbuka', 'after_berbuka', 'sahur', 'lailatul_qadar'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Kategori tidak valid' });
    }

    const [result] = await pool.query(
      'INSERT INTO doa_materials (title, arabic_text, latin_text, translation, audio_url, category, created_by, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())',
      [title, arabic_text, latin_text, translation, audio_url || null, category, created_by]
    );

    const [inserted] = await pool.query(
      'SELECT d.*, u.name as creator_name FROM doa_materials d LEFT JOIN users u ON d.created_by = u.id WHERE d.id = ? LIMIT 1',
      [result.insertId]
    );

    return res.status(201).json({ message: 'Materi doa berhasil ditambahkan', material: inserted[0] });
  } catch (error) {
    console.error('Store doa error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// PUT /api/doa/:id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, arabic_text, latin_text, translation, audio_url, category, is_active } = req.body;

    const [existing] = await pool.query('SELECT id FROM doa_materials WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Materi doa tidak ditemukan' });
    }

    if (category) {
      const validCategories = ['niat_puasa', 'berbuka', 'after_berbuka', 'sahur', 'lailatul_qadar'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ message: 'Kategori tidak valid' });
      }
    }

    await pool.query(
      `UPDATE doa_materials SET
       title = COALESCE(?, title),
       arabic_text = COALESCE(?, arabic_text),
       latin_text = COALESCE(?, latin_text),
       translation = COALESCE(?, translation),
       audio_url = COALESCE(?, audio_url),
       category = COALESCE(?, category),
       is_active = COALESCE(?, is_active),
       updated_at = NOW()
       WHERE id = ?`,
      [title || null, arabic_text || null, latin_text || null, translation || null, audio_url || null, category || null, is_active !== undefined ? (is_active ? 1 : 0) : null, id]
    );

    const [updated] = await pool.query(
      'SELECT d.*, u.name as creator_name FROM doa_materials d LEFT JOIN users u ON d.created_by = u.id WHERE d.id = ? LIMIT 1',
      [id]
    );

    return res.json({ message: 'Materi doa berhasil diubah', material: updated[0] });
  } catch (error) {
    console.error('Update doa error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// DELETE /api/doa/:id
exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM doa_materials WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Materi doa tidak ditemukan' });
    }
    return res.json({ message: 'Materi doa berhasil dihapus' });
  } catch (error) {
    console.error('Delete doa error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};