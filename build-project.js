#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('Building project for production...');

try {
  console.log('Running Vite build...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Build complete! Output files are in the dist/ directory.');
} catch (error) {
  console.error('Error during build:', error.message);
  process.exit(1);
}