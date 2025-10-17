import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Handle SPA routing - always return the main index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Static server running on port ${PORT}`);
});
