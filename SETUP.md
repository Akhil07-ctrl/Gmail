# Gmail Clone — Google Cloud Setup Guide

Follow these steps to configure Google OAuth and enable the Gmail API.

---

## Step 1 — Create a Google Cloud Project

1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Click the project selector (top-left) → **New Project**
3. Name it `Gmail Clone` → **Create**
4. Make sure the new project is selected in the top-left dropdown

---

## Step 2 — Enable the Gmail API

1. In the left menu go to **APIs & Services → Library**
2. Search for **Gmail API**
3. Click **Gmail API** → **Enable**

---

## Step 3 — Configure OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External** → **Create**
3. Fill in:
   - App name: `Gmail Clone`
   - User support email: your email
   - Developer contact: your email
4. Click **Save and Continue** through all steps
5. On the **Test users** step, add your Gmail address (required while app is in testing)
6. Click **Save and Continue** → **Back to Dashboard**

---

## Step 4 — Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Name: `Gmail Clone Web Client`
5. Under **Authorized redirect URIs**, click **+ Add URI** and enter:
   ```
   http://localhost:3001/auth/google/callback
   ```
6. Click **Create**
7. A popup shows your **Client ID** and **Client Secret** — copy both

---

## Step 5 — Configure Environment Variables

In the `server/` folder, copy `.env.example` to `.env`:

```bash
cd server
copy .env.example .env
```

Edit `server/.env` and fill in your values:

```env
GOOGLE_CLIENT_ID=123456789-abc...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
JWT_SECRET=any_random_string_min_32_characters_long
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

> **JWT_SECRET**: Use any long random string. You can generate one with:
> ```powershell
> -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 48 | ForEach-Object {[char]$_})
> ```

---

## Step 6 — Install Dependencies

Open two terminals.

**Terminal 1 — Backend:**
```powershell
cd "f:\AKHIL\NxtWave\Gmail Clone\server"
npm install
```

**Terminal 2 — Frontend:**
```powershell
cd "f:\AKHIL\NxtWave\Gmail Clone\client"
npm install
```

---

## Step 7 — Run the Application

**Terminal 1 — Start backend:**
```powershell
cd "f:\AKHIL\NxtWave\Gmail Clone\server"
node index.js
```
You should see: `✅  Gmail Clone server running on http://localhost:3001`

**Terminal 2 — Start frontend:**
```powershell
cd "f:\AKHIL\NxtWave\Gmail Clone\client"
npm run dev
```
You should see: `Local: http://localhost:5173/`

---

## Step 8 — Use the App

1. Open [http://localhost:5173](http://localhost:5173) in your browser
2. Click **Continue with Google**
3. Google will ask you to sign in and grant Gmail read access
4. After consent, you'll be redirected back to your inbox
5. Your real Gmail messages will appear!

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `redirect_uri_mismatch` | Make sure `http://localhost:3001/auth/google/callback` is in your Authorized Redirect URIs |
| `Access blocked: App not verified` | Add your email as a Test User in OAuth consent screen |
| `No tokens found for user` | Server was restarted — log out and sign in again |
| CORS errors | Make sure `CLIENT_URL=http://localhost:5173` in `.env` |
| Blank iframe / email body missing | Normal for some emails — plain text fallback is shown |
