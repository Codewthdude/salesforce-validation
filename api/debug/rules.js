module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, x-instance-url');

  const token = req.headers.authorization;
  const instanceUrl = req.headers['x-instance-url'];

  try {
    const url = `${instanceUrl}/services/data/v59.0/tooling/query/?q=${encodeURIComponent('SELECT Id, ValidationName, Active FROM ValidationRule LIMIT 5')}`;
    const response = await fetch(url, { headers: { Authorization: token } });
    const data = await response.json();
    return res.status(200).json({ status: 'ok', total: data.totalSize, sample: data.records });
  } catch (err) {
    return res.status(500).json({ status: 'error', detail: err.message });
  }
};
