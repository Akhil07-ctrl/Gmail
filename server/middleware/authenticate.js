const jwt = require('jsonwebtoken');
const { hasTokens } = require('../services/oauth.service');

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

    // Check if Google OAuth tokens exist in memory
    if (!hasTokens(req.userId)) {
      res.clearCookie('token', {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authenticate;
