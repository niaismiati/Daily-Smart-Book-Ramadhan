// SQLite Database Wrapper untuk Vercel Serverless
// Database disimpan di /tmp/smartbook.db (satu-satunya direktori writable di Vercel)
// API kompatibel dengan mysql2/promise pool.query()

const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

let db = null;
let initialized = false;

function getDb() {
  if (db) return db;

  const Database = require('better-sqlite3');
  const dbPath = process.env.NODE_ENV === 'production'
    ? '/tmp/smartbook.db'
    : path.join(__dirname, '..', 'backend-node', 'data', 'smartbook.db');

  // Pastikan folder exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  return db;
}

function createTables() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('siswa', 'guru')),
      nisn TEXT UNIQUE,
      nip TEXT UNIQUE,
      class TEXT,
      phone TEXT,
      photo_url TEXT,
      is_active INTEGER DEFAULT 1,
      remember_token TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      wali_kelas_id INTEGER,
      created_at TEXT,
      updated_at TEXT,
      FOREIGN KEY (wali_kelas_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS prayer_trackings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      subuh_checked INTEGER DEFAULT 0,
      subuh_berjamaah INTEGER DEFAULT 0,
      dzuhur_checked INTEGER DEFAULT 0,
      dzuhur_berjamaah INTEGER DEFAULT 0,
      ashar_checked INTEGER DEFAULT 0,
      ashar_berjamaah INTEGER DEFAULT 0,
      maghrib_checked INTEGER DEFAULT 0,
      maghrib_berjamaah INTEGER DEFAULT 0,
      isya_checked INTEGER DEFAULT 0,
      isya_berjamaah INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      UNIQUE(user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sermon_topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      created_by INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS friday_prayers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      khatib_name TEXT NOT NULL,
      sermon_topic_id INTEGER,
      summary TEXT NOT NULL,
      lesson TEXT,
      teacher_comment TEXT,
      teacher_score INTEGER,
      is_graded INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      UNIQUE(user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (sermon_topic_id) REFERENCES sermon_topics(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS doa_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      arabic_text TEXT NOT NULL,
      latin_text TEXT NOT NULL,
      translation TEXT NOT NULL,
      audio_url TEXT,
      category TEXT NOT NULL CHECK(category IN ('niat_puasa', 'berbuka', 'after_berbuka', 'sahur', 'lailatul_qadar')),
      created_by INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT,
      updated_at TEXT,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS doa_trackings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      doa_material_id INTEGER NOT NULL,
      memorized INTEGER DEFAULT 0,
      read_at TEXT,
      created_at TEXT,
      updated_at TEXT,
      UNIQUE(user_id, doa_material_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (doa_material_id) REFERENCES doa_materials(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS material_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'article',
      file_url TEXT,
      video_url TEXT,
      thumbnail TEXT,
      category_id INTEGER,
      created_by INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT,
      updated_at TEXT,
      FOREIGN KEY (category_id) REFERENCES material_categories(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      time_limit INTEGER DEFAULT 0,
      passing_score INTEGER DEFAULT 70,
      is_active INTEGER DEFAULT 1,
      created_by INTEGER NOT NULL,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      points INTEGER DEFAULT 1,
      created_at TEXT,
      updated_at TEXT,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      answer_text TEXT NOT NULL,
      is_correct INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      quiz_id INTEGER NOT NULL,
      score INTEGER DEFAULT 0,
      total_questions INTEGER DEFAULT 0,
      correct_answers INTEGER DEFAULT 0,
      time_taken INTEGER,
      answers_data TEXT,
      started_at TEXT,
      finished_at TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS journals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      content TEXT NOT NULL,
      mood TEXT,
      teacher_comment TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      created_by INTEGER,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      read_at TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS prayer_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      imsak TEXT NOT NULL,
      subuh TEXT NOT NULL,
      dzuhur TEXT NOT NULL,
      ashar TEXT NOT NULL,
      maghrib TEXT NOT NULL,
      isya TEXT NOT NULL,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS material_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      material_id INTEGER NOT NULL,
      read_at TEXT,
      created_at TEXT,
      updated_at TEXT
    );
  `);
}

async function seedData() {
  const database = getDb();

  // Cek apakah user admin sudah ada
  const existingAdmin = database.prepare('SELECT id FROM users WHERE id = 1').get();
  if (existingAdmin) return; // Sudah pernah di-seed

  const adminPassword = await bcrypt.hash('admin123', 10);
  const santriPassword = await bcrypt.hash('santri123', 10);
  const now = new Date().toISOString();

  // Seed users
  database.prepare(`
    INSERT INTO users (id, name, email, password, role, nisn, nip, class, is_active, created_at, updated_at)
    VALUES (1, 'Admin Guru', 'admin@smartbook.com', ?, 'guru', NULL, '1987654321', NULL, 1, ?, ?)
  `).run(adminPassword, now, now);

  database.prepare(`
    INSERT INTO users (id, name, email, password, role, nisn, nip, class, is_active, created_at, updated_at)
    VALUES (2, 'Santri Test', 'santri@smartbook.com', ?, 'siswa', '1234567890', NULL, 'XII-A', 1, ?, ?)
  `).run(santriPassword, now, now);

  // Seed sermon topics
  database.prepare(`
    INSERT INTO sermon_topics (id, title, description, date, status, created_by, created_at, updated_at)
    VALUES (1, 'Keutamaan 10 Hari Pertama Ramadhan', 'Membahas tentang keutamaan sepuluh hari pertama Ramadhan yang penuh rahmat.', NULL, 'active', 1, ?, ?)
  `).run(now, now);

  database.prepare(`
    INSERT INTO sermon_topics (id, title, description, date, status, created_by, created_at, updated_at)
    VALUES (2, 'Puasa dan Pembentukan Karakter', 'Bagaimana puasa membentuk karakter muslim yang bertakwa.', NULL, 'active', 1, ?, ?)
  `).run(now, now);

  database.prepare(`
    INSERT INTO sermon_topics (id, title, description, date, status, created_by, created_at, updated_at)
    VALUES (3, 'Malam Lailatul Qadar', 'Keutamaan malam Lailatul Qadar dan cara meraihnya.', NULL, 'active', 1, ?, ?)
  `).run(now, now);
}

// Wrapper agar kompatibel dengan mysql2/promise pool.query()
// Controller memanggil: const [rows] = await pool.query(sql, params)
// SQLite better-sqlite3: db.prepare(sql).all(params) atau .run(params)
const pool = {
  async query(sql, params = []) {
    const database = getDb();

    // Init database on first query
    if (!initialized) {
      createTables();
      await seedData();
      initialized = true;
    }

    const trimmedSQL = sql.trim().toUpperCase();

    // Handle SELECT queries
    if (trimmedSQL.startsWith('SELECT') || trimmedSQL.startsWith('WITH')) {
      const rows = database.prepare(sql).all(...params);
      // Konversi integer boolean fields (0/1) ke number untuk konsistensi
      return [rows, undefined];
    }

    // Handle INSERT
    if (trimmedSQL.startsWith('INSERT')) {
      const stmt = database.prepare(sql);
      const result = stmt.run(...params);
      return [{ affectedRows: result.changes, insertId: result.lastInsertRowid }, undefined];
    }

    // Handle UPDATE
    if (trimmedSQL.startsWith('UPDATE')) {
      const stmt = database.prepare(sql);
      const result = stmt.run(...params);
      return [{ affectedRows: result.changes }, undefined];
    }

    // Handle DELETE
    if (trimmedSQL.startsWith('DELETE')) {
      const stmt = database.prepare(sql);
      const result = stmt.run(...params);
      return [{ affectedRows: result.changes }, undefined];
    }

    // Fallback: try to run as-is
    try {
      const stmt = database.prepare(sql);
      if (trimmedSQL.startsWith('SELECT') || trimmedSQL.startsWith('WITH') || trimmedSQL.startsWith('PRAGMA')) {
        const rows = stmt.all(...params);
        return [rows, undefined];
      }
      const result = stmt.run(...params);
      return [{ affectedRows: result.changes, insertId: result.lastInsertRowid || 0 }, undefined];
    } catch (error) {
      throw error;
    }
  },

  async getConnection() {
    return pool;
  },

  end() {
    if (db) {
      db.close();
      db = null;
    }
  },
};

// Reset initialization state on module reload (Vercel cold start)
initialized = false;

module.exports = pool;