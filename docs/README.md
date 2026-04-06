# Documentation

This folder contains documentation for **Class Konnect**. It is part of the contributing process: contributors should use these docs to set up the app and understand where the project is headed.

## Contents

| Document | Description |
|----------|-------------|
| [LOCAL_RUN_GUIDE.md](LOCAL_RUN_GUIDE.md) | **Complete local run guide (kid friendly)** — Full step-by-step setup, exactly how to fill `.env` values, run commands, and fix common issues. |
| [GOOGLE_AND_EMAIL.md](GOOGLE_AND_EMAIL.md) | **Google sign-in + real email** — Google Cloud OAuth setup, `GOOGLE_CLIENT_IDS`, Expo client IDs, Gmail/SMTP and deliverability tips. |
| [SETUP.md](SETUP.md) | **Setup** — Environment variables and configuration required to run the backend and mobile app. |
| [SETUP_KEYS.md](SETUP_KEYS.md) | **Setup keys (instructions)** — Step-by-step: where each backend/mobile key is used, how to generate secrets, where to get Google OAuth IDs, where to set values on AWS + Expo, and ordered publish flow. |
| [AWS_NAVIGATION.md](AWS_NAVIGATION.md) | **How to use AWS (beginner)** — Sign-in, console, where to click to set env vars and find your backend URL for each AWS service. |
| [ELASTIC_BEANSTALK.md](ELASTIC_BEANSTALK.md) | **Elastic Beanstalk from scratch** — Create an EB environment (e.g. Mumbai), Docker deploy zip, env properties, health check, mobile `EXPO_PUBLIC_API_URL`. |
| [GENERATE_SECRETS.md](GENERATE_SECRETS.md) | **Generate JWT_SECRET & QR_SECRET** — What they are, why they must be random, step-by-step (PowerShell, Node, OpenSSL, online), references (JWT/OWASP). |
| [CONTRIBUTING.md](CONTRIBUTING.md) | **Contributing** — How to contribute: workflow, running tests, and where to document changes. |
| [FUTURE.md](FUTURE.md) | **Future updates** — Roadmap and planned improvements (e.g. database, admin, notifications). |

## Quick links

- Main project [README](../README.md) — Overview, getting started, API summary.  
- [Complete local run guide (kid friendly)](LOCAL_RUN_GUIDE.md) — Easiest full setup path with `.env` examples.  
- [Setup keys and env vars](SETUP.md) — Required to run the application.  
- [Setup keys — full instructions and links](SETUP_KEYS.md) — Backend/mobile key matrix, how to get each key, Google OAuth setup, AWS + Expo config, and release checklist.  
- [How to use AWS (beginner-friendly)](AWS_NAVIGATION.md) — Navigate the AWS console, find where to set keys and your backend URL.  
- [Elastic Beanstalk: create environment + deploy](ELASTIC_BEANSTALK.md) — First-time EB setup (Docker, Mumbai region, env vars, redeploy).  
- [Generate JWT_SECRET & QR_SECRET](GENERATE_SECRETS.md) — How to generate both secrets (PowerShell, Node, OpenSSL, online) and references.  
- [Contributing guide](CONTRIBUTING.md) — For contributors.  
- [Future updates / roadmap](FUTURE.md) — What’s next.
