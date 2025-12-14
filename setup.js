#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Multi-Cloud AI Infrastructure Planner Frontend...\n');

try {
  // Check if we're in the frontend directory
  if (!fs.existsSync(path.join(__dirname, 'package.json'))) {
    console.error('❌ Error: Please run this script from the frontend directory.');
    process.exit(1);
  }

  // Step 1: Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Step 2: Initialize Tailwind CSS if not already done
  if (!fs.existsSync(path.join(__dirname, 'tailwind.config.js'))) {
    console.log('\n🎨 Initializing Tailwind CSS...');
    execSync('npx tailwindcss init', { stdio: 'inherit' });
  } else {
    console.log('\n✅ Tailwind CSS already initialized.');
  }

  console.log('\n🎉 Setup complete!');
  console.log('\n🚀 To start the development server, run:');
  console.log('   npm run dev');
  console.log('\n🏗️  To build for production, run:');
  console.log('   npm run build');
  console.log('\n📖 Check out README.md and GETTING_STARTED.md for more information.');

} catch (error) {
  console.error('❌ Error during setup:', error.message);
  process.exit(1);
}