const { google } = require('googleapis');
const { getAuthenticatedClient } = require('./oauth.service');

/**
 * Get authenticated Gmail API instance for a user.
 */
function getGmail(userId) {
  const auth = getAuthenticatedClient(userId);
  return google.gmail({ version: 'v1', auth });
}

/**
 * Get the user's Gmail profile (email, name, photo).
 */
async function getProfile(userId) {
  const auth = getAuthenticatedClient(userId);
  const oauth2 = google.oauth2({ version: 'v2', auth });
  const { data } = await oauth2.userinfo.get();
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}

/**
 * List messages for a given label (default: INBOX).
 * Returns lightweight message stubs with parsed headers.
 */
async function listMessages(userId, { labelIds = ['INBOX'], pageToken, q, maxResults = 50 } = {}) {
  const gmail = getGmail(userId);

  const params = { userId: 'me', maxResults, labelIds };
  if (pageToken) params.pageToken = pageToken;
  if (q) params.q = q;

  const { data } = await gmail.users.messages.list(params);
  const messages = data.messages || [];
  const nextPageToken = data.nextPageToken || null;

  // Fetch metadata for each message in parallel (batches of 20)
  const BATCH = 20;
  const detailed = [];
  for (let i = 0; i < messages.length; i += BATCH) {
    const batch = messages.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map((m) =>
        gmail.users.messages.get({
          userId: 'me',
          id: m.id,
          format: 'metadata',
          metadataHeaders: ['From', 'To', 'Subject', 'Date'],
        })
      )
    );
    detailed.push(...results.map((r) => r.data));
  }

  return { messages: detailed.map(parseMessageMeta), nextPageToken };
}

/**
 * Get a single full message (with HTML body).
 */
async function getMessage(userId, messageId) {
  const gmail = getGmail(userId);
  const { data } = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });
  return parseMessageFull(data);
}

/**
 * List all labels for a user.
 */
async function listLabels(userId) {
  const gmail = getGmail(userId);
  const { data } = await gmail.users.labels.list({ userId: 'me' });
  return data.labels || [];
}

/**
 * Mark a message as read (removes UNREAD label).
 */
async function markAsRead(userId, messageId) {
  const gmail = getGmail(userId);
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: { removeLabelIds: ['UNREAD'] },
  });
}

/**
 * Toggle star on a message.
 */
async function toggleStar(userId, messageId, starred) {
  const gmail = getGmail(userId);
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: starred
      ? { addLabelIds: ['STARRED'] }
      : { removeLabelIds: ['STARRED'] },
  });
}

// ── Parsers ──────────────────────────────────────────────────────────────────

function parseMessageMeta(msg) {
  const headers = Object.fromEntries(
    (msg.payload?.headers || []).map((h) => [h.name.toLowerCase(), h.value])
  );
  return {
    id: msg.id,
    threadId: msg.threadId,
    labelIds: msg.labelIds || [],
    snippet: msg.snippet || '',
    internalDate: msg.internalDate,
    from: headers['from'] || '',
    to: headers['to'] || '',
    subject: headers['subject'] || '(no subject)',
    date: headers['date'] || '',
    isUnread: (msg.labelIds || []).includes('UNREAD'),
    isStarred: (msg.labelIds || []).includes('STARRED'),
  };
}

function parseMessageFull(msg) {
  const meta = parseMessageMeta(msg);
  const body = extractBody(msg.payload);
  return { ...meta, body };
}

/**
 * Recursively extract the HTML (or plain text) body from a Gmail payload.
 */
function extractBody(payload) {
  if (!payload) return '';

  // Direct body data
  if (payload.body?.data) {
    const decoded = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    if (payload.mimeType === 'text/html') return { html: decoded, text: '' };
    if (payload.mimeType === 'text/plain') return { html: '', text: decoded };
  }

  // Multipart: collect html and plain text parts
  if (payload.parts) {
    let html = '';
    let text = '';
    for (const part of payload.parts) {
      const result = extractBody(part);
      if (result.html) html = result.html;
      if (result.text && !text) text = result.text;
    }
    return { html, text };
  }

  return { html: '', text: '' };
}

module.exports = { getProfile, listMessages, getMessage, listLabels, markAsRead, toggleStar };
