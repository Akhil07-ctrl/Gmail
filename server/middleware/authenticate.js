const jwt = require('jsonwebtoken');

/**
 * Middleware to verify the JWT stored in the httpOnly cookie.
 * Attaches req.userId (Google sub) on success.
 */
function authenticate(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authenticate;
