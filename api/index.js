// Vercel Serverless Function - Main API Entry Point
// This file requires modules from ../backend-node/ directory

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// ──────────────────────────── ROUTES ────────────────────────────
const authRoutes = require('../backend-node/routes/authRoutes');
const profileRoutes = require('../backend-node/routes/profileRoutes');
const worshipRoutes = require('../backend-node/routes/worshipRoutes');
const jurnalRoutes = require('../backend-node/routes/jurnalRoutes');
const quizRoutes = require('../backend-node/routes/quizRoutes');
const doaRoutes = require('../backend-node/routes/doaRoutes');
const doaTrackingRoutes = require('../backend-node/routes/doaTrackingRoutes');
const fridayPrayerRoutes = require('../backend-node/routes/fridayPrayerRoutes');
const materialsRoutes = require('../backend-node/routes/materialsRoutes');
const materialsUploadRoutes = require('../backend-node/routes/materialsUploadRoutes');
const sermonTopicsRoutes = require('../backend-node/routes/sermonTopicsRoutes');
const prayerScheduleRoutes = require('../backend-node/routes/prayerScheduleRoutes');
const dashboardRoutes = require('../backend-node/routes/dashboardRoutes');
const reportsRoutes = require('../backend-node/routes/reportsRoutes');
const managementRoutes = require('../backend-node/routes/managementRoutes');
const questionRoutes = require('../backend-node/routes/questionRoutes');
const studentManagementExtraRoutes = require('../backend-node/routes/studentManagementExtraRoutes');
const { authenticate } = require('../backend-node/middleware/auth');

const app = express();

// ──────────────────────────── MIDDLEWARE ────────────────────────────

// Security headers
app.use(helmet());

// CORS - allow all origins in production for Vercel
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }
      callback(null, true);
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { message: 'Terlalu banyak permintaan, coba lagi nanti' },
  skip: (req) => req.path.startsWith('/auth/'),
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'backend-node', 'uploads')));

// ──────────────────────────── PUBLIC ROUTES ────────────────────────────

const publicApiRoutes = [
  { method: 'GET', path: '/api/health' },
  { method: 'POST', path: '/api/auth/login' },
  { method: 'POST', path: '/api/auth/register' },
];

app.use('/api', (req, res, next) => {
  const requestPath = `${req.baseUrl}${req.path}`;
  const isPublicRoute = publicApiRoutes.some(
    (route) => route.method === req.method && route.path === requestPath
  );

  if (req.method === 'OPTIONS' || isPublicRoute) {
    return next();
  }

  return authenticate(req, res, next);
});

// ──────────────────────────── ROUTE MOUNTING ────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/worship', worshipRoutes);
app.use('/api/prayer-schedule', prayerScheduleRoutes);
app.use('/api/friday-prayer', fridayPrayerRoutes);
app.use('/api/journals', jurnalRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/doa', doaRoutes);
app.use('/api/doa-trackings', doaTrackingRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/materials', materialsUploadRoutes);
app.use('/api/sermon-topics', sermonTopicsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/questions', questionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api', managementRoutes);
app.use('/api/teacher', managementRoutes);
app.use('/api/teacher', studentManagementExtraRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Smart Book Ramadan API',
    status: 'running',
    docs: '/api/health',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/login',
      worship: '/api/worship',
      journals: '/api/journals',
      quizzes: '/api/quizzes',
      materials: '/api/materials',
      reports: '/api/reports',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Terjadi kesalahan server internal' });
});

// ──────────────────────────── EXPORT FOR VERCEL ────────────────────────────

module.exports = app;