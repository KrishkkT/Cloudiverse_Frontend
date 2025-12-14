#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('Starting development server...');

try {
  console.log('Running Vite development server on port 3000');
  execSync('npx vite', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting development server:', error.message);
  process.exit(1);
}