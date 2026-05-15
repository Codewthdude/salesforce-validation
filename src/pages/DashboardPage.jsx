import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import ActionBar from '../components/ActionBar';
import Header from '../components/Header';
import RulesList from '../components/RulesList';
import Toast from '../components/Toast';
import { useValidationRules } from '../hooks/useValidationRules';

const DashboardPage = ({
  isAuthenticated,
  isCheckingAuth,
  accessToken,
  instanceUrl,
  userInfo,
  logout,
}) => {
  const [toasts, setToasts] = useState([]);
  const {
    localRules,
    pendingCount,
    activeCount,
    inactiveCount,
    isLoading,
    isFetching,
    isDeploying,
    error,
    fetchRules,
    toggleRule,
    enableAll,
    disableAll,
    deployChanges,
  } = useValidationRules(accessToken, instanceUrl);

  const addToast = useCallback((type, message) => {
    setToasts((current) => [
      ...current,
      { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, type, message },
    ]);
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRules();
    }
  }, [fetchRules, isAuthenticated]);

  const handleFetch = async () => {
    await fetchRules();
    addToast('info', 'Validation rules refreshed from Salesforce.');
  };

  const handleDeploy = async () => {
    try {
      const result = await deployChanges();
      if (result.failed > 0) {
        addToast('error', `${result.failed} changes failed and ${result.success} deployed.`);
      } else {
        addToast('success', `${result.success} validation rule changes deployed.`);
      }
    } catch (deployError) {
      addToast('error', deployError.message);
    }
  };

  const handleToggle = (ruleId) => {
    toggleRule(ruleId);
  };

  if (!isCheckingAuth && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-salesforce-gray">
      <Header userInfo={userInfo} instanceUrl={instanceUrl} onLogout={logout} />
      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <ActionBar
          ruleCount={localRules.length}
          activeCount={activeCount}
          inactiveCount={inactiveCount}
          pendingCount={pendingCount}
          isFetching={isFetching}
          isDeploying={isDeploying}
          onFetch={handleFetch}
          onEnableAll={enableAll}
          onDisableAll={disableAll}
          onDeploy={handleDeploy}
        />
        <RulesList
          rules={localRules}
          isLoading={isLoading}
          error={error}
          onRetry={handleFetch}
          onToggle={handleToggle}
        />
      </main>
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default DashboardPage;
