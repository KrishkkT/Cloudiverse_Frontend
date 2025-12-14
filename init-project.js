#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Initializing Multi-Cloud AI Infrastructure Planner frontend...');

try {
  // Check if node_modules exists
  if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
  } else {
    console.log('Dependencies already installed.');
  }

  console.log('\nFrontend setup complete!');
  console.log('\nTo start the development server, run:');
  console.log('  npm run dev');
  console.log('\nTo build for production, run:');
  console.log('  npm run build');

} catch (error) {
  console.error('Error during initialization:', error.message);
  process.exit(1);
}