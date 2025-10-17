import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the correct location
// Since copy-frontend.js copies to './frontend/dist', use that path
const frontendPath = path.join(__dirname, 'frontend/dist');

// Check if the directory exists
if (!fs.existsSync(frontendPath)) {
  console.error(`Frontend directory not found at: ${frontendPath}`);
  console.log('Current directory structure:');
  
  // List files for debugging
  try {
    const files = fs.readdirSync(__dirname);
    console.log('Backend directory contents:', files);
    
    if (fs.existsSync(path.join(__dirname, 'frontend'))) {
      const frontendFiles = fs.readdirSync(path.join(__dirname, 'frontend'));
      console.log('Frontend directory contents:', frontendFiles);
    }
  } catch (error) {
    console.error('Error reading directory:', error.message);
  }
} else {
  console.log(`Serving static files from: ${frontendPath}`);
  app.use(express.static(frontendPath));
}

// Handle SPA routing - always return the main index.html
app.get('*', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`index.html not found at: ${indexPath}`);
    res.status(500).send('Frontend files not built properly');
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Current directory: ${__dirname}`);
});