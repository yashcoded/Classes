# How to generate JWT_SECRET and QR_SECRET

This guide explains what these secrets are, why they must be random and strong, and how to generate them on your machine, in AWS (e.g. CloudShell), or online. Use the same process for both; only the **value** should be different (one for JWT, one for QR).

---

## What are JWT_SECRET and QR_SECRET?

- **JWT_SECRET** — A secret string used by the backend to **sign** and **verify** login tokens (JWTs). If someone guesses it, they could forge tokens and act as any user. So it must be long and random.
- **QR_SECRET** — A secret string used to **sign** and **verify** the QR codes shown in class sessions for attendance check-in. If someone guesses it, they could create fake QR codes. So it must also be long and random.

**Rule:** Never use a simple word or a short phrase. Use a **random** string of at least 32 characters (or 32+ bytes encoded as base64/hex). Generate **two different** values — one for `JWT_SECRET`, one for `QR_SECRET`.

---

## Can I generate from AWS? Why use a local device?

**Yes, you can generate JWT_SECRET and QR_SECRET from AWS.** There is no requirement to use your local machine. You can use **AWS CloudShell** (a browser terminal in the AWS Console) or an **EC2** instance and run the same OpenSSL or Node one-liners there. Then you copy the two values and store them in **Secrets Manager**, **Parameter Store**, or your service’s environment variables. See **Method 5: AWS CloudShell** below.

**Why do we also show local methods?**
- **You might not have AWS open yet** — e.g. you’re setting up `.env` before your first deploy. Generating locally is quick and doesn’t depend on AWS.
- **One less place the secret exists** — if you generate on your laptop and paste only into AWS, the secret was never stored on an AWS shell or instance. For high paranoia, some teams prefer that. For most cases, generating in AWS is fine.
- **Convenience** — many developers already have PowerShell, Node, or OpenSSL on their machine; no need to open the console.

**Bottom line:** Use whichever you prefer — local (Methods 1–4) or AWS (Method 5). What matters is that the values are **random**, **strong**, and then **stored securely** (e.g. in AWS env vars or Secrets Manager, never in code or chat).

---

## References (why and how)

- **JWT best practices:** Use a cryptographically strong random value for the signing key; keep it secret and rotate if compromised.  
  - [RFC 8725 (JWT Best Practices)](https://datatracker.ietf.org/doc/html/rfc8725) — Section on key management.  
  - [Auth0: JWT best practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-best-practices/) — High-level guidance.
- **General secret generation:** Use a cryptographically secure random source (e.g. OS random, or a trusted password generator).  
  - [OWASP: Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html) — Storing secrets safely.

---

## Method 1: PowerShell (Windows)

1. Open **PowerShell** (Windows key, type `PowerShell`, press Enter).
2. Run this command once to get a random string (32 bytes, base64):

   ```powershell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
   ```

3. **Copy the output** — that’s your first secret (e.g. use it as `JWT_SECRET`).
4. **Run the same command again** and copy the new output — that’s your second secret (e.g. use it as `QR_SECRET`).
5. Paste each value into your `backend/.env` or into AWS (see [SETUP_KEYS.md](SETUP_KEYS.md)):

   ```env
   JWT_SECRET=paste-first-output-here
   QR_SECRET=paste-second-output-here
   ```

---

## Method 2: Node.js (any OS)

1. Open a terminal in your project (or any folder).
2. Run this once to print one random secret (32 bytes, hex):

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Copy the output** — use it as `JWT_SECRET`.
4. **Run the same command again** and copy the new output — use it as `QR_SECRET`.
5. Put them in `backend/.env` or in AWS.

**Alternative (base64):**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Method 3: OpenSSL (Linux / macOS / Git Bash on Windows)

1. Open a terminal.
2. Run:

   ```bash
   openssl rand -base64 32
   ```

3. **Copy the output** — first run = e.g. `JWT_SECRET`, second run = e.g. `QR_SECRET`.
4. Run again to get the second value:

   ```bash
   openssl rand -base64 32
   ```

5. Put both in `backend/.env` or in AWS.

**Reference:** [OpenSSL rand](https://www.openssl.org/docs/man3.0/man1/openssl-rand.html) — generates random bytes.

---

## Method 4: Online password generator

Use only a **trusted** site (e.g. your password manager’s generator, or a well-known tool). Prefer methods 1–3 when possible so the secret never leaves your machine.

1. Open a password generator that can create **long random passwords** (e.g. 32–64 characters).
2. Generate one password → use as `JWT_SECRET`.
3. Generate another password → use as `QR_SECRET`.
4. Paste into `backend/.env` or into AWS. Do not reuse these values elsewhere.

**Example (no endorsement):** [1Password generator](https://1password.com/password-generator/), [Bitwarden generator](https://bitwarden.com/password-generator/) — set length to at least 32.

---

## Method 5: AWS CloudShell (generate inside AWS)

You can generate both secrets **inside AWS** so they never touch your laptop. Then you store them in Secrets Manager, Parameter Store, or your service’s environment variables.

1. In the **AWS Console**, open the **CloudShell** icon (terminal icon in the top bar, or search for **CloudShell**). A terminal opens in your browser.
2. CloudShell runs on Linux, so you can use **OpenSSL**. Run:

   ```bash
   openssl rand -base64 32
   ```

3. **Copy the output** — use it as `JWT_SECRET`.
4. Run again and copy the new output — use it as `QR_SECRET`:

   ```bash
   openssl rand -base64 32
   ```

5. **Store them in AWS** (don’t leave them in CloudShell history):
   - **Secrets Manager:** Create a secret (e.g. “classes-backend/env”) and paste the key-value pairs, or create two separate secrets.
   - **Parameter Store (SSM):** Create parameters (e.g. `/classes-backend/JWT_SECRET`, `/classes-backend/QR_SECRET`) with type “SecureString”.
   - **Or** paste them directly into your service’s **Environment variables** (Elastic Beanstalk, App Runner, ECS, Lambda) as described in [AWS_NAVIGATION.md](AWS_NAVIGATION.md).

**Reference:** [AWS CloudShell](https://docs.aws.amazon.com/cloudshell/latest/userguide/welcome.html) — browser-based shell in your AWS account.

---

## Checklist

- [ ] Generated **two different** random values (one for JWT, one for QR).
- [ ] Each value is **at least 32 characters** (or 32 bytes in base64/hex).
- [ ] Put them in `backend/.env` (local) or in your AWS service’s environment variables / secrets (see [SETUP_KEYS.md](SETUP_KEYS.md)).
- [ ] **Never commit** `.env` or paste these secrets in chat, email, or code. Only commit `.env.example` (without real values).

---

## Where to use the generated values

- **Local:** Copy `backend/.env.example` to `backend/.env` and set `JWT_SECRET` and `QR_SECRET` there.
- **AWS:** In the service where your backend runs (Elastic Beanstalk, App Runner, Lambda, ECS, EC2), add environment variables (or use Secrets Manager / Parameter Store). See [SETUP_KEYS.md](SETUP_KEYS.md) and [AWS_NAVIGATION.md](AWS_NAVIGATION.md) for where to click.
