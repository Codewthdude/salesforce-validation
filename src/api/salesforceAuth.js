import axios from 'axios';
import { getAuthBaseUrl, getRedirectUri, requiredEnv } from '../utils/constants';
import { clearAuth, isAuthExpired, loadAuth, saveAuth } from '../utils/storage';

const BACKEND = import.meta.env.VITE_BACKEND_URL || '';

const buildUserInfo = (tokenResponse) => {
  const idPayload = decodeJwtPayload(tokenResponse.id_token);

  return {
    id: tokenResponse.id,
    name:
      tokenResponse.user_info?.name ||
      idPayload?.name ||
      tokenResponse.user_info?.preferred_username ||
      'Salesforce User',
    email:
      tokenResponse.user_info?.email ||
      idPayload?.email ||
      tokenResponse.user_info?.preferred_username ||
      '',
    username:
      tokenResponse.user_info?.preferred_username ||
      idPayload?.preferred_username ||
      '',
    organizationId: idPayload?.organization_id || '',
  };
};

const decodeJwtPayload = (token) => {
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
};

const ensureAuthConfig = () => {
  if (!requiredEnv.clientId) {
    throw new Error(
      'Salesforce OAuth credentials are missing. Add VITE_SF_CLIENT_ID to .env.',
    );
  }
};

export const buildAuthUrl = () => {
  if (!requiredEnv.clientId) {
    throw new Error('VITE_SF_CLIENT_ID is required before starting Salesforce login.');
  }

  const url = new URL(`${getAuthBaseUrl()}/authorize`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', requiredEnv.clientId);
  url.searchParams.set('redirect_uri', getRedirectUri());
  url.searchParams.set('scope', 'api refresh_token');
  url.searchParams.set('prompt', 'login');

  return url.toString();
};

export const exchangeCodeForToken = async (code) => {
  ensureAuthConfig();

  try {
    const response = await fetch(`${BACKEND}/api/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    const auth = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || '',
      instance_url: data.instance_url,
      user_info: buildUserInfo(data),
      issued_at: Number(data.issued_at || Date.now()),
      expires_at: Date.now() + 2 * 60 * 60 * 1000,
    };

    sessionStorage.setItem('sf_access_token', data.access_token);
    sessionStorage.setItem('sf_instance_url', data.instance_url);
    sessionStorage.setItem('sf_user_name', data.user_id || 'Salesforce User');
    saveAuth(auth);
    return data;
  } catch (error) {
    const message =
      error.error?.error_description ||
      error.error?.error ||
      error.error ||
      error.message ||
      'The Salesforce authorization code could not be exchanged. It may have expired.';
    throw new Error(message);
  }
};

export const logout = () => {
  clearAuth();
};

export const getStoredAuth = () => {
  const auth = loadAuth();

  if (!auth || !auth.access_token || !auth.instance_url) {
    return null;
  }

  if (isAuthExpired(auth)) {
    clearAuth();
    return null;
  }

  return auth;
};
