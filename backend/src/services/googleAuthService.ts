import { OAuth2Client } from 'google-auth-library';
import { ValidationError } from '../types';

export interface GoogleProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}

function parseClientIds(): string[] {
  return (process.env.GOOGLE_CLIENT_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Verify Google credentials from the mobile app.
 * Prefer `idToken` (verified against `GOOGLE_CLIENT_IDS` audiences).
 * Fallback: `accessToken` via Google userinfo (useful if id_token is not available).
 */
export async function verifyGoogleCredentials(params: {
  idToken?: string;
  accessToken?: string;
}): Promise<GoogleProfile> {
  const { idToken, accessToken } = params;
  if (!idToken && !accessToken) {
    throw new ValidationError('idToken or accessToken is required');
  }

  if (idToken) {
    const audiences = parseClientIds();
    if (audiences.length === 0) {
      throw new ValidationError(
        'Server is not configured for Google sign-in. Set GOOGLE_CLIENT_IDS in backend/.env',
      );
    }
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: audiences,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new ValidationError('Invalid Google ID token');
    }
    return {
      sub: payload.sub,
      email: payload.email,
      emailVerified: Boolean(payload.email_verified),
      name: (payload.name ?? payload.email.split('@')[0] ?? 'User').trim(),
      picture: payload.picture,
    };
  }

  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new ValidationError('Invalid Google access token');
  }
  const data = (await res.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };
  if (!data.sub || !data.email) {
    throw new ValidationError('Invalid Google profile');
  }
  return {
    sub: data.sub,
    email: data.email,
    emailVerified: Boolean(data.email_verified),
    name: (data.name ?? data.email.split('@')[0] ?? 'User').trim(),
    picture: data.picture,
  };
}
