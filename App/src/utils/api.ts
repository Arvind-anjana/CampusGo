import { getToken } from './authStorage';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiOptions {
  method?: HttpMethod;
  body?: object;
  token?: string | null;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body } = options;

  // Auto-fetch token from authStorage if not explicitly passed
  const token = options.token !== undefined ? options.token : await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not set. Check your .env file.');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    // Throw the server's error message so the caller can show it in an Alert
    throw new Error(data.message || 'Something went wrong');
  }

  return data as T;
}
