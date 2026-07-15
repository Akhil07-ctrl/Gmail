const router = require('express').Router();
const authenticate = require('../middleware/authenticate');
const gmailService = require('../services/gmail.service');

// All routes require a valid session
router.use(authenticate);

/**
 * GET /api/gmail/profile
 * Returns the authenticated user's Google profile.
 */
router.get('/profile', async (req, res) => {
  try {
    const profile = await gmailService.getProfile(req.userId);
    res.json(profile);
  } catch (err) {
    console.error('Profile error:', err.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * GET /api/gmail/messages
 * Query params: label, pageToken, q (search query), maxResults
 */
router.get('/messages', async (req, res) => {
  try {
    const { label = 'INBOX', pageToken, q, maxResults = '50' } = req.query;
    const labelIds = label === 'ALL' ? [] : [label];
    const result = await gmailService.listMessages(req.userId, {
      labelIds,
      pageToken,
      q,
      maxResults: Math.min(parseInt(maxResults, 10) || 50, 100),
    });
    res.json(result);
  } catch (err) {
    console.error('List messages error:', err.message);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/**
 * GET /api/gmail/messages/:id
 * Returns the full message including HTML body.
 */
router.get('/messages/:id', async (req, res) => {
  try {
    const message = await gmailService.getMessage(req.userId, req.params.id);
    res.json(message);
  } catch (err) {
    console.error('Get message error:', err.message);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

/**
 * GET /api/gmail/labels
 * Returns all Gmail labels.
 */
router.get('/labels', async (req, res) => {
  try {
    const labels = await gmailService.listLabels(req.userId);
    res.json({ labels });
  } catch (err) {
    console.error('Labels error:', err.message);
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
});

/**
 * POST /api/gmail/messages/:id/read
 * Marks a message as read.
 */
router.post('/messages/:id/read', async (req, res) => {
  try {
    await gmailService.markAsRead(req.userId, req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Mark read error:', err.message);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

/**
 * POST /api/gmail/messages/:id/star
 * Toggle star on a message. Body: { starred: boolean }
 */
router.post('/messages/:id/star', async (req, res) => {
  try {
    const { starred = true } = req.body;
    await gmailService.toggleStar(req.userId, req.params.id, starred);
    res.json({ success: true });
  } catch (err) {
    console.error('Star error:', err.message);
    res.status(500).json({ error: 'Failed to update star' });
  }
});

module.exports = router;
