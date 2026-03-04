import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL =
  (process.env['EXPO_PUBLIC_API_URL'] as string | undefined) ??
  'http://localhost:3000/api/v1';

async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const authHeader = await getAuthHeader();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeader,
  };
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Network error' })) as { message?: string };
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const apiGet = <T>(path: string): Promise<T> =>
  request<T>('GET', path);

export const apiPost = <T>(path: string, body: unknown): Promise<T> =>
  request<T>('POST', path, body);

export const apiPatch = <T>(path: string, body: unknown): Promise<T> =>
  request<T>('PATCH', path, body);

export const apiDelete = <T>(path: string): Promise<T> =>
  request<T>('DELETE', path);
