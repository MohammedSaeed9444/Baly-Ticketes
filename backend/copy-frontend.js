const fs = require('fs-extra');
const path = require('path');

// Define paths
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const backendFrontendPath = path.join(__dirname, 'frontend/dist');

// Ensure the frontend/dist directory exists in backend
fs.ensureDirSync(path.dirname(backendFrontendPath));

// Copy frontend dist to backend
fs.copySync(frontendDistPath, backendFrontendPath, { overwrite: true });

console.log('Frontend dist files copied successfully!');