# Setup and environment variables

This document describes all keys and environment variables needed to run **Class Konnect** (backend and mobile).

## Backend

Run from the `backend/` directory. The app loads a `.env` file from `backend/` automatically (via `dotenv`). Copy `backend/.env.example` to `backend/.env` and set the values.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | HTTP port the server listens on. |
| `JWT_SECRET` | **Yes in production** | `dev-secret-change-in-production` | Secret used to sign and verify JWT tokens. Use a long, random string in production (e.g. 32+ chars). |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiry (e.g. `7d`, `24h`). |
| `QR_SECRET` | **Yes in production** | `qr-secret-dev` | Secret used to sign and verify session QR codes for attendance. Use a long, random string in production. |

**Example (production):**

```bash
export PORT=3000
export JWT_SECRET="your-long-random-jwt-secret"
export JWT_EXPIRES_IN="7d"
export QR_SECRET="your-long-random-qr-secret"
cd backend && pnpm run build && pnpm start
```

**Development:** Defaults work for local dev; set `JWT_SECRET` and `QR_SECRET` if you want to mirror production.

## Mobile

Run from the `mobile/` directory. Expo only exposes variables that start with `EXPO_PUBLIC_` to the app.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EXPO_PUBLIC_API_URL` | No* | `http://localhost:3000/api/v1` | Full base URL of the backend API (no trailing slash). |

\* Required when the app runs on a physical device or an emulator that cannot reach `localhost` (e.g. use `http://192.168.1.x:3000/api/v1` or your deployed backend URL).

**Using .env:** Copy `mobile/.env.example` to `mobile/.env` and set `EXPO_PUBLIC_API_URL` (e.g. `http://192.168.1.100:3000/api/v1`). Restart the Expo dev server after changing env vars.

## Summary checklist

- [ ] Backend: set `JWT_SECRET` and `QR_SECRET` for production (and optionally `PORT`, `JWT_EXPIRES_IN`).
- [ ] Mobile: set `EXPO_PUBLIC_API_URL` if the app cannot reach `http://localhost:3000/api/v1` (e.g. device or emulator).

### Google Sign-In (optional)

- **Backend:** `GOOGLE_CLIENT_IDS` — comma-separated OAuth client IDs from Google Cloud (see [GOOGLE_AND_EMAIL.md](GOOGLE_AND_EMAIL.md)).
- **Mobile:** `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`.

### Transactional email / SMTP (optional)

- **Backend:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, plus `MAIL_FROM` and `MAIL_FROM_NAME`. If omitted, welcome emails are only logged. Gmail App Passwords work for demos — see [GOOGLE_AND_EMAIL.md](GOOGLE_AND_EMAIL.md).

No other third-party API keys are required for the in-memory backend.
