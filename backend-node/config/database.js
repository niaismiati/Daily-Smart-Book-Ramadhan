require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smartbook_ramadan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// PlanetScale dan layanan MySQL cloud lainnya membutuhkan SSL
if (process.env.DB_SSL === 'true') {
  dbConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = mysql.createPool(dbConfig);

module.exports = pool;
