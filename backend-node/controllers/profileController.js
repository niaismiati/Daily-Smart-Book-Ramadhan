const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { success, failure } = require('../utils/response');


const USER_SELECT_FIELDS =
  'id, name, email, role, nisn, nip, class, class_id, phone, photo_url, is_active, created_at, updated_at';

const ensurePhotoUrlColumn = async () => {
  const [columns] = await pool.query("SHOW COLUMNS FROM users LIKE 'photo_url'");
  if (columns.length === 0) {
    await pool.query('ALTER TABLE users ADD COLUMN photo_url VARCHAR(255) DEFAULT NULL AFTER phone');
  }
};

// GET /api/profile/:userId
exports.show = async (req, res) => {
  try {
    const { userId } = req.params;
    await ensurePhotoUrlColumn();

    const [rows] = await pool.query(
      `SELECT ${USER_SELECT_FIELDS} FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return failure(res, 'User tidak ditemukan', 404);
    }

    return success(res, { user: rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

// PUT /api/profile/:userId

exports.update = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, class: className } = req.body;
    await ensurePhotoUrlColumn();

    const [existing] = await pool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [userId]);
    if (existing.length === 0) {
      return failure(res, 'User tidak ditemukan', 404);
    }

    // Check email uniqueness if changed
    if (email) {
      const [emailCheck] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1',
        [email, userId]
      );
      if (emailCheck.length > 0) {
        return failure(res, 'Email sudah digunakan user lain', 409);
      }
    }

    await pool.query(
      'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), phone = COALESCE(?, phone), class = COALESCE(?, class), updated_at = NOW() WHERE id = ?',
      [name || null, email || null, phone || null, className || null, userId]
    );

    const [updated] = await pool.query(
      `SELECT ${USER_SELECT_FIELDS} FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    return success(res, { message: 'Profil berhasil diperbarui', user: updated[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// PUT /api/profile/:userId/password
exports.changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { current_password, new_password, new_password_confirmation } = req.body;

    if (!current_password || !new_password || !new_password_confirmation) {
      return failure(res, 'Semua field password wajib diisi', 400);
    }

    if (new_password !== new_password_confirmation) {
      return failure(res, 'Konfirmasi password tidak cocok', 400);
    }

    if (new_password.length < 6) {
      return failure(res, 'Password minimal 6 karakter', 400);
    }

    const [rows] = await pool.query('SELECT password FROM users WHERE id = ? LIMIT 1', [userId]);
    if (rows.length === 0) {
      return failure(res, 'User tidak ditemukan', 404);
    }

    const isMatch = await bcrypt.compare(current_password, rows[0].password);
    if (!isMatch) {
      return failure(res, 'Password saat ini salah', 401);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await pool.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashedPassword, userId]);

    return success(res, { message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Change password error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};


// PUT /api/profile/:userId/photo
exports.uploadPhoto = async (req, res) => {
  try {
    const { userId } = req.params;
    const photoUrl = req.body.photo_url || req.body.url;

    if (!photoUrl) {
      return failure(res, 'photo_url atau url wajib diisi', 400);
    }

    await ensurePhotoUrlColumn();

    const [existing] = await pool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [userId]);
    if (existing.length === 0) {
      return failure(res, 'User tidak ditemukan', 404);
    }

    await pool.query('UPDATE users SET photo_url = ?, updated_at = NOW() WHERE id = ?', [photoUrl, userId]);

    return success(res, { message: 'Foto profil berhasil diperbarui', url: photoUrl });
  } catch (error) {
    console.error('Upload photo error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

