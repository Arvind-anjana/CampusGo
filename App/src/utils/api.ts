// ─────────────────────────────────────────────────────────────────────────────
// API Client Utility
//
// Central place to configure backend URL.
// Change BASE_URL here when switching between environments:
//   • Web / desktop browser:     http://localhost:5000/api
//   • Android Emulator:          http://10.0.2.2:5000/api
//   • Physical device (Wi-Fi):   http://<YOUR_PC_IP>:5000/api  (e.g. 192.168.1.100)
// ─────────────────────────────────────────────────────────────────────────────

export const BASE_URL = 'http://10.251.158.160:5000/api';
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
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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
