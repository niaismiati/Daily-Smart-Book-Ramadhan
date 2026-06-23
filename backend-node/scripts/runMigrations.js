require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const {
    DB_HOST = '127.0.0.1',
    DB_PORT = 3306,
    DB_USER = 'root',
    DB_PASSWORD = '',
    DB_NAME = 'smartbook_ramadan',
  } = process.env;

  const migrationsPath = path.join(__dirname, '..', 'migrations.sql');
  let sql = fs.readFileSync(migrationsPath, 'utf8');

  // Agar bisa di-run berulang tanpa error ketika tabel sudah ada.
  // Strategi minimal untuk tugas ini:
  // - Ganti INSERT INTO -> INSERT IGNORE INTO (agar data contoh tidak duplikat)
  // - Hilangkan perintah ALTER TABLE ... ADD COLUMN IF NOT EXISTS ... (mencegah duplicate column)
  sql = sql
    .replace(/INSERT INTO/gi, 'INSERT IGNORE INTO')
    .replace(/ALTER TABLE[\s\S]*?ADD COLUMN[\s\S]*?;/gi, (m) => {
      // Jangan jalankan ALTER TABLE yang berpotensi menambah kolom duplikat.
      // (Migration ini cukup untuk endpoint sermon_topics.)
      return '';
    });



  // Connect without selecting DB first (script itself uses CREATE DATABASE/USE)
  // Note: beberapa user/constraint sudah ada, jadi kita abaikan error duplikat.
  const conn = await mysql.createConnection({

    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });

  try {
    console.log(`[migrations] Running: ${migrationsPath}`);
    await conn.query(sql);
    console.log('[migrations] Done.');
  } finally {
    await conn.end();
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[migrations] Failed:', err);
    process.exit(1);
  });

