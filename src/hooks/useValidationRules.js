import { useCallback, useMemo, useState } from 'react';
import {
  deployAllChanges,
  fetchValidationRules as fetchRulesFromSalesforce,
} from '../api/toolingApi';

const withPendingFlag = (rules, originalsById) =>
  rules.map((rule) => ({
    ...rule,
    pendingChange: originalsById.get(rule.id)?.active !== rule.active,
  }));

export const useValidationRules = (accessToken, instanceUrl) => {
  const [rules, setRules] = useState([]);
  const [localRules, setLocalRules] = useState([]);
  const [pendingChanges, setPendingChanges] = useState(() => new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState('');

  const originalsById = useMemo(() => new Map(rules.map((rule) => [rule.id, rule])), [rules]);

  const rebuildPendingChanges = useCallback(
    (nextRules) => {
      const nextPending = new Set();
      nextRules.forEach((rule) => {
        if (originalsById.get(rule.id)?.active !== rule.active) {
          nextPending.add(rule.id);
        }
      });
      setPendingChanges(nextPending);
      return withPendingFlag(nextRules, originalsById);
    },
    [originalsById],
  );

  const fetchRules = useCallback(async () => {
    if (!accessToken || !instanceUrl) return;

    const firstLoad = localRules.length === 0;
    setIsLoading(firstLoad);
    setIsFetching(true);
    setError('');

    try {
      const fetchedRules = await fetchRulesFromSalesforce(accessToken, instanceUrl);
      console.log('Fetched validation rules length:', fetchedRules.length);
      setRules(fetchedRules);
      setLocalRules(fetchedRules.map((rule) => ({ ...rule, pendingChange: false })));
      setPendingChanges(new Set());
      setError('');
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [accessToken, instanceUrl, localRules.length]);

  const toggleRule = useCallback(
    (ruleId) => {
      setLocalRules((currentRules) => {
        const nextRules = currentRules.map((rule) =>
          rule.id === ruleId ? { ...rule, active: !rule.active } : rule,
        );
        return rebuildPendingChanges(nextRules);
      });
    },
    [rebuildPendingChanges],
  );

  const enableAll = useCallback(() => {
    setLocalRules((currentRules) =>
      rebuildPendingChanges(currentRules.map((rule) => ({ ...rule, active: true }))),
    );
  }, [rebuildPendingChanges]);

  const disableAll = useCallback(() => {
    setLocalRules((currentRules) =>
      rebuildPendingChanges(currentRules.map((rule) => ({ ...rule, active: false }))),
    );
  }, [rebuildPendingChanges]);

  const deployChanges = useCallback(async () => {
    if (!accessToken || !instanceUrl || pendingChanges.size === 0) {
      return { success: 0, failed: 0, errors: [] };
    }

    setIsDeploying(true);
    setError('');

    try {
      const pendingRules = localRules.filter((rule) => pendingChanges.has(rule.id));
      const result = await deployAllChanges(
        accessToken,
        instanceUrl,
        pendingRules.map((rule) => ({ ...rule, pendingChange: true })),
      );

      if (result.failed > 0) {
        setError(`${result.failed} validation rule update failed.`);
      }

      const fetchedRules = await fetchRulesFromSalesforce(accessToken, instanceUrl);
      console.log('Fetched validation rules length after deploy:', fetchedRules.length);
      setRules(fetchedRules);
      setLocalRules(fetchedRules.map((rule) => ({ ...rule, pendingChange: false })));
      setPendingChanges(new Set());
      setError('');

      return result;
    } catch (deployError) {
      setError(deployError.message);
      throw deployError;
    } finally {
      setIsDeploying(false);
    }
  }, [accessToken, instanceUrl, localRules, pendingChanges]);

  const activeCount = localRules.filter((rule) => rule.active).length;
  const inactiveCount = localRules.length - activeCount;

  return {
    rules,
    localRules,
    pendingChanges,
    pendingCount: pendingChanges.size,
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
  };
};
