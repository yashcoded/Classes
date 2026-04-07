# Google sign-in and real email (Gmail / SMTP)

This project supports:

1. **Sign in with Google** (OAuth) from the mobile app, verified on the backend.
2. **Transactional email** (welcome messages) via **SMTP** — works with **Gmail** using an [App Password](https://support.google.com/accounts/answer/185833), or any SMTP provider (SendGrid, Resend SMTP, AWS SES SMTP, etc.).

---

## Part A — Google Cloud setup (one-time)

If you plan to create **Firebase** for Google login: that works, but this app still uses OAuth tokens and backend verification (`/auth/google`) rather than Firebase client SDK auth flows. Use Firebase as the project shell, then pull OAuth client IDs from Google Cloud credentials linked to that Firebase project.

### 1. Create a Google Cloud project

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (or pick an existing one).
3. (Optional Firebase path) Create a Firebase project first, then open **Project settings -> General** to see linked Google Cloud project. Continue OAuth setup in that same project.

### 2. Enable the Google Identity API

1. **APIs & Services → Library**
2. Search for **Google+ API** or **Google Identity Toolkit** / enable **Google People API** if prompted.
3. For OAuth, enable **Google Identity Services** / OAuth consent screen flow (Console will guide you).

### 3. OAuth consent screen

1. **APIs & Services → OAuth consent screen**
2. Choose **External** (for testing with your own Gmail) unless you have a Google Workspace org.
3. Fill app name, support email, developer contact.
4. **Scopes**: add `email`, `profile`, `openid` (Expo’s Google helper requests these).

### 4. Create OAuth client IDs

You need **three** client IDs for a typical phone app + backend verification:

| Client type | Used for |
|-------------|----------|
| **Web application** | Expo / token exchange; put value in `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` |
| **iOS** | `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` |
| **Android** | `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` |

**Android:** In Google Cloud, create the Android client with your **package name** and **SHA-1** certificate fingerprint.

- **Expo Go (debug):** package is often `host.exp.exponent` — add the **debug SHA-1** from Expo docs / `eas credentials` when you use a dev build.
- **Standalone / EAS build:** use your real `applicationId` from `app.json` / `app.config` and the release/debug SHA-1 you use for that build.

**iOS:** Create an iOS client with your **bundle identifier** (e.g. from EAS / Xcode).

For this repository defaults:

- Android package: `com.classkonnect.app`
- iOS bundle identifier: `com.classkonnect.app`

**Web client:** Create a **Web application** client. For local dev you may add authorized redirect URIs such as:

- `https://auth.expo.io/@YOUR_EXPO_USERNAME/YOUR_SLUG` (if you use Expo’s hosted auth flow)
- Your custom scheme redirect used by Expo, e.g. `classesapp:/oauthredirect` (must match your app `scheme` in `app.json`)

Exact URIs depend on Expo SDK and whether you use a **development build** vs **Expo Go**. If something fails, copy the redirect URL from the Expo error screen and add it in Google Cloud **Credentials → your Web client → Authorized redirect URIs**.

### 5. Backend: `GOOGLE_CLIENT_IDS`

The backend verifies the **ID token** against one or more OAuth **client IDs** (the `aud` claim).

In `backend/.env` set **comma-separated** IDs (no spaces required, but spaces are trimmed):

```env
GOOGLE_CLIENT_IDS=WEB_CLIENT_ID.apps.googleusercontent.com,IOS_CLIENT_ID.apps.googleusercontent.com,ANDROID_CLIENT_ID.apps.googleusercontent.com
```

Use the **numeric-client-id.apps.googleusercontent.com** strings from Google Cloud **Credentials**.

### 6. Mobile: Expo public env

In `mobile/.env`:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=....apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=....apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=....apps.googleusercontent.com
```

Restart Expo after changes (`pnpm --filter classes-mobile start -- --clear`).

### 7. API endpoint

- `POST /api/v1/auth/google`  
  Body (JSON): at least one of `idToken`, `accessToken`; for **new** accounts also send `role` (and `teacherId` for students who need a teacher link).

---

## Part B — Real email (not “spam folder” behavior)

Spam filters look at **reputation**, **authentication** (SPF/DKIM/DMARC), and **content**. A few practical rules:

### 1. Prefer a dedicated sending method

- **Gmail SMTP + App Password** is OK for **low volume** and demos.
- For production, prefer **transactional email** (SendGrid, Resend, Amazon SES, Postmark) with your **own domain** and DNS records (SPF + DKIM).

### 2. Gmail SMTP (demo / small scale)

1. Enable **2-Step Verification** on the Google account.
2. Create an **App Password** (Google Account → Security → App passwords).
3. In `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=youraddress@gmail.com
SMTP_PASS=your-16-char-app-password

# Shown as the visible sender (use the same mailbox or an alias you control)
MAIL_FROM=youraddress@gmail.com
MAIL_FROM_NAME=Class Konnect
```

**Note:** Gmail has **daily sending limits**. Do not use it for bulk mail.

### 3. Make messages look legitimate

The backend sends a simple **HTML + plain text** welcome email with a clear **From name** (`MAIL_FROM_NAME`) and **From address** (`MAIL_FROM`). If `SMTP` is not configured, the server **logs** that it would send mail (no error).

### 4. Deliverability checklist (short)

- [ ] Use a **real** `MAIL_FROM` you control.
- [ ] Set **MAIL_FROM_NAME** to your product name (e.g. `Class Konnect`).
- [ ] For a custom domain, add **SPF** and **DKIM** at your DNS (provider docs).
- [ ] Avoid spammy subject lines and misleading content.

---

## Quick checklist

**Google**

- [ ] OAuth consent screen configured  
- [ ] Web + iOS + Android OAuth clients created  
- [ ] `GOOGLE_CLIENT_IDS` set in `backend/.env`  
- [ ] `EXPO_PUBLIC_GOOGLE_*` set in `mobile/.env`  
- [ ] Redirect URIs / SHA-1 / bundle ID match your build  

**Email**

- [ ] `SMTP_*` and `MAIL_FROM*` set in `backend/.env` (or accept console-only logging in dev)  
- [ ] Restart backend after editing `.env`  

---

## References

- [Expo: Authentication](https://docs.expo.dev/guides/authentication/)
- [Expo: AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Nodemailer](https://nodemailer.com/)
