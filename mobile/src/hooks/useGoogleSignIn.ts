import { useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export function isGoogleOAuthConfigured(): boolean {
  const web = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!web) return false;
  if (Platform.OS === 'web') return true;
  return Boolean(
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID &&
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  );
}

export interface GoogleTokens {
  idToken?: string;
  accessToken?: string;
}

/**
 * Opens the Google OAuth flow and returns ID / access tokens for the backend.
 */
export function useGoogleSignIn(): {
  promptGoogle: () => Promise<GoogleTokens | null>;
  canPrompt: boolean;
} {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';

  const config = useMemo(
    () =>
      Platform.OS === 'web'
        ? { webClientId }
        : { webClientId, iosClientId, androidClientId },
    [webClientId, iosClientId, androidClientId],
  );

  const [request, , promptAsync] = Google.useAuthRequest(config);

  const promptGoogle = useCallback(async (): Promise<GoogleTokens | null> => {
    if (!isGoogleOAuthConfigured()) return null;
    const result = await promptAsync();
    if (result.type !== 'success') return null;

    const params = result.params as {
      id_token?: string;
      access_token?: string;
    };
    const idToken = params.id_token ?? result.authentication?.idToken ?? undefined;
    const accessToken =
      result.authentication?.accessToken ?? params.access_token ?? undefined;

    return {
      idToken: idToken || undefined,
      accessToken: accessToken || undefined,
    };
  }, [promptAsync]);

  return {
    promptGoogle,
    canPrompt: Boolean(request) && isGoogleOAuthConfigured(),
  };
}
