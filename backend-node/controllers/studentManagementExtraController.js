const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { success, failure } = require('../utils/response');

const userFields = 'id, name, email, role, nisn, nip, class, class_id, phone, is_active, created_at, updated_at';

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const getUserById = async (id) => {
  const [rows] = await pool.query(`SELECT ${userFields} FROM users WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
};

exports.resetStudentPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || String(password).trim().length < 6) {
      return failure(res, 'password wajib diisi (min 6 karakter)', 400);
    }

    const existing = await getUserById(id);
    if (!existing || existing.role !== 'siswa') {
      return failure(res, 'Siswa tidak ditemukan', 404);
    }

    const hashed = await hashPassword(password);
    await pool.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ? AND role = "siswa"', [hashed, id]);

    return success(res, { message: 'Password berhasil direset' });
  } catch (error) {
    console.error('resetStudentPassword error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

exports.importStudents = async (req, res) => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return failure(res, 'students harus berupa array dan tidak boleh kosong', 400);
    }

    let imported = 0;
    const now = new Date();

    // Insert per-item (simple & safe for duplicate handling)
    for (const s of students) {
      const name = s?.name;
      const nisn = s?.nisn;
      const class_id = s?.class_id;
      const password = s?.password;
      const email = s?.email || null;
      const phone = s?.phone || null;

      if (!name || !nisn || !class_id || !password) continue;

      // Map class_id => class (mengikuti mock di frontend)
      const classList = ['9A', '9B', '9C'];
      const className = classList[class_id - 1] || null;

      const hashed = await hashPassword(password);

      try {
        await pool.query(
          'INSERT INTO users (name, email, password, role, nisn, class, class_id, phone, is_active, created_at, updated_at) VALUES (?, ?, ?, "siswa", ?, ?, ?, ?, 1, NOW(), NOW())',
          [name, email, hashed, nisn, className, class_id, phone]
        );
        imported += 1;
      } catch (err) {
        // duplicate key => skip
        if (err && err.code === 'ER_DUP_ENTRY') {
          continue;
        }
        throw err;
      }
    }

    return success(res, { message: `${imported} siswa berhasil diimpor`, imported });
  } catch (error) {
    console.error('importStudents error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

exports.exportStudents = async (req, res) => {
  try {
    const { class_id } = req.query;

    const params = [];
    let query = `SELECT name, nisn, class, email FROM users WHERE role = 'siswa'`;

    if (class_id) {
      query += ' AND class_id = ?';
      params.push(class_id);
    }

    query += ' ORDER BY class, name';

    const [rows] = await pool.query(query, params);

    const students = rows.map((s) => ({
      Nama: s.name,
      NISN: s.nisn || '',
      Kelas: s.class || '',
      Email: s.email || '',
      Status: 'Aktif',
    }));

    return success(res, { students });
  } catch (error) {
    console.error('exportStudents error:', error);
    return failure(res, 'Terjadi kesalahan server', 500);
  }
};

