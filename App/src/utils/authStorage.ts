// ─────────────────────────────────────────────────────────────────────────────
// Auth Storage Helper
//
// Wraps AsyncStorage to save/load/clear the JWT token and user info
// that is returned by the backend after a successful login.
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@bmsapp_token';
const USER_KEY = '@bmsapp_user';

export interface StoredUser {
  userId: string;
  name: string;
  role: 'DRIVER' | 'TRANSPORT_MANAGER';
}

/** Save the JWT token to device storage */
export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

/** Retrieve the stored JWT token (or null if not logged in) */
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

/** Save the logged-in user's info to device storage */
export async function saveUser(user: StoredUser): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Retrieve the stored user info (or null if not logged in) */
export async function getUser(): Promise<StoredUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as StoredUser) : null;
}

/** Clear all auth data (call this on Logout) */
export async function clearAuth(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}
