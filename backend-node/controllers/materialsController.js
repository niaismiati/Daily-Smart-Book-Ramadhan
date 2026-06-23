const pool = require('../config/database');
const { success, failure } = require('../utils/response');

// GET /api/materials
exports.index = async (req, res) => {

  try {

    const { category_id, type, search, page } = req.query;

    const pageNum = parseInt(page) || 1;
    const limit = 20;
    const offset = (pageNum - 1) * limit;

    let query = `SELECT m.*, mc.name as category_name, mc.slug as category_slug,
                 u.name as creator_name
                 FROM materials m
                 LEFT JOIN material_categories mc ON m.category_id = mc.id
                 LEFT JOIN users u ON m.created_by = u.id
                 WHERE m.is_active = 1`;
    const params = [];
    const countParams = [];

    if (category_id) {
      query += ' AND m.category_id = ?';
      params.push(category_id);
      countParams.push(category_id);
    }
    if (type) {
      query += ' AND m.type = ?';
      params.push(type);
      countParams.push(type);
    }
    if (search) {
      query += ' AND LOWER(m.title) LIKE ?';
      params.push(`%${search.toLowerCase()}%`);
      countParams.push(`%${search.toLowerCase()}%`);
    }

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM materials m WHERE m.is_active = 1';
    if (category_id || type || search) {
      const conditions = [];
      if (category_id) conditions.push('m.category_id = ?');
      if (type) conditions.push('m.type = ?');
      if (search) conditions.push('LOWER(m.title) LIKE ?');
      countQuery += ' AND ' + conditions.join(' AND ');
    }
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    query += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    return success(res, {
      materials: rows,
      total,
      current_page: pageNum,
    });
  } catch (error) {
    console.error('Get materials error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// GET /api/materials/:id
exports.show = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT m.*, mc.name as category_name, u.name as creator_name FROM materials m LEFT JOIN material_categories mc ON m.category_id = mc.id LEFT JOIN users u ON m.created_by = u.id WHERE m.id = ? LIMIT 1',
      [id]
    );

    if (rows.length === 0) {
      return failure(res, 'Materi tidak ditemukan', 404);
    }

    return success(res, { material: rows[0] });
  } catch (error) {
    console.error('Get material error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// POST /api/materials
exports.store = async (req, res) => {
  try {
    const { title, description, type, file_url, video_url, thumbnail, category_id } = req.body;
    const created_by = req.user.id;

    if (!title || !type) {
      return failure(res, 'title dan type wajib diisi', 400);
    }

    const validTypes = ['article', 'video', 'pdf', 'link', 'image'];
    if (!validTypes.includes(type)) {
      return failure(res, 'Type tidak valid. Pilihan: article, video, pdf, link, image', 400);
    }


    const [result] = await pool.query(
      'INSERT INTO materials (title, description, type, file_url, video_url, thumbnail, category_id, created_by, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())',
      [title, description || null, type, file_url || null, video_url || null, thumbnail || null, category_id || null, created_by]
    );

    const [inserted] = await pool.query(
      'SELECT m.*, mc.name as category_name, u.name as creator_name FROM materials m LEFT JOIN material_categories mc ON m.category_id = mc.id LEFT JOIN users u ON m.created_by = u.id WHERE m.id = ? LIMIT 1',
      [result.insertId]
    );

    return success(res, { message: 'Materi berhasil ditambahkan', material: inserted[0] }, 201);
  } catch (error) {
    console.error('Store material error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// PUT /api/materials/:id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, file_url, video_url, thumbnail, category_id, is_active } = req.body;

    const [existing] = await pool.query('SELECT id FROM materials WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return failure(res, 'Materi tidak ditemukan', 404);
    }


    if (type) {
      const validTypes = ['article', 'video', 'pdf', 'link', 'image'];
      if (!validTypes.includes(type)) {
        return failure(res, 'Type tidak valid. Pilihan: article, video, pdf, link, image', 400);
      }
    }


    await pool.query(
      `UPDATE materials SET
       title = COALESCE(?, title),
       description = COALESCE(?, description),
       type = COALESCE(?, type),
       file_url = COALESCE(?, file_url),
       video_url = COALESCE(?, video_url),
       thumbnail = COALESCE(?, thumbnail),
       category_id = COALESCE(?, category_id),
       is_active = COALESCE(?, is_active),
       updated_at = NOW()
       WHERE id = ?`,
      [title || null, description || null, type || null, file_url || null, video_url || null, thumbnail || null, category_id || null, is_active !== undefined ? (is_active ? 1 : 0) : null, id]
    );

    const [updated] = await pool.query(
      'SELECT m.*, mc.name as category_name, u.name as creator_name FROM materials m LEFT JOIN material_categories mc ON m.category_id = mc.id LEFT JOIN users u ON m.created_by = u.id WHERE m.id = ? LIMIT 1',
      [id]
    );

    return success(res, { message: 'Materi berhasil diubah', material: updated[0] });
  } catch (error) {
    console.error('Update material error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// DELETE /api/materials/:id
exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM materials WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return failure(res, 'Materi tidak ditemukan', 404);
    }
    return success(res, { message: 'Materi berhasil dihapus' });
  } catch (error) {
    console.error('Delete material error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// GET /api/materials/categories
exports.categories = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT mc.*, (SELECT COUNT(*) FROM materials WHERE category_id = mc.id AND is_active = 1) as materials_count FROM material_categories mc ORDER BY mc.name'
    );
    return success(res, { categories: rows });
  } catch (error) {
    console.error('Get categories error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

// POST /api/materials/:id/read

exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if already read
    const [existing] = await pool.query(
      'SELECT id FROM material_readings WHERE user_id = ? AND material_id = ? LIMIT 1',
      [user_id, id]
    );


    if (existing.length === 0) {
      await pool.query(
        'INSERT INTO material_readings (user_id, material_id, read_at, created_at, updated_at) VALUES (?, ?, NOW(), NOW(), NOW())',
        [user_id, id]
      );
    }

    return success(res, { message: 'Tercatat' });
  } catch (error) {
    console.error('Mark read error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// GET /api/materials/readings — current user's readings
exports.myReadings = async (req, res) => {
  try {
    const user_id = req.user.id;
    const [rows] = await pool.query(
      'SELECT material_id, read_at FROM material_readings WHERE user_id = ? ORDER BY read_at DESC',
      [user_id]
    );
    return success(res, { readings: rows });
  } catch (error) {
    console.error('Get my readings error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

// POST /api/materials/categories (teacher)
exports.storeCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return failure(res, 'Nama kategori wajib diisi', 400);
    }


    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const [existing] = await pool.query('SELECT id FROM material_categories WHERE slug = ? LIMIT 1', [slug]);
    if (existing.length > 0) {
      return failure(res, 'Kategori sudah ada', 409);
    }


    const [result] = await pool.query(
      'INSERT INTO material_categories (name, slug, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      [name, slug]
    );

    const [inserted] = await pool.query('SELECT * FROM material_categories WHERE id = ? LIMIT 1', [result.insertId]);
    return success(res, { message: 'Kategori ditambahkan', category: inserted[0] }, 201);
  } catch (error) {
    console.error('Store category error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// DELETE /api/materials/categories/:id (teacher)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM material_categories WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return failure(res, 'Kategori tidak ditemukan', 404);
    }

    const [[countResult]] = await pool.query(
      'SELECT COUNT(*) as total FROM materials WHERE category_id = ? AND is_active = 1',
      [id]
    );
    if (countResult.total > 0) {
      return failure(res, `Tidak dapat menghapus kategori yang masih digunakan oleh ${countResult.total} materi`, 400);
    }

    await pool.query('DELETE FROM material_categories WHERE id = ?', [id]);
    return success(res, { message: 'Kategori berhasil dihapus' });
  } catch (error) {
    console.error('Delete category error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

