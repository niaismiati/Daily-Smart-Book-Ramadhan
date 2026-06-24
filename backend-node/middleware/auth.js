const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set!');
  process.exit(1);
}

/**
 * JWT Authentication Middleware
 * Verifies Bearer token from Authorization header
 */
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role, name }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
  }
};

/**
 * Role-based Authorization Middleware
 * @param  {...string} roles - Allowed roles (e.g., 'siswa', 'guru')
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Belum terautentikasi' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    next();
  };
};

exports.checkRole = exports.authorize;

exports.allowSelfOrRole = (paramName = 'userId', ...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Belum terautentikasi' });
    }

    const requestedUserId = parseInt(req.params[paramName], 10);
    const isSelf = requestedUserId === parseInt(req.user.id, 10);
    const hasRole = roles.includes(req.user.role);

    if (!isSelf && !hasRole) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    next();
  };
};
