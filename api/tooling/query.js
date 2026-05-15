module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-instance-url');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { q } = req.query || {};
  const token = req.headers.authorization;
  const instanceUrl = req.headers['x-instance-url'];

  if (!token || !instanceUrl) {
    return res.status(400).json({ error: 'Missing authorization or instance URL' });
  }

  if (!q) {
    return res.status(400).json({ error: 'Missing SOQL query' });
  }

  try {
    const url = `${instanceUrl}/services/data/v59.0/tooling/query/?q=${encodeURIComponent(q)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
