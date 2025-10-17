#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up CRM Ticketing Backend...\n');

// Check if .env exists, if not copy from example
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from example');
  } else {
    console.log('⚠️  Please create .env file manually');
  }
} else {
  console.log('✅ .env file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  console.log('⚠️  Please make sure your DATABASE_URL is correct in .env file');
}

console.log('\n🎉 Setup completed!');
console.log('\nNext steps:');
console.log('1. Update DATABASE_URL in .env file with your PostgreSQL credentials');
console.log('2. Run: npm run db:push (to create database tables)');
console.log('3. Run: npm run dev (to start development server)');
console.log('\n📚 Check README.md for more details');
