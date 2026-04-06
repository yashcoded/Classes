# Future updates and roadmap

This document describes planned or possible future updates for **Class Konnect**. It is part of the [docs](README.md) and is intended to guide contributors and users.

## Planned / under consideration

- **Persistent database**  
  Replace in-memory storage with a real database (e.g. PostgreSQL or SQLite) so data survives restarts and supports production use.

- **Admin role**  
  Expand the existing `admin` role in the type system into full admin flows: user management, system-wide reports, and configuration.

- **Environment-based config**  
  Use a proper env loader (e.g. `dotenv`) in the backend and document a single place for all [setup keys](SETUP.md).

- **Mobile: deep linking and notifications**  
  Add deep links for key screens and push (or in-app) notifications for attendance, fees, and teacher announcements.

- **Offline support (mobile)**  
  Cache essential data and queue actions when offline, then sync when the app is back online.

- **Audit and logging**  
  Log important actions (e.g. fee updates, batch transfers, role changes) for accountability and debugging.

## Ideas for later

- Bulk import of students and parents (e.g. CSV).
- Export of reports (e.g. PDF/Excel).
- Multi-tenant support (multiple institutes in one deployment).
- Web dashboard for teachers/admins alongside the mobile app.
- Optional two-factor authentication (2FA) for teacher/admin accounts.

## Contributing to the roadmap

If you want to work on one of these items or suggest a new one, open an issue and mention “roadmap” or “future” so we can track it. Updates to this file are welcome via pull requests; keep the list concise and ordered by priority or phase where possible.
