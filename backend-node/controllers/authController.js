const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set!');
  process.exit(1);
}

exports.me = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, nisn, nip, class, class_id, phone, photo_url, is_active FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    return res.json({ user: rows[0] });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.login = async (req, res) => {
  try {
    const { credential, password, role } = req.body;

    if (!credential || !password) {
      return res.status(400).json({ message: 'Credential dan password wajib diisi' });
    }

    // credential bisa berupa email ATAU nisn
    let user;
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE (email = ? OR nisn = ? OR nip = ?) AND is_active = 1 LIMIT 1',
      [credential, credential, credential]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credential atau password salah' });
    }

    user = rows[0];

    // Jika role disertakan, validasi role
    if (role && user.role !== role) {
      return res.status(401).json({ message: 'Role tidak sesuai dengan akun' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credential atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        nisn: user.nisn,
        nip: user.nip,
        class: user.class,
        class_id: user.class_id,
        phone: user.phone,
        is_active: user.is_active,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, nisn, nip, class: className, phone } = req.body;

    if (!name || !password || !role) {
      return res.status(400).json({ message: 'Nama, password, dan role wajib diisi' });
    }

    if (name.length > 100) {
      return res.status(400).json({ message: 'Nama maksimal 100 karakter' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    if (!['siswa', 'guru'].includes(role)) {
      return res.status(400).json({ message: 'Role harus siswa atau guru' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Format email tidak valid' });
    }

    // Check if email already exists
    if (email) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ message: 'Email sudah terdaftar' });
      }
    }

    // Check if nisn already exists
    if (nisn) {
      const [existing] = await pool.query('SELECT id FROM users WHERE nisn = ? LIMIT 1', [nisn]);
      if (existing.length > 0) {
        return res.status(409).json({ message: 'NISN sudah terdaftar' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, nisn, nip, class, phone, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [name, email || null, hashedPassword, role, nisn || null, nip || null, className || null, phone || null]
    );

    const token = jwt.sign(
      { id: result.insertId, role, name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      user: {
        id: result.insertId,
        name,
        email: email || null,
        role,
        nisn: nisn || null,
        nip: nip || null,
        class: className || null,
        phone: phone || null,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Data sudah terdaftar (email/nisn/nip duplikat)' });
    }
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.logout = async (req, res) => {
  try {
    return res.json({ message: 'Logout berhasil' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};