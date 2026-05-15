export const API_VERSION = 'v59.0';
export const DEFAULT_SF_INSTANCE = 'https://login.salesforce.com';
export const AUTH_STORAGE_KEY = 'sf_vr_manager_auth';

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

export const getSalesforceLoginHost = () =>
  trimTrailingSlash(import.meta.env.VITE_SF_INSTANCE_URL || DEFAULT_SF_INSTANCE);

export const getAuthBaseUrl = () => `${getSalesforceLoginHost()}/services/oauth2`;

export const getRedirectUri = () =>
  import.meta.env.VITE_SF_REDIRECT_URI || `${window.location.origin}/callback`;

export const TOOLING_QUERY_PATH = `/services/data/${API_VERSION}/tooling/query/`;
export const VALIDATION_RULE_PATH = `/services/data/${API_VERSION}/tooling/sobjects/ValidationRule`;

export const requiredEnv = {
  clientId: import.meta.env.VITE_SF_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_SF_CLIENT_SECRET || '',
};
