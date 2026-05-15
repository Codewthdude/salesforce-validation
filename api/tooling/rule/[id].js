module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-instance-url');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query || {};
  const token = req.headers.authorization;
  const instanceUrl = req.headers['x-instance-url'];

  if (!token || !instanceUrl) {
    return res.status(400).json({ error: 'Missing authorization or instance URL' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Missing validation rule id' });
  }

  try {
    const baseUrl = `${instanceUrl}/services/data/v59.0/tooling/sobjects/ValidationRule/${id}`;

    const getResponse = await fetch(baseUrl, {
      headers: { Authorization: token },
    });
    const current = await getResponse.json();

    if (!getResponse.ok) {
      return res.status(getResponse.status).json(current);
    }

    const currentMetadata = current.Metadata;
    const updatedMetadata = {
      ...currentMetadata,
      active: req.body.Metadata.active,
    };

    const patchResponse = await fetch(baseUrl, {
      method: 'PATCH',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Metadata: updatedMetadata }),
    });

    if (!patchResponse.ok) {
      const errorData = await patchResponse.json();
      return res.status(patchResponse.status).json(errorData);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
