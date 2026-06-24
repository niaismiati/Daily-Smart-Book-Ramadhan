const pool = require('../config/database');
const { success, failure } = require('../utils/response');

// GET /api/worship/:userId
exports.getByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    let query = 'SELECT * FROM prayer_trackings WHERE user_id = ?';
    const params = [userId];

    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }

    query += ' ORDER BY date DESC';

    const [rows] = await pool.query(query, params);

    // If no rows and date is provided, return empty tracking
    if (rows.length === 0 && date) {
      return success(res, {
        tracking: {
          id: null,
          user_id: parseInt(userId),
          date,
          subuh_checked: false,
          subuh_berjamaah: false,
          dzuhur_checked: false,
          dzuhur_berjamaah: false,
          ashar_checked: false,
          ashar_berjamaah: false,
          maghrib_checked: false,
          maghrib_berjamaah: false,
          isya_checked: false,
          isya_berjamaah: false,
        },
      });
    }

    if (date && rows.length > 0) {
      return success(res, { tracking: rows[0] });
    }

    return success(res, { trackings: rows });
  } catch (error) {
    console.error('Get worship error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// POST /api/worship
exports.store = async (req, res) => {
  try {
    const { user_id, date, subuh_checked, subuh_berjamaah, dzuhur_checked, dzuhur_berjamaah, ashar_checked, ashar_berjamaah, maghrib_checked, maghrib_berjamaah, isya_checked, isya_berjamaah } = req.body;

    const effectiveUserId = req.user.role === 'guru' ? user_id : req.user.id;

    if (!effectiveUserId || !date) {
      return failure(res, 'user_id dan date wajib diisi', 400);
    }

    // Check if exists
    const [existing] = await pool.query(
      'SELECT id FROM prayer_trackings WHERE user_id = ? AND date = ? LIMIT 1',
      [effectiveUserId, date]
    );

    if (existing.length > 0) {
      // Update
      await pool.query(
        `UPDATE prayer_trackings SET
         subuh_checked = ?, subuh_berjamaah = ?,
         dzuhur_checked = ?, dzuhur_berjamaah = ?,
         ashar_checked = ?, ashar_berjamaah = ?,
         maghrib_checked = ?, maghrib_berjamaah = ?,
         isya_checked = ?, isya_berjamaah = ?,
         updated_at = NOW()
         WHERE user_id = ? AND date = ?`,
        [
          subuh_checked || 0, subuh_berjamaah || 0,
          dzuhur_checked || 0, dzuhur_berjamaah || 0,
          ashar_checked || 0, ashar_berjamaah || 0,
          maghrib_checked || 0, maghrib_berjamaah || 0,
          isya_checked || 0, isya_berjamaah || 0,
          effectiveUserId, date,
        ]
      );

      const [updated] = await pool.query(
        'SELECT * FROM prayer_trackings WHERE user_id = ? AND date = ? LIMIT 1',
        [effectiveUserId, date]
      );

      return success(res, { message: 'Data ibadah berhasil diperbarui', tracking: updated[0] });
    }

    // Insert
    const [result] = await pool.query(
      `INSERT INTO prayer_trackings
       (user_id, date, subuh_checked, subuh_berjamaah, dzuhur_checked, dzuhur_berjamaah, ashar_checked, ashar_berjamaah, maghrib_checked, maghrib_berjamaah, isya_checked, isya_berjamaah, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        effectiveUserId, date,
        subuh_checked || 0, subuh_berjamaah || 0,
        dzuhur_checked || 0, dzuhur_berjamaah || 0,
        ashar_checked || 0, ashar_berjamaah || 0,
        maghrib_checked || 0, maghrib_berjamaah || 0,
        isya_checked || 0, isya_berjamaah || 0,
      ]
    );

    const [inserted] = await pool.query(
      'SELECT * FROM prayer_trackings WHERE id = ? LIMIT 1',
      [result.insertId]
    );

    return success(res, { message: 'Data ibadah berhasil disimpan', tracking: inserted[0] }, 201);
  } catch (error) {
    console.error('Store worship error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// PUT /api/worship/:id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { subuh_checked, subuh_berjamaah, dzuhur_checked, dzuhur_berjamaah, ashar_checked, ashar_berjamaah, maghrib_checked, maghrib_berjamaah, isya_checked, isya_berjamaah } = req.body;

    const [existing] = await pool.query('SELECT * FROM prayer_trackings WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return failure(res, 'Data ibadah tidak ditemukan', 404);
    }

    const current = existing[0];

    if (req.user.role !== 'guru' && current.user_id !== req.user.id) {
      return failure(res, 'Akses ditolak', 403);
    }

    await pool.query(
      `UPDATE prayer_trackings SET
       subuh_checked = ?, subuh_berjamaah = ?,
       dzuhur_checked = ?, dzuhur_berjamaah = ?,
       ashar_checked = ?, ashar_berjamaah = ?,
       maghrib_checked = ?, maghrib_berjamaah = ?,
       isya_checked = ?, isya_berjamaah = ?,
       updated_at = NOW()
       WHERE id = ?`,
      [
        subuh_checked !== undefined ? subuh_checked : current.subuh_checked,
        subuh_berjamaah !== undefined ? subuh_berjamaah : current.subuh_berjamaah,
        dzuhur_checked !== undefined ? dzuhur_checked : current.dzuhur_checked,
        dzuhur_berjamaah !== undefined ? dzuhur_berjamaah : current.dzuhur_berjamaah,
        ashar_checked !== undefined ? ashar_checked : current.ashar_checked,
        ashar_berjamaah !== undefined ? ashar_berjamaah : current.ashar_berjamaah,
        maghrib_checked !== undefined ? maghrib_checked : current.maghrib_checked,
        maghrib_berjamaah !== undefined ? maghrib_berjamaah : current.maghrib_berjamaah,
        isya_checked !== undefined ? isya_checked : current.isya_checked,
        isya_berjamaah !== undefined ? isya_berjamaah : current.isya_berjamaah,
        id,
      ]
    );

    const [updated] = await pool.query('SELECT * FROM prayer_trackings WHERE id = ? LIMIT 1', [id]);
    return success(res, { message: 'Data ibadah berhasil diperbarui', tracking: updated[0] });
  } catch (error) {
    console.error('Update worship error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// GET /api/worship/:userId/history
exports.history = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year, from, to } = req.query;

    let query = 'SELECT * FROM prayer_trackings WHERE user_id = ?';
    const params = [userId];

    if (from && to) {
      query += ' AND date >= ? AND date <= ?';
      params.push(from, to);
    } else if (month && year) {
      query += ' AND MONTH(date) = ? AND YEAR(date) = ?';
      params.push(parseInt(month), parseInt(year));
    }

    query += ' ORDER BY date DESC';

    const [rows] = await pool.query(query, params);
    return success(res, { trackings: rows });
  } catch (error) {
    console.error('Get prayer history error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

