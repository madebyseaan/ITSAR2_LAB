const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 4010;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (_req, res) => {
  res.json({ service: 'dashboard-service', status: 'ok' });
});

app.listen(port, () => {
  console.log(`Dashboard running at http://localhost:${port}`);
});
