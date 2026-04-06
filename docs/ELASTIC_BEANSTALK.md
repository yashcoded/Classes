# Create Elastic Beanstalk for Class Konnect (first time)

This guide walks you through creating an **AWS Elastic Beanstalk** environment from scratch and deploying the **Class Konnect** backend (Docker). Use **Asia Pacific (Mumbai) `ap-south-1`** if you want Indian users close to the server.

---

## What you need first

- An **AWS account** (root or IAM user with permission to create Elastic Beanstalk, EC2, and related resources).
- **Backend secrets** ready locally (same values you will paste in EB): `JWT_SECRET`, `QR_SECRET`, optional `JWT_EXPIRES_IN`, `GOOGLE_CLIENT_IDS` — see [SETUP_KEYS.md](SETUP_KEYS.md).
- A built backend: TypeScript compiled to `backend/dist/`.

---

## Part 1 — Build the backend locally

From the **repository root** (or `backend/`):

```powershell
cd path\to\Classes\backend
pnpm install
pnpm run build
```

Confirm `backend/dist/` exists and contains `server.js`.

**Lockfile for Docker:** The Dockerfile runs `npm ci`, which requires `package-lock.json` to match `package.json`. If you add dependencies with pnpm only, refresh the lockfile before zipping:

```powershell
cd backend
npm install --package-lock-only
```

---

## Part 2 — Prepare the upload bundle (Docker)

This project uses `backend/Dockerfile`, which expects:

- `package.json` + lockfile
- `dist/` (compiled JS)

Create a **zip** that contains **at the root of the zip**:

- `Dockerfile`
- `package.json`
- `package-lock.json` (EB’s Dockerfile uses `npm ci`; keep `package-lock.json` in repo)
- `dist/` folder

### Do not use `Compress-Archive` on Windows for this

PowerShell **`Compress-Archive`** writes ZIP entries with **backslashes** as path separators. Linux `unzip` on Elastic Beanstalk then fails with:

`appears to use backslashes as path separators` → deployment error.

### Recommended: repo script (works on Windows + macOS/Linux)

From `backend/` after `pnpm run build`:

```powershell
pnpm run zip:eb
```

This creates **`backend-eb-upload.zip`** at the **repository root** (next to `backend/`). Upload that file to Elastic Beanstalk.

### Manual alternatives (POSIX-style zip)

**Windows 10+** (built-in `tar`):

```powershell
cd path\to\Classes\backend
tar.exe -a -c -f ..\backend-eb-upload.zip Dockerfile package.json package-lock.json dist
```

**Git Bash:**

```bash
cd backend
zip -r ../backend-eb-upload.zip Dockerfile package.json package-lock.json dist
```

If `package-lock.json` is missing, run `npm install --package-lock-only` once in `backend/` to generate it.

---

## Part 3 — Create the Elastic Beanstalk application (console)

1. Sign in to **[AWS Console](https://console.aws.amazon.com)**.
2. **Region (top right):** choose **Asia Pacific (Mumbai) `ap-south-1`**.
3. In the search bar, type **Elastic Beanstalk** → open **Elastic Beanstalk**.
4. If you see **Create application**, use it. Otherwise **Create environment**.

### Create environment (web server)

5. Choose **Web server environment** (HTTP traffic).
6. **Application name:** e.g. `class-konnect-api` (or any name you like).
7. **Environment name:** e.g. `class-konnect-api-prod` (must be unique in the account/region).
8. **Domain:** optional prefix for `*.elasticbeanstalk.com` (must be unique).
9. **Platform:**
   - **Docker**
   - Platform branch: **Docker running on 64bit Amazon Linux 2023** (or the latest **Docker** option AWS shows).
10. **Application code:** **Upload your code** → upload `backend-eb-upload.zip` (from Part 2).
11. **Presets:** **Single instance (free tier eligible)** is OK to start; for production you may choose **High availability** later.
12. Review **Service access** / **EC2 key pair** if prompted — defaults often work; attach a key pair only if you need SSH to the instance.
13. **Create environment** and wait (several minutes). AWS will provision load balancer, EC2, etc.

---

## Part 4 — Set environment variables (secrets + config)

When the environment shows **Healthy** (or at least running):

1. Open your **environment** (click its name).
2. Left sidebar → **Configuration**.
3. Find **Updates, monitoring, and logging** → **Edit** on the **Software** card (wording may vary slightly).
4. Scroll to **Environment properties**.
5. Add each row (Key → Value):

| Key | Value |
|-----|--------|
| `PORT` | `3000` |
| `JWT_SECRET` | (your secret, no quotes) |
| `QR_SECRET` | (your secret, no quotes) |
| `JWT_EXPIRES_IN` | `7d` (optional) |
| `GOOGLE_CLIENT_IDS` | `client1.apps.googleusercontent.com,client2.apps.googleusercontent.com,client3.apps.googleusercontent.com` (comma-separated, no spaces required) |

6. **Apply** and wait for the environment update to finish (app will restart).

Optional (email): add `SMTP_*`, `MAIL_FROM`, `MAIL_FROM_NAME` if you use SMTP — see [GOOGLE_AND_EMAIL.md](GOOGLE_AND_EMAIL.md).

---

## Part 5 — Get your backend URL and wire the mobile app

1. On the environment **Overview** page, copy the **Environment URL** (e.g. `http://class-konnect-api-prod.ap-south-1.elasticbeanstalk.com`).
2. **HTTPS:** Elastic Beanstalk often gives HTTP first. For production you typically add **HTTPS** via ACM certificate + load balancer listener or a custom domain. For initial testing, HTTP may work; mobile apps and stores prefer HTTPS — plan to enable HTTPS before wide release.
3. **Health check:** open in a browser:

   `https://<your-environment-host>/health`  
   or  
   `http://<your-environment-host>/health`

   You should see JSON like `{ "status": "ok" }`.

4. **Mobile `EXPO_PUBLIC_API_URL`:** set to your API base (no trailing slash):

   ```env
   EXPO_PUBLIC_API_URL=https://<your-environment-host>/api/v1
   ```

   Use `https` once TLS is configured; use `http` only for temporary testing if EB is HTTP-only.

5. Restart Expo after changing `mobile/.env`.

---

## Part 6 — Redeploy when you change code

1. `pnpm run build` in `backend/`.
2. Recreate the zip (Part 2).
3. Elastic Beanstalk → your environment → **Upload and deploy** → upload the new zip.

---

## Troubleshooting (short)

| Symptom | What to check |
|--------|----------------|
| **`unzip` failed / backslashes as path separators** | Recreate the zip with **`pnpm run zip:eb`** or `tar.exe -a` / `zip` (see Part 2). Do **not** use `Compress-Archive`. |
| **Failed to build the Docker image** / `npm ci` errors | (1) **`backend/.dockerignore` must not exclude `dist`** — the image copies pre-built `dist/`. (2) Run `npm install --package-lock-only` in `backend/` so `package-lock.json` matches `package.json`, then **`pnpm run zip:eb`** again. (3) On the instance, open **Logs** → request **`/var/log/eb-engine.log`** (or full logs bundle) for the exact `docker build` line that failed. |
| Environment **Degraded** / health red | **Logs** → **Request logs** / **Last 100 lines** on the instance; fix build/start errors. |
| 502 Bad Gateway | App not listening on `PORT` (must match `PORT` env, default 3000); check Dockerfile `EXPOSE` and `CMD`. |
| `/health` does not load | Security group allows **HTTP 80** (and **443** if HTTPS); correct URL and path `/health`. |

---

## Related docs

- [AWS_NAVIGATION.md](AWS_NAVIGATION.md) — where to click for env vars (Elastic Beanstalk section).
- [SETUP_KEYS.md](SETUP_KEYS.md) — full key matrix and publish flow.
- [GOOGLE_AND_EMAIL.md](GOOGLE_AND_EMAIL.md) — Google OAuth and SMTP.
