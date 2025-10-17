import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Change destination to match what server expects
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const backendFrontendPath = path.join(__dirname, '../frontend/dist'); // Same location

// Ensure the directory exists
fs.ensureDirSync(path.dirname(backendFrontendPath));

// Copy frontend dist to the expected location
fs.copySync(frontendDistPath, backendFrontendPath, { overwrite: true });

console.log('Frontend dist files copied successfully!');