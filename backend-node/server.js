require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const worshipRoutes = require('./routes/worshipRoutes');
const jurnalRoutes = require('./routes/jurnalRoutes');
const quizRoutes = require('./routes/quizRoutes');
const doaRoutes = require('./routes/doaRoutes');
const doaTrackingRoutes = require('./routes/doaTrackingRoutes');
const fridayPrayerRoutes = require('./routes/fridayPrayerRoutes');
const materialsRoutes = require('./routes/materialsRoutes');
const materialsUploadRoutes = require('./routes/materialsUploadRoutes');
const sermonTopicsRoutes = require('./routes/sermonTopicsRoutes');
const prayerScheduleRoutes = require('./routes/prayerScheduleRoutes');


const dashboardRoutes = require('./routes/dashboardRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const managementRoutes = require('./routes/managementRoutes');
const questionRoutes = require('./routes/questionRoutes');
const studentManagementExtraRoutes = require('./routes/studentManagementExtraRoutes');
const { authenticate } = require('./middleware/auth');


const app = express();
const PORT = process.env.PORT || 3001;

// ──────────────────────────── MIDDLEWARE ────────────────────────────

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: { message: 'Terlalu banyak permintaan, coba lagi nanti' },
  skip: (req) => req.path.startsWith('/auth/'),
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ──────────────────────────── ROUTES ────────────────────────────

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


// Health check (SEBELUM managementRoutes agar tidak tertangkap)
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

// ──────────────────────────── START SERVER ────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 Smart Book Ramadan API running on http://localhost:${PORT}`);
  console.log(`📅 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Allowed origins: ${allowedOrigins.join(', ')}`);
});

module.exports = app;
