const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- Pre-build check ---');

// 1. Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
  console.log('Created data directory');
}

// 2. Run generation scripts
try {
  console.log('Generating sitemap...');
  execSync('node scripts/generate-sitemap.js', { stdio: 'inherit' });
  
  console.log('Generating nav data...');
  execSync('node scripts/generate-nav-data.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Generation scripts failed:', error.message);
  process.exit(1);
}

// 3. Cleanup .next/trace if it exists (mitigates EPERM on Windows)
const traceFile = path.join(__dirname, '../.next/trace');
if (fs.existsSync(traceFile)) {
  try {
    fs.unlinkSync(traceFile);
    console.log('Cleaned up .next/trace to avoid lock issues');
  } catch (e) {
    console.warn('Warning: Could not delete .next/trace. If the build fails, try closing other processes or deleting the .next folder manually.');
  }
}

console.log('--- Pre-build check complete ---');
