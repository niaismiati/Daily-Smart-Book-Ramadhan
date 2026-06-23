const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const userFields = 'id, name, email, role, nisn, nip, class, class_id, phone, is_active, created_at, updated_at';

const getUserById = async (id) => {
  const [rows] = await pool.query(`SELECT ${userFields} FROM users WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

exports.students = async (req, res) => {
  try {
    const { search, class: className, class_id } = req.query;
    const params = [];
    let query = `SELECT ${userFields} FROM users WHERE role = 'siswa'`;

    if (search) {
      query += ' AND (LOWER(name) LIKE ? OR nisn LIKE ? OR LOWER(email) LIKE ?)';
      const like = `%${String(search).toLowerCase()}%`;
      params.push(like, like, like);
    }
    if (className) {
      query += ' AND class = ?';
      params.push(className);
    }
    if (class_id) {
      query += ' AND class_id = ?';
      params.push(class_id);
    }

    query += ' ORDER BY class, name';
    const [students] = await pool.query(query, params);
    return res.json({ students, data: students, total: students.length, current_page: 1 });
  } catch (error) {
    console.error('Get students error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.storeStudent = async (req, res) => {
  try {
    const { name, email, password, nisn, class: className, class_id, phone } = req.body;
    if (!name || !password || !nisn) {
      return res.status(400).json({ message: 'name, nisn, dan password wajib diisi' });
    }

    const hashed = await hashPassword(password);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, nisn, class, class_id, phone, is_active, created_at, updated_at) VALUES (?, ?, ?, "siswa", ?, ?, ?, ?, 1, NOW(), NOW())',
      [name, email || null, hashed, nisn, className || null, class_id || null, phone || null]
    );

    const student = await getUserById(result.insertId);
    return res.status(201).json({ message: 'Siswa berhasil ditambahkan', student, user: student });
  } catch (error) {
    console.error('Store student error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email/NISN sudah digunakan' });
    }
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, nisn, class: className, class_id, phone, is_active, password } = req.body;

    const existing = await getUserById(id);
    if (!existing || existing.role !== 'siswa') {
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }

    let hashed = null;
    if (password) {
      hashed = await hashPassword(password);
    }

    await pool.query(
      `UPDATE users SET
       name = COALESCE(?, name),
       email = COALESCE(?, email),
       nisn = COALESCE(?, nisn),
       class = COALESCE(?, class),
       class_id = COALESCE(?, class_id),
       phone = COALESCE(?, phone),
       is_active = COALESCE(?, is_active),
       password = COALESCE(?, password),
       updated_at = NOW()
       WHERE id = ? AND role = 'siswa'`,
      [
        name || null,
        email || null,
        nisn || null,
        className || null,
        class_id !== undefined ? class_id : null,
        phone || null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        hashed,
        id,
      ]
    );

    const student = await getUserById(id);
    return res.json({ message: 'Siswa berhasil diperbarui', student, user: student });
  } catch (error) {
    console.error('Update student error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id = ? AND role = 'siswa'", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }
    return res.json({ message: 'Siswa berhasil dihapus' });
  } catch (error) {
    console.error('Delete student error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.users = async (req, res) => {
  try {
    const [users] = await pool.query(`SELECT ${userFields} FROM users ORDER BY role, name`);
    return res.json({ users, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, nisn, nip, class: className, class_id, phone, is_active, password } = req.body;

    const existing = await getUserById(id);
    if (!existing) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const hashed = password ? await hashPassword(password) : null;
    await pool.query(
      `UPDATE users SET
       name = COALESCE(?, name),
       email = COALESCE(?, email),
       role = COALESCE(?, role),
       nisn = COALESCE(?, nisn),
       nip = COALESCE(?, nip),
       class = COALESCE(?, class),
       class_id = COALESCE(?, class_id),
       phone = COALESCE(?, phone),
       is_active = COALESCE(?, is_active),
       password = COALESCE(?, password),
       updated_at = NOW()
       WHERE id = ?`,
      [
        name || null,
        email || null,
        role || null,
        nisn || null,
        nip || null,
        className || null,
        class_id !== undefined ? class_id : null,
        phone || null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        hashed,
        id,
      ]
    );

    const user = await getUserById(id);
    return res.json({ message: 'User berhasil diperbarui', user });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.notifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.storeNotification = async (req, res) => {
  try {
    const { user_id, title, message, type } = req.body;
    if (!user_id || !title || !message) {
      return res.status(400).json({ message: 'user_id, title, dan message wajib diisi' });
    }

    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, created_by, title, message, type, is_read, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, NOW(), NOW())',
      [user_id, req.user.id, title, message, type || 'info']
    );
    const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ? LIMIT 1', [result.insertId]);
    return res.status(201).json({ message: 'Notifikasi berhasil dikirim', notification: rows[0] });
  } catch (error) {
    console.error('Store notification error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.readNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('UPDATE notifications SET is_read = 1, read_at = NOW(), updated_at = NOW() WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
    }
    const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ? LIMIT 1', [id]);
    return res.json({ message: 'Notifikasi ditandai sudah dibaca', notification: rows[0] });
  } catch (error) {
    console.error('Read notification error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.classes = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT DISTINCT class FROM users WHERE role = 'siswa' AND class IS NOT NULL ORDER BY class");
    return res.json({ classes: rows.map((row) => row.class) });
  } catch (error) {
    console.error('Get classes error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
