import { AUTH_STORAGE_KEY } from './constants';

const parseAuth = (rawValue) => {
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
};

export const saveAuth = (auth) => {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
};

export const loadAuth = () => parseAuth(sessionStorage.getItem(AUTH_STORAGE_KEY));

export const clearAuth = () => {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
};

export const isAuthExpired = (auth) => {
  if (!auth?.expires_at) return false;
  return Date.now() >= auth.expires_at;
};
