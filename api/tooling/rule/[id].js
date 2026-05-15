module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-instance-url');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const id = req.query.id;
  const token = req.headers['authorization'];
  const instanceUrl = req.headers['x-instance-url'];

  console.log('Toggle rule called');
  console.log('Rule ID:', id);
  console.log('Instance URL:', instanceUrl);
  console.log('Body:', JSON.stringify(req.body));

  if (!token) return res.status(401).json({ error: 'Missing authorization' });
  if (!instanceUrl) return res.status(400).json({ error: 'Missing x-instance-url' });
  if (!id) return res.status(400).json({ error: 'Missing rule id' });

  const baseUrl = instanceUrl + '/services/data/v59.0/tooling/sobjects/ValidationRule/' + id;

  try {
    // Step 1: GET full current metadata of the rule
    console.log('Fetching current rule metadata...');
    const getRes = await fetch(baseUrl, {
      headers: { Authorization: token },
    });

    const getText = await getRes.text();
    console.log('GET status:', getRes.status);
    console.log('GET response:', getText.substring(0, 500));

    if (!getRes.ok) {
      return res.status(getRes.status).json({
        error: 'Failed to fetch rule',
        detail: JSON.parse(getText),
      });
    }

    const currentRule = JSON.parse(getText);
    const currentMetadata = currentRule.Metadata;

    if (!currentMetadata) {
      return res.status(500).json({
        error: 'No Metadata found on rule',
        rule: currentRule,
      });
    }

    // Step 2: Merge active state into full metadata
    const newActive = req.body?.Metadata?.active;
    console.log('Setting active to:', newActive);

    const updatedMetadata = {
      ...currentMetadata,
      active: newActive,
    };

    // Step 3: PATCH with full merged metadata
    console.log('Patching rule...');
    const patchRes = await fetch(baseUrl, {
      method: 'PATCH',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Metadata: updatedMetadata }),
    });

    console.log('PATCH status:', patchRes.status);

    if (patchRes.status === 204 || patchRes.ok) {
      return res.status(200).json({
        success: true,
        id,
        active: newActive,
      });
    }

    const patchText = await patchRes.text();
    console.error('PATCH failed:', patchText);
    return res.status(patchRes.status).json({
      error: 'Failed to update rule',
      detail: patchText,
    });
  } catch (err) {
    console.error('Rule toggle error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
