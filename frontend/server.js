const express = require('express');
const path = require('path');
const compression = require('compression');

// Constants
const DIST_DIR = path.join(__dirname, 'dist');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable gzip compression
app.use(compression());

// Serve static files from the dist directory
// Serve static files
app.use(express.static(DIST_DIR));

// Handle SPA routing - always return index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});