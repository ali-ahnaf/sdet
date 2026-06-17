/**
 * Persists the JWT in localStorage so the session survives reloads, and builds
 * the `Authorization` header attached to authenticated requests.
 */
const TOKEN_KEY = "sdet.auth.token";

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/** `Authorization: Bearer <token>` header, or empty when signed out. */
export function authHeaders(): Record<string, string> {
  const token = tokenStore.get();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
