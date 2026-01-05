const TOKEN_KEY = 'auth_token';
const USERNAME_KEY = 'username';

export const authToken = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  set(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  remove(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.get();
  },

  setUsername(username: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERNAME_KEY, username);
  },

  getUsername(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(USERNAME_KEY);
  },
};
