const jwt = require('jsonwebtoken');

/**
 * verifyToken
 * Middleware that validates the JWT from the Authorization header.
 * On success, attaches the decoded payload to req.user and calls next().
 * On failure, returns 401 Unauthorized.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Acesso negado. Nenhum token fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // { id, name, email, cargo, foto_url, role }
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token inválido ou expirado.' });
  }
};

/**
 * requireRole(rolesArray)
 * Factory that returns a middleware checking if the logged-in user's role
 * is included in the allowed rolesArray.
 * Must be used AFTER verifyToken.
 * Returns 403 Forbidden if the role is not allowed.
 *
 * Usage:
 *   router.get('/admin-only', verifyToken, requireRole(['admin']), handler);
 */
const requireRole = (rolesArray) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ msg: 'Acesso negado. Role do usuário não encontrada.' });
    }

    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({
        msg: `Acesso negado. Requer um dos seguintes roles: ${rolesArray.join(', ')}.`,
      });
    }

    next();
  };
};

module.exports = { verifyToken, requireRole };
