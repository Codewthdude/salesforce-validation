import { useCallback, useEffect, useState } from 'react';
import {
  buildAuthUrl,
  getStoredAuth,
  logout as clearSalesforceAuth,
} from '../api/salesforceAuth';

export const useSalesforceAuth = () => {
  const [auth, setAuth] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    setAuth(getStoredAuth());
    setIsCheckingAuth(false);
  }, []);

  const login = useCallback(() => {
    try {
      window.location.assign(buildAuthUrl());
    } catch (error) {
      setAuthError(error.message);
    }
  }, []);

  const logout = useCallback(() => {
    clearSalesforceAuth();
    setAuth(null);
  }, []);

  const refreshAuth = useCallback(() => {
    const storedAuth = getStoredAuth();
    setAuth(storedAuth);
    return storedAuth;
  }, []);

  return {
    auth,
    accessToken: auth?.access_token || '',
    instanceUrl: auth?.instance_url || '',
    isAuthenticated: Boolean(auth?.access_token),
    isCheckingAuth,
    userInfo: auth?.user_info || null,
    authError,
    login,
    logout,
    refreshAuth,
  };
};
