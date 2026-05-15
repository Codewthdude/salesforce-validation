module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-instance-url');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;
  const token = req.headers['authorization'];
  const instanceUrl = req.headers['x-instance-url'];

  console.log('Query called');
  console.log('Instance URL:', instanceUrl);
  console.log('Token exists:', !!token);
  console.log('Query:', q);

  if (!token) return res.status(401).json({ error: 'Missing authorization header' });
  if (!instanceUrl) return res.status(400).json({ error: 'Missing x-instance-url header' });
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });

  try {
    const url = instanceUrl + '/services/data/v59.0/tooling/query/?q=' + encodeURIComponent(q);
    console.log('Fetching URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    console.log('SF Response status:', response.status);
    console.log('SF Response:', text.substring(0, 500));

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid JSON from Salesforce', raw: text });
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Query error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
