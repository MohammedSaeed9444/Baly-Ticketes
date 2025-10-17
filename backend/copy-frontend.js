import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

// Define paths
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const backendFrontendPath = path.join(__dirname, 'frontend/dist');

// Ensure the frontend/dist directory exists in backend
fs.ensureDirSync(path.dirname(backendFrontendPath));

// Copy frontend dist to backend
fs.copySync(frontendDistPath, backendFrontendPath, { overwrite: true });

console.log('Frontend dist files copied successfully!');