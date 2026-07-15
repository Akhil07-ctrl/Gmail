require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const gmailRoutes = require('./routes/gmail');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// Normalize client URL by stripping trailing slash if present
let clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
if (clientUrl.endsWith('/')) {
  clientUrl = clientUrl.slice(0, -1);
}

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/api/gmail', gmailRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Gmail Clone server running on http://localhost:${PORT}`);
});
