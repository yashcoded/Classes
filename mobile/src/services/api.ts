import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL =
  (process.env['EXPO_PUBLIC_API_URL'] as string | undefined) ??
  'http://localhost:3000/api/v1';
const REQUEST_TIMEOUT_MS = 10000;

async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const authHeader = await getAuthHeader();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeader,
  };
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Network error' })) as { message?: string; error?: string };
      throw new Error(error.message ?? error.error ?? `HTTP ${response.status}`);
    }
    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Check that backend is running and reachable.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export const apiGet = <T>(path: string): Promise<T> =>
  request<T>('GET', path);

export const apiPost = <T>(path: string, body: unknown): Promise<T> =>
  request<T>('POST', path, body);

export const apiPatch = <T>(path: string, body: unknown): Promise<T> =>
  request<T>('PATCH', path, body);

export const apiDelete = <T>(path: string): Promise<T> =>
  request<T>('DELETE', path);
