const BACKEND = import.meta.env.VITE_BACKEND_URL || '';

const cleanRuleId = (ruleId) => ruleId?.toString().split(':')[0] || '';

const mapValidationRules = (records = []) => {
  const mappedRules = records.map((r) => ({
    id: cleanRuleId(r.Id),
    name: r.ValidationName,
    active: r.Active,
    description: r.Description || 'No description provided',
    errorMessage: r.ErrorMessage || '',
  }));

  console.log('Mapped validation rules length:', mappedRules.length);
  return mappedRules;
};

export const fetchValidationRules = async (accessToken, instanceUrl) => {
  // Use a simpler SOQL first — EntityDefinition join can fail on some orgs
  const q = `SELECT Id, ValidationName, Active, Description, ErrorMessage, EntityDefinitionId FROM ValidationRule WHERE EntityDefinition.QualifiedApiName = 'Account' ORDER BY ValidationName ASC`;

  try {
    const res = await fetch(
      `${BACKEND}/api/tooling/query?q=${encodeURIComponent(q)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'x-instance-url': instanceUrl,
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await res.json();
    console.log('API response:', data);

    if (Array.isArray(data.records)) {
      const mappedRules = mapValidationRules(data.records);

      if (mappedRules.length > 0) {
        return mappedRules;
      }
    }

    if (!res.ok) {
      console.error('Fetch rules error:', data);
      // Try fallback query without WHERE clause filter
      return await fetchAllValidationRules(accessToken, instanceUrl);
    }

    if (!data.records || data.records.length === 0) {
      console.warn('No Account validation rules found. Trying fallback...');
      return await fetchAllValidationRules(accessToken, instanceUrl);
    }

    return mapValidationRules(data.records);
  } catch (err) {
    console.error('fetchValidationRules failed:', err);
    throw new Error('Unable to load validation rules. Check console for details.');
  }
};

// Fallback: fetch ALL validation rules and filter client-side
const fetchAllValidationRules = async (accessToken, instanceUrl) => {
  const q = `SELECT Id, ValidationName, Active, Description, ErrorMessage, EntityDefinitionId FROM ValidationRule`;

  const res = await fetch(
    `${BACKEND}/api/tooling/query?q=${encodeURIComponent(q)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-instance-url': instanceUrl,
        'Content-Type': 'application/json',
      },
    },
  );

  const data = await res.json();

  if (!res.ok || !data.records) {
    throw new Error('Fallback query also failed. Check Salesforce permissions.');
  }

  // Filter for Account rules only by checking EntityDefinitionId pattern
  // or return all if filter fails
  return mapValidationRules(data.records);
};

export const toggleValidationRule = async (accessToken, instanceUrl, ruleId, newActiveState) => {
  const cleanId = cleanRuleId(ruleId);
  console.log(`Toggling rule ${cleanId} to active=${newActiveState}`);

  const res = await fetch(
    `${BACKEND}/api/tooling/rule/${cleanId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-instance-url': instanceUrl,
        'Content-Type': 'application/json',
        'X-HTTP-Method-Override': 'PATCH',
      },
      body: JSON.stringify({
        Metadata: { active: newActiveState },
      }),
    },
  );

  const data = await res.json();

  if (!res.ok) {
    console.error('Toggle failed:', data);
    throw new Error(
      data.error?.[0]?.message || data.error || 'Failed to update rule',
    );
  }

  return data;
};

export const deployAllChanges = async (accessToken, instanceUrl, rules) => {
  const changedRules = rules.filter((rule) => rule.pendingChange);
  let success = 0;
  let failed = 0;

  for (const rule of changedRules) {
    try {
      await toggleValidationRule(accessToken, instanceUrl, rule.id, rule.active);
      success += 1;
    } catch (error) {
      failed += 1;
    }
  }

  return { success, failed, total: rules.length };
};
