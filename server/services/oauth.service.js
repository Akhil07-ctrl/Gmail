const { google } = require('googleapis');

// ── In-memory token store (keyed by userId = Google sub) ────────────────────
// In production, replace this with a database (PostgreSQL, MongoDB, etc.)
const tokenStore = new Map();

function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

function getAuthUrl() {
  const oauth2Client = createOAuth2Client();
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'openid',
    'profile',
    'email',
  ];
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // always get refresh_token
  });
}

async function exchangeCode(code) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

function getAuthenticatedClient(userId) {
  const tokens = tokenStore.get(userId);
  if (!tokens) throw new Error('No tokens found for user');
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);

  // Auto-refresh: persist updated tokens
  oauth2Client.on('tokens', (newTokens) => {
    const merged = { ...tokens, ...newTokens };
    tokenStore.set(userId, merged);
  });

  return oauth2Client;
}

function storeTokens(userId, tokens) {
  tokenStore.set(userId, tokens);
}

function hasTokens(userId) {
  return tokenStore.has(userId);
}

module.exports = { getAuthUrl, exchangeCode, getAuthenticatedClient, storeTokens, hasTokens };
