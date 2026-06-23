const pool = require('../config/database');
const { success, failure } = require('../utils/response');

// GET /api/doa-trackings/:userId
exports.index = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await pool.query(
      'SELECT dt.*, dm.title as doa_title, dm.category as doa_category FROM doa_trackings dt JOIN doa_materials dm ON dt.doa_material_id = dm.id WHERE dt.user_id = ? ORDER BY dm.category',
      [userId]
    );

    // Convert to key-value format by doa_material_id
    const trackings = {};
    rows.forEach((r) => {
      trackings[r.doa_material_id] = r;
    });

    return success(res, { trackings });
  } catch (error) {
    console.error('Get doa trackings error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

// POST /api/doa-trackings
exports.toggle = async (req, res) => {
  try {
    const { user_id, doa_material_id, memorized } = req.body;

    if (!user_id || !doa_material_id) {
      return failure(res, 'user_id dan doa_material_id wajib diisi', 400);
    }

    // Check if exists
    const [existing] = await pool.query(
      'SELECT id FROM doa_trackings WHERE user_id = ? AND doa_material_id = ? LIMIT 1',
      [user_id, doa_material_id]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE doa_trackings SET memorized = ?, read_at = IF(? = 1, NOW(), read_at), updated_at = NOW() WHERE user_id = ? AND doa_material_id = ?',
        [memorized ? 1 : 0, memorized ? 1 : 0, user_id, doa_material_id]
      );
    } else {
      await pool.query(
        'INSERT INTO doa_trackings (user_id, doa_material_id, memorized, read_at, created_at, updated_at) VALUES (?, ?, ?, IF(? = 1, NOW(), NULL), NOW(), NOW())',
        [user_id, doa_material_id, memorized ? 1 : 0, memorized ? 1 : 0]
      );
    }

    const [updated] = await pool.query(
      'SELECT * FROM doa_trackings WHERE user_id = ? AND doa_material_id = ? LIMIT 1',
      [user_id, doa_material_id]
    );

    return success(res, {
      message: memorized ? 'Doa ditandai sudah dihafal' : 'Doa ditandai belum dihafal',
      tracking: updated[0],
    });
  } catch (error) {
    console.error('Toggle doa tracking error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

