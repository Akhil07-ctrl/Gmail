# Gmail Clone

A production-quality Gmail-like inbox built with **React + Vite** (frontend) and **Node.js + Express** (backend), powered by the **Gmail API** and **Google OAuth 2.0**.

---

## Features

- 🔐 **Google OAuth 2.0** — Secure sign-in; tokens never exposed to the frontend
- 📬 **Real Gmail Data** — Reads your actual inbox via the Gmail API
- 🏷️ **Labels** — Inbox, Starred, Sent, Drafts, Trash, and user-defined labels
- 🔍 **Search** — Full Gmail search syntax support (debounced)
- 📖 **Email Viewer** — HTML body rendered in sandboxed iframe; plain-text fallback
- ⭐ **Star Toggle** — Optimistic star/unstar with server sync
- 📄 **Infinite Scroll** — Auto-loads more emails as you scroll
- 💀 **Skeleton Loaders** — Smooth loading states
- 🌙 **Dark / Light Mode** — Toggles and persists in localStorage
- 📱 **Responsive** — Split-pane layout that adapts to window size

---

## Architecture

```
Gmail Clone/
├── client/          React + Vite + Tailwind CSS frontend
│   └── src/
│       ├── components/   UI components (Sidebar, Topbar, EmailList, EmailViewer)
│       ├── context/      AuthContext (session management)
│       ├── hooks/        useEmails, useTheme
│       └── services/     Axios API client
│
└── server/          Node.js + Express backend
    ├── routes/       /auth (OAuth) and /api/gmail (Gmail API proxy)
    ├── services/     oauth.service.js, gmail.service.js
    └── middleware/   JWT authentication
```

---

## Quick Start

See **[SETUP.md](./SETUP.md)** for the complete setup guide.

```powershell
# Terminal 1 - Backend
cd server
copy .env.example .env   # then fill in your credentials
npm install
node index.js

# Terminal 2 - Frontend
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 6 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| HTTP | Axios |
| Backend | Node.js + Express |
| Auth | Google OAuth 2.0 (`googleapis`) |
| Session | JWT in httpOnly cookie |

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/auth/google` | Start OAuth flow |
| GET | `/auth/google/callback` | OAuth callback |
| GET | `/auth/me` | Get current user |
| POST | `/auth/logout` | Sign out |
| GET | `/api/gmail/messages` | List messages |
| GET | `/api/gmail/messages/:id` | Get full message |
| GET | `/api/gmail/labels` | List labels |
| POST | `/api/gmail/messages/:id/read` | Mark as read |
| POST | `/api/gmail/messages/:id/star` | Toggle star |

---

## Planned Features

- [ ] Compose new email
- [ ] Reply / Forward
- [ ] Archive / Delete
- [ ] AI email summary
- [ ] AI reply suggestions
- [ ] Attachment support
- [ ] Keyboard shortcuts
- [ ] Persistent token storage (database)
