module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-instance-url');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  const token = req.headers.authorization;
  const instanceUrl = req.headers['x-instance-url'];

  if (!token || !instanceUrl) {
    return res.status(400).json({ error: 'Missing authorization or instance URL' });
  }

  try {
    const baseUrl = `${instanceUrl}/services/data/v59.0/tooling/sobjects/ValidationRule/${id}`;

    // Step 1: GET current full Metadata
    const getRes = await fetch(baseUrl, {
      headers: { Authorization: token },
    });
    const current = await getRes.json();
    const currentMetadata = current.Metadata;

    // Step 2: Merge active flag into full Metadata
    const updatedMetadata = {
      ...currentMetadata,
      active: req.body.Metadata.active,
    };

    // Step 3: PATCH with full merged Metadata
    const patchRes = await fetch(baseUrl, {
      method: 'PATCH',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Metadata: updatedMetadata }),
    });

    if (!patchRes.ok) {
      const errData = await patchRes.json();
      return res.status(patchRes.status).json({ error: errData });
    }

    return res.status(200).json({ success: true, id, active: req.body.Metadata.active });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
