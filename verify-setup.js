#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Multi-Cloud AI Infrastructure Planner Frontend Setup...\n');

const requiredFiles = [
  'package.json',
  'index.html',
  'vite.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  'src/main.jsx',
  'src/App.jsx',
  'src/index.css',
  'src/App.css',
  'src/context/AuthContext.jsx',
  'src/components/Navbar.jsx',
  'src/components/Sidebar.jsx',
  'src/pages/Login.jsx',
  'src/pages/Register.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/ProjectDetail.jsx',
  'src/pages/CloudComparison.jsx',
  'src/pages/TerraformViewer.jsx',
  'src/pages/CostEstimation.jsx',
  'src/pages/Settings.jsx'
];

const missingFiles = [];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length === 0) {
  console.log('✅ All required files are present!');
  console.log('\n📁 Project structure verified successfully.');
  console.log('\n🚀 You can now run the development server with: npm run dev');
} else {
  console.log('❌ Missing files:');
  missingFiles.forEach(file => console.log(`   - ${file}`));
  console.log('\nPlease ensure all files are created before running the application.');
}