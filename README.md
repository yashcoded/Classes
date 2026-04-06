# Class Konnect

A **tuition and class management** app for teachers, students, and parents. Teachers manage batches and sessions, track attendance (including QR check-in), class logs, tests, and fees; students view their batch, scan QR for attendance, and see test results; parents see progress, attendance, fees, and notifications for linked students.

## Features

- **Roles**: Teacher, Student, Parent (role-based dashboards and flows)
- **Batches**: Create and manage batches (subject, schedule, max students); student batch transfers
- **Sessions**: Schedule class sessions; QR codes for check-in; session status (scheduled / active / completed / cancelled)
- **Attendance**: QR or manual check-in; present / absent / late; history and reports
- **Class logs**: Topic, subtopic, homework, remarks per session
- **Tests**: Create tests, enter marks, view results (teacher/student/parent)
- **Fees**: Fee records, due dates, status (pending / paid / overdue)
- **Notifications**: Send to students, parents, batches, or teachers; read tracking
- **Reports**: Backend report endpoints for aggregated data

## Tech stack

| Part     | Stack |
|----------|--------|
| Backend  | Node.js, Express, TypeScript. Auth: JWT + bcrypt. In-memory storage (no DB). |
| Mobile   | Expo (React Native), expo-router, TypeScript. AsyncStorage for tokens. |
| Dev/test | Jest (backend), nodemon (dev). |

## Project structure

```
Class Konnect/
├── package.json         # Root scripts (pnpm workspaces)
├── pnpm-workspace.yaml  # Workspace: backend, mobile
├── backend/          # API server
│   └── src/
│       ├── app.ts, server.ts
│       ├── controllers/   # request handlers
│       ├── routes/        # /api/v1/* routes
│       ├── services/      # business logic
│       ├── repositories/  # in-memory data access
│       ├── validators/    # request validation
│       ├── middleware/    # auth, authorize
│       ├── models/        # Map-based stores
│       └── types/         # shared types & errors
├── docs/             # Documentation (see Contributing)
│   ├── README.md     # Docs index
│   ├── SETUP.md      # Setup keys & environment
│   ├── SETUP_KEYS.md # Setup keys: full instructions & links
│   ├── AWS_NAVIGATION.md # How to use AWS (beginner-friendly)
│   ├── ELASTIC_BEANSTALK.md # Create EB + deploy backend (Docker)
│   ├── GENERATE_SECRETS.md # Generate JWT_SECRET & QR_SECRET
│   ├── CONTRIBUTING.md
│   └── FUTURE.md     # Roadmap & future updates
├── mobile/           # Expo app
│   ├── app/          # expo-router screens
│   │   ├── (auth)/   # login, register
│   │   ├── (teacher)/# teacher dashboard, batches, sessions, class-logs, tests, fees, notifications
│   │   ├── (student)/# student dashboard, batch, attendance, qr-scan, class-logs, tests
│   │   └── (parent)/ # parent dashboard, attendance, progress, tests, fees, notifications
│   └── src/
│       ├── context/  # AuthContext
│       ├── features/ # role-specific UI (teacher, student, parent)
│       ├── services/ # API clients
│       └── components/
├── README.md
└── LICENSE
```

## Prerequisites

- Node.js 18+
- **pnpm** ([install](https://pnpm.io/installation))
- For mobile: Expo Go app (or Android/iOS simulator)

## Getting started

From the repo root, install all dependencies once:

```bash
pnpm install
```

If you want the easiest full setup path (including exactly how to fill `.env` values), follow:
- [docs/LOCAL_RUN_GUIDE.md](docs/LOCAL_RUN_GUIDE.md)

### Backend

```bash
pnpm dev:backend
# or from backend/: pnpm dev (default port 3000)
# production: pnpm build:backend && pnpm start:backend
```

- API base: `http://localhost:3000/api/v1`
- Health: `GET http://localhost:3000/health`

### Mobile

```bash
pnpm dev:mobile
# or from mobile/: pnpm start
```

Then open in Expo Go (scan QR) or run `pnpm run android` / `pnpm run ios` from `mobile/`. Point the app at your backend (e.g. set API base URL in your env or config where the app reads it).

### Setup keys and environment variables

These are required (or recommended) to run the application. **Full instructions** (where to find/set each key, links to host and Expo docs, how to generate secrets): [docs/SETUP_KEYS.md](docs/SETUP_KEYS.md). Summary: [docs/SETUP.md](docs/SETUP.md). **Google sign-in + SMTP email:** [docs/GOOGLE_AND_EMAIL.md](docs/GOOGLE_AND_EMAIL.md).

| Variable | Where   | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | Backend | No | Server port (default `3000`) |
| `JWT_SECRET` | Backend | **Yes (production)** | Secret for signing JWT tokens; use a long random string in production. |
| `JWT_EXPIRES_IN` | Backend | No | Token expiry (e.g. `7d`; default `7d`) |
| `QR_SECRET` | Backend | **Yes (production)** | Secret for signing/verifying session QR codes; use a long random string in production. |
| `EXPO_PUBLIC_API_URL` | Mobile | No* | Backend API base URL (e.g. `http://localhost:3000/api/v1`). Defaults to localhost if unset. |

\* Required when the app runs on a device or emulator that cannot reach `localhost`; use your machine’s IP or deployed backend URL.

**Quick local setup:** create a `.env` in `backend/` with at least `JWT_SECRET` and `QR_SECRET` for production-like runs. For mobile, create `.env` in `mobile/` with `EXPO_PUBLIC_API_URL` if needed (Expo only loads env vars that start with `EXPO_PUBLIC_`).

Backend uses in-memory storage only; no database. Data resets on restart.

## API overview

| Prefix              | Purpose                |
|---------------------|------------------------|
| `/api/v1/auth`      | Login, register, Google OAuth (`POST /auth/google`) |
| `/api/v1/users`     | User profile CRUD      |
| `/api/v1/batches`   | Batches, memberships   |
| `/api/v1/sessions`  | Class sessions         |
| `/api/v1/attendance`| Check-in, records      |
| `/api/v1/class-logs`| Class log CRUD         |
| `/api/v1/tests`     | Tests and results      |
| `/api/v1/fees`      | Fee records            |
| `/api/v1/notifications` | Send and list       |
| `/api/v1/reports`   | Reports                |

Auth: use the token from login in the `Authorization: Bearer <token>` header for protected routes.

## Tests

```bash
pnpm test
# or from backend/: pnpm test
```

Runs Jest for `**/__tests__/**/*.test.ts` (e.g. `authService`, `batchService`, `attendanceService`).

## Docker

Backend can run from a built image (expects pre-built `dist/`):

```bash
pnpm build:backend
cd backend && docker build -t classes-backend .
docker run -p 3000:3000 classes-backend
```

## Deployment (AWS)

Deployment is done on **AWS**. Set environment variables (and optionally secrets) in your AWS service — see [docs/SETUP_KEYS.md](docs/SETUP_KEYS.md) for where to set keys per service (Elastic Beanstalk, App Runner, ECS, Lambda, EC2).

- **Backend**: Build with `pnpm build:backend`, then run `node dist/server.js` or use the Dockerfile. Deploy to Elastic Beanstalk, App Runner, ECS, Lambda, or EC2. Set `JWT_SECRET`, `QR_SECRET`, and `PORT` in the service config or via Secrets Manager / Parameter Store. For production, add a real database and replace in-memory stores.
- **Mobile**: Build with EAS Build or `expo build` for standalone apps. Set `EXPO_PUBLIC_API_URL` to your AWS backend URL (e.g. Elastic Beanstalk or API Gateway URL).

## Contributing

Contributing is guided by the **docs** in the [`docs/`](docs/README.md) folder. Please read them before submitting changes:

- **[docs/SETUP.md](docs/SETUP.md)** — Setup keys and environment variables (summary). **[docs/SETUP_KEYS.md](docs/SETUP_KEYS.md)** — Full instructions, where to find/set keys on AWS (Elastic Beanstalk, App Runner, ECS, Lambda, EC2) and Expo.
- **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)** — Full contributing workflow, conventions, and where to document changes.
- **[docs/FUTURE.md](docs/FUTURE.md)** — Planned and possible future updates (roadmap).

Short version: open or pick an issue → create a branch → make changes → run `pnpm test` → open a PR with a short description.

## License

See [LICENSE](LICENSE) in the repo root.
