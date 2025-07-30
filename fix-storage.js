#!/usr/bin/env node
// Script to fix storage issues and ensure data directory exists

const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.join(process.cwd(), 'data');

console.log('🔧 Fixing storage directory...');
console.log('Storage path:', STORAGE_DIR);

// Create data directory
try {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
    console.log('✅ Created data directory');
  } else {
    console.log('✅ Data directory already exists');
  }
  
  // List contents
  const contents = fs.readdirSync(STORAGE_DIR);
  console.log('Directory contents:', contents);
  
} catch (error) {
  console.error('❌ Error:', error);
}

console.log('🔧 Storage fix complete');