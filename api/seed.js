// Vercel Serverless Function - Database Seeder
// Akses URL ini setelah set environment variables database:
// https://daily-smart-book-ramadhan-b8l5.vercel.app/api/seed

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  // Hanya allow GET request
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    DB_HOST,
    DB_PORT = 3306,
    DB_USER,
    DB_PASSWORD,
    DB_NAME = 'smartbook_ramadan',
  } = process.env;

  if (!DB_HOST || !DB_USER || !DB_PASSWORD) {
    return res.status(400).json({
      message: 'Environment variables database belum diatur. Set DB_HOST, DB_USER, DB_PASSWORD di Vercel.',
    });
  }

  let conn;
  try {
    conn = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      multipleStatements: true,
      ssl: process.env.DB_SSL === 'true' ? {} : undefined,
    });

    // ========== CREATE TABLES ==========
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE DEFAULT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('siswa', 'guru') NOT NULL,
        nisn VARCHAR(255) UNIQUE DEFAULT NULL,
        nip VARCHAR(255) UNIQUE DEFAULT NULL,
        \`class\` VARCHAR(255) DEFAULT NULL,
        phone VARCHAR(255) DEFAULT NULL,
        photo_url VARCHAR(255) DEFAULT NULL,
        is_active TINYINT(1) DEFAULT 1,
        remember_token VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP NULL DEFAULT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS classes (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        wali_kelas_id BIGINT UNSIGNED DEFAULT NULL,
        created_at TIMESTAMP NULL DEFAULT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS prayer_trackings (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        date DATE NOT NULL,
        subuh_checked TINYINT(1) DEFAULT 0,
        subuh_berjamaah TINYINT(1) DEFAULT 0,
        dzuhur_checked TINYINT(1) DEFAULT 0,
        dzuhur_berjamaah TINYINT(1) DEFAULT 0,
        ashar_checked TINYINT(1) DEFAULT 0,
        ashar_berjamaah TINYINT(1) DEFAULT 0,
        maghrib_checked TINYINT(1) DEFAULT 0,
        maghrib_berjamaah TINYINT(1) DEFAULT 0,
        isya_checked TINYINT(1) DEFAULT 0,
        isya_berjamaah TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP NULL DEFAULT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY (user_id, date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS sermon_topics (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        date DATE DEFAULT NULL,
        status ENUM('active','inactive') DEFAULT 'active',
        created_by BIGINT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS friday_prayers (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        date DATE NOT NULL,
        khatib_name VARCHAR(255) NOT NULL,
        sermon_topic_id BIGINT UNSIGNED DEFAULT NULL,
        summary TEXT NOT NULL,
        lesson TEXT DEFAULT NULL,
        teacher_comment TEXT DEFAULT NULL,
        teacher_score INT DEFAULT NULL,
        is_graded TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP NULL DEFAULT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY (user_id, date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS doa_materials (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        arabic_text TEXT NOT NULL,
        latin_text TEXT NOT NULL,
        translation TEXT NOT NULL,
        audio_url VARCHAR(255) DEFAULT NULL,
        category ENUM('niat_puasa', 'berbuka', 'after_berbuka', 'sahur', 'lailatul_qadar') NOT NULL,
        created_by BIGINT UNSIGNED NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP NULL DEFAULT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS doa_trackings (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        doa_material_id BIGINT UNSIGNED NOT NULL,
        memorized TINYINT(1) DEFAULT 0,
        read_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP NULL DEFAULT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY (user_id, doa_material_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS material_categories (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP NULL DEFAULT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS materials (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        type VARCHAR(255) DEFAULT 'article',
        file_url VARCHAR(255) DEFAULT NULL,
        video_url VARCHAR(255) DEFAULT NULL,
        thumbnail VARCHAR(255) DEFAULT NULL,
        category_id BIGINT UNSIGNED DEFAULT NULL,
        created_by BIGINT UNSIGNED NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP NULL DEFAULT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS quizzes (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        time_limit INT DEFAULT 0,
        passing_score INT DEFAULT 70,
        is_active TINYINT(1) DEFAULT 1,
        created_by BIGINT UNSIGNED NOT NULL,
        created_at TIMESTAMP NULL DEFAULT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS questions (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        quiz_id BIGINT UNSIGNED NOT NULL,
        question_text TEXT NOT NULL,
        points INT DEFAULT 1,
        created_at TIMESTAMP NULL DEFAULT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS answers (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        question_id BIGINT UNSIGNED NOT NULL,
        answer_text TEXT NOT NULL,
        is_correct TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP NULL DEFAULT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS quiz_results (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        quiz_id BIGINT UNSIGNED NOT NULL,
        score INT DEFAULT 0,
        total_questions INT DEFAULT 0,
        correct_answers INT DEFAULT 0,
        time_taken INT DEFAULT NULL,
        answers_data JSON DEFAULT NULL,
        started_at TIMESTAMP NULL DEFAULT NULL,
        finished_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP NULL DEFAULT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS journals (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        date DATE NOT NULL,
        content TEXT NOT NULL,
        mood VARCHAR(255) DEFAULT NULL,
        teacher_comment TEXT DEFAULT NULL,
        created_at TIMESTAMP NULL DEFAULT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS notifications (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        created_by BIGINT UNSIGNED DEFAULT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(255) DEFAULT 'info',
        is_read TINYINT(1) DEFAULT 0,
        read_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP NULL DEFAULT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS prayer_schedules (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        date DATE NOT NULL UNIQUE,
        imsak VARCHAR(255) NOT NULL,
        subuh VARCHAR(255) NOT NULL,
        dzuhur VARCHAR(255) NOT NULL,
        ashar VARCHAR(255) NOT NULL,
        maghrib VARCHAR(255) NOT NULL,
        isya VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NULL DEFAULT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS material_readings (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        material_id BIGINT UNSIGNED NOT NULL,
        read_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP NULL DEFAULT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await conn.query(createTablesSQL);

    // ========== SEED USERS ==========
    const adminPassword = await bcrypt.hash('admin123', 10);
    const santriPassword = await bcrypt.hash('santri123', 10);

    await conn.query(
      `INSERT IGNORE INTO users (id, name, email, password, role, nisn, nip, \`class\`, is_active, created_at, updated_at) VALUES
      (1, 'Admin Guru', 'admin@smartbook.com', ?, 'guru', NULL, '1987654321', NULL, 1, NOW(), NOW()),
      (2, 'Santri Test', 'santri@smartbook.com', ?, 'siswa', '1234567890', NULL, 'XII-A', 1, NOW(), NOW())`,
      [adminPassword, santriPassword]
    );

    // ========== SEED SERMON TOPICS ==========
    await conn.query(
      `INSERT IGNORE INTO sermon_topics (id, title, description, date, status, created_by, created_at, updated_at) VALUES
      (1, 'Keutamaan 10 Hari Pertama Ramadhan', 'Membahas tentang keutamaan sepuluh hari pertama Ramadhan yang penuh rahmat.', NULL, 'active', 1, NOW(), NOW()),
      (2, 'Puasa dan Pembentukan Karakter', 'Bagaimana puasa membentuk karakter muslim yang bertakwa.', NULL, 'active', 1, NOW(), NOW()),
      (3, 'Malam Lailatul Qadar', 'Keutamaan malam Lailatul Qadar dan cara meraihnya.', NULL, 'active', 1, NOW(), NOW())`
    );

    return res.json({
      success: true,
      message: 'Database berhasil disetup!',
      accounts: {
        admin: { credential: 'admin@smartbook.com', password: 'admin123', role: 'guru' },
        santri: { credential: '1234567890', password: 'santri123', role: 'siswa' },
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal seed database: ' + error.message,
      hint: 'Pastikan environment variables DB_HOST, DB_USER, DB_PASSWORD sudah diset di Vercel Settings.',
    });
  } finally {
    if (conn) await conn.end();
  }
};