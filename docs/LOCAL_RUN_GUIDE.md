# Complete Local Run Guide (Kid Friendly)

This guide is written to be very simple.
Follow it in order and your app will run.

---

## 0) What you need (install once)

1. Install **Node.js 18+** from [nodejs.org](https://nodejs.org)
2. Install **pnpm** (open terminal and run):

```bash
npm install -g pnpm
```

3. Install **Expo Go** on your phone
   - Android: Play Store
   - iPhone: App Store
4. Keep your laptop + phone on the **same Wi-Fi**

---

## 1) Open the project

Open terminal in:

`c:\Users\yashb\Desktop\personal\Classes`

Install packages:

```bash
pnpm install
```

---

## 2) Create and fill env files (important)

You need 2 env files:
- `backend/.env`
- `mobile/.env`

### A) Backend env file

Copy example file:

```bash
copy backend\.env.example backend\.env
```

Open `backend/.env` and put values like this:

```env
PORT=3000
JWT_SECRET=replace-with-long-random-string-1
JWT_EXPIRES_IN=7d
QR_SECRET=replace-with-long-random-string-2
```

#### How to generate JWT_SECRET and QR_SECRET quickly

Run this command once (copy output = first secret):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run it again (copy output = second secret).

Then paste:
- first output -> `JWT_SECRET`
- second output -> `QR_SECRET`

Use **different** values for both.

### B) Mobile env file

Copy example file:

```bash
copy mobile\.env.example mobile\.env
```

Open `mobile/.env` and set:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LAPTOP_IP:3000/api/v1
```

#### How to find YOUR_LAPTOP_IP (Windows)

In terminal run:

```bash
ipconfig
```

Find your Wi-Fi adapter and copy **IPv4 Address** (example: `192.168.1.109`).

So your final value becomes:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.109:3000/api/v1
```

Important:
- No trailing slash at the end
- If you change `.env`, restart Expo

### C) Demo login (optional — try the app without registering)

1. In **`backend/.env`** add:

```env
SEED_DEMO_USERS=true
```

2. In **`mobile/.env`** add:

```env
EXPO_PUBLIC_SHOW_DEMO_LOGIN=true
```

3. Restart the backend, then restart Expo.

4. On **Sign in**, tap **Teacher**, **Student**, or **Parent** — fields fill with demo emails/passwords — then tap **Sign in**.

Default passwords are **`demo1234`** (see `backend/.env.example` to change emails/passwords). **Turn off `SEED_DEMO_USERS` in production.**

---

## 3) Run app (every time)

Open **2 terminals** in project root.

### Terminal 1 (backend)

```bash
npx kill-port 3000
pnpm dev:backend
```

Backend should run at:
- `http://localhost:3000/health`

### Terminal 2 (mobile)

```bash
npx kill-port 8081
pnpm --filter classes-mobile start -- --clear
```

Then:
1. Open Expo Go on phone
2. Scan QR code from terminal

---

## 4) Quick health checks

### Check backend is alive

Open in browser:
- `http://localhost:3000/health`

Should return JSON with `"status":"ok"`.

### Check phone can reach backend

Open this on your phone browser:
- `http://YOUR_LAPTOP_IP:3000/health`

If this does not open:
- phone/laptop not on same Wi-Fi, or
- wrong IP in `mobile/.env`

---

## 5) Common problems and fast fixes

### Problem: Port already in use

```bash
npx kill-port 3000 8081
```

Then restart backend and mobile.

### Problem: App stuck loading

Usually `EXPO_PUBLIC_API_URL` is wrong.
Re-check `mobile/.env` and confirm phone can open `/health`.

### Problem: Env changes not applying

Stop Expo and run with clear cache:

```bash
pnpm --filter classes-mobile start -- --clear
```

---

## 6) Presentation day checklist

- [ ] `backend/.env` exists and has JWT/QR secrets
- [ ] `mobile/.env` has correct laptop IP
- [ ] Phone + laptop on same Wi-Fi
- [ ] Backend terminal running
- [ ] Mobile terminal running with `--clear`
- [ ] `/health` works on laptop and phone browser

If all are checked, demo should run correctly.

---

## 7) Optional: Google sign-in and real emails

See **[GOOGLE_AND_EMAIL.md](GOOGLE_AND_EMAIL.md)** for:

- Google Cloud OAuth (Web + iOS + Android client IDs)
- Backend `GOOGLE_CLIENT_IDS` and mobile `EXPO_PUBLIC_GOOGLE_*` variables
- Gmail / SMTP for welcome emails (`SMTP_*`, `MAIL_FROM*`)

