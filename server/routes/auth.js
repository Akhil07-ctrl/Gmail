const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const { getAuthUrl, exchangeCode, storeTokens } = require('../services/oauth.service');

/**
 * GET /auth/google
 * Redirect the user to Google's OAuth consent page.
 */
router.get('/google', (_req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

/**
 * GET /auth/google/callback
 * Exchange the authorization code for tokens, store them server-side,
 * issue a JWT in an httpOnly cookie, and redirect to the frontend.
 */
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect(
      `${process.env.CLIENT_URL}?auth_error=${encodeURIComponent(error || 'no_code')}`
    );
  }

  try {
    const tokens = await exchangeCode(code);

    // Decode the id_token to get user info (sub, email, name, picture)
    const ticket = await new (require('googleapis').google.auth.OAuth2)(
      process.env.GOOGLE_CLIENT_ID
    ).verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userId = payload.sub;

    // Store refresh + access tokens server-side
    storeTokens(userId, tokens);

    // Issue a session JWT (contains only the userId)
    const jwtToken = jwt.sign(
      { sub: userId, email: payload.email, name: payload.name, picture: payload.picture },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set as httpOnly, sameSite, secure cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(`${process.env.CLIENT_URL}/inbox`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.redirect(`${process.env.CLIENT_URL}?auth_error=callback_failed`);
  }
});

/**
 * GET /auth/me
 * Return the decoded JWT payload (used by the frontend to check login state).
 */
router.get('/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ sub: payload.sub, email: payload.email, name: payload.name, picture: payload.picture });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * POST /auth/logout
 * Clear the session cookie.
 */
router.post('/logout', (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.json({ success: true });
});

module.exports = router;
