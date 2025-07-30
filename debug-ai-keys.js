#!/usr/bin/env node
// Debug script to check AI keys storage

const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.join(process.cwd(), 'data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'ai-keys-storage.json');

console.log('🔍 Debug AI Keys Storage');
console.log('Storage directory:', STORAGE_DIR);
console.log('Storage file:', STORAGE_FILE);

// Check if directory exists
console.log('Directory exists:', fs.existsSync(STORAGE_DIR));

// Check if file exists
console.log('File exists:', fs.existsSync(STORAGE_FILE));

// List directory contents
try {
  const contents = fs.readdirSync(STORAGE_DIR);
  console.log('Directory contents:', contents);
} catch (error) {
  console.log('Error reading directory:', error.message);
}

// Try to read the file
try {
  if (fs.existsSync(STORAGE_FILE)) {
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    console.log('File contents:', data);
    
    const parsed = JSON.parse(data);
    console.log('Parsed data:', parsed);
    
    // Check for default_user
    if (parsed.default_user) {
      console.log('Default user keys:', parsed.default_user);
      console.log('Number of keys:', parsed.default_user.length);
    } else {
      console.log('No default_user found');
    }
  } else {
    console.log('File does not exist');
  }
} catch (error) {
  console.log('Error reading file:', error.message);
}

console.log('✅ Debug complete');