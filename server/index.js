const express = require('express');

const app = express();
const PORT = 5000;

// Root route
app.get('/', (req, res) => {
  res.send('ScamShield backend is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
