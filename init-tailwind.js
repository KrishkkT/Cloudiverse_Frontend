#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('Initializing Tailwind CSS...');

try {
  // Check if tailwind.config.js exists
  if (!fs.existsSync('tailwind.config.js')) {
    console.log('Creating Tailwind CSS configuration...');
    execSync('npx tailwindcss init', { stdio: 'inherit' });
  } else {
    console.log('Tailwind CSS configuration already exists.');
  }

  console.log('\nTailwind CSS setup complete!');

} catch (error) {
  console.error('Error during Tailwind CSS initialization:', error.message);
  process.exit(1);
}