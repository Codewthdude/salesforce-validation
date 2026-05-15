import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = 3001;
const API_VERSION = 'v59.0';

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
);
app.use(express.json());

const getSalesforceInstanceUrl = () =>
  (process.env.VITE_SF_INSTANCE_URL || 'https://login.salesforce.com').replace(/\/+$/, '');

const getErrorDetails = (error) =>
  error.response?.data || {
    error: error.message || 'Unknown Salesforce proxy error',
  };

app.get('/api/debug/rules', async (req, res) => {
  const token = req.headers.authorization;
  const instanceUrl = req.headers['x-instance-url'];

  try {
    // Test 1: Simple query with no filter
    const r1 = await axios.get(
      `${instanceUrl}/services/data/v59.0/tooling/query/`,
      {
        params: { q: 'SELECT Id, ValidationName, Active FROM ValidationRule LIMIT 5' },
        headers: { Authorization: token },
      },
    );
    res.json({
      status: 'ok',
      totalRules: r1.data.totalSize,
      sample: r1.data.records,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      detail: err.response?.data || err.message,
    });
  }
});

app.post('/api/oauth/token', async (req, res) => {
  const { code } = req.body || {};

  if (!code) {
    return res.status(400).json({
      error: 'missing_code',
      error_description: 'Authorization code is required.',
    });
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: process.env.VITE_SF_CLIENT_ID || '',
    client_secret: process.env.VITE_SF_CLIENT_SECRET || '',
    redirect_uri: process.env.VITE_SF_REDIRECT_URI || '',
  });

  try {
    const { data } = await axios.post(
      `${getSalesforceInstanceUrl()}/services/oauth2/token`,
      body,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return res.json(data);
  } catch (error) {
    const details = getErrorDetails(error);
    console.error('Salesforce token exchange failed:', details);
    return res.status(400).json(details);
  }
});

app.get('/api/tooling/query', async (req, res) => {
  const { q } = req.query;
  const token = req.headers.authorization;
  const instanceUrl = req.headers['x-instance-url'];

  console.log('Tooling query called');
  console.log('Instance URL:', instanceUrl);
  console.log('SOQL:', q);

  if (!token || !instanceUrl) {
    return res.status(400).json({ error: 'Missing authorization or instance URL' });
  }

  try {
    const url = `${instanceUrl}/services/data/v59.0/tooling/query/`;
    const response = await axios.get(url, {
      params: { q },
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });
    console.log('Rules fetched:', response.data.totalSize);
    res.json(response.data);
  } catch (error) {
    console.error('Tooling query error:', JSON.stringify(error.response?.data, null, 2));
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

app.patch('/api/tooling/rule/:id', async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization;
  const instanceUrl = req.headers['x-instance-url'];

  console.log('Toggle rule called, ID:', id);
  console.log('Body received:', JSON.stringify(req.body));

  if (!token || !instanceUrl) {
    return res.status(400).json({ error: 'Missing authorization or instance URL' });
  }

  try {
    const url = `${instanceUrl}/services/data/v59.0/tooling/sobjects/ValidationRule/${id}`;

    // First fetch the full current Metadata of the rule
    const getResponse = await axios.get(url, {
      headers: { Authorization: token },
    });

    const currentMetadata = getResponse.data.Metadata;
    console.log('Current metadata:', JSON.stringify(currentMetadata));

    // Merge the active flag into the full existing Metadata
    const updatedMetadata = {
      ...currentMetadata,
      active: req.body.Metadata.active,
    };

    // PATCH with the full merged Metadata object
    await axios.patch(
      url,
      { Metadata: updatedMetadata },
      {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('Rule updated successfully');
    res.json({ success: true, id, active: req.body.Metadata.active });
  } catch (error) {
    console.error('Rule update error:', JSON.stringify(error.response?.data, null, 2));
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
      id,
    });
  }
});

app.listen(PORT, () => {
  console.log('Backend running on http://localhost:3001');
});
