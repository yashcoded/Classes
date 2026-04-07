# Contributing

Thank you for considering contributing to **Class Konnect**. This doc is part of the project’s [docs](README.md) and outlines how to get set up, follow conventions, and submit changes.

## Before you start

1. Read the main [README](../README.md) and [SETUP.md](SETUP.md) so you can run backend and mobile locally.
2. Ensure you have the required [setup keys and environment variables](SETUP.md) (at least for the parts you’re changing).

## Development workflow

1. **Open or pick an issue**  
   Comment on an existing issue or open a new one so we can align on the change.

2. **Create a branch**  
   Branch from the default branch (e.g. `main`) with a descriptive name (e.g. `fix/attendance-qr`, `feat/parent-reports`).

3. **Make your changes**  
   - Backend: keep logic in services, use controllers for HTTP, validators for input.  
   - Mobile: follow existing patterns under `app/` and `src/features/`.  
   - Add or update tests in `backend/src/__tests__/` for backend logic.

4. **Run checks**  
   - In repo root or `backend/`: run `pnpm test`.  
   - Manually test the flows you changed (backend and/or mobile).

5. **Commit and push**  
   Use clear commit messages. Push your branch and open a pull request.

6. **Pull request**  
   In the PR description, briefly explain what changed and why. Link any related issues.

## Documentation

- **Setup and keys:** [docs/SETUP.md](SETUP.md) — summary. [docs/SETUP_KEYS.md](SETUP_KEYS.md) — full instructions and links.  
- **Future updates / roadmap:** [docs/FUTURE.md](FUTURE.md)  
- **This guide:** [docs/CONTRIBUTING.md](CONTRIBUTING.md)

If you add new environment variables or setup steps, update [SETUP.md](SETUP.md) and the main README “Setup keys” section.

## Questions

If something is unclear, open an issue with the “question” or “documentation” label so we can improve the docs.
