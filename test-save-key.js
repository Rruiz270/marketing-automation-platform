#!/usr/bin/env node
// Test script to manually save OpenAI API key

const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.join(process.cwd(), 'data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'ai-keys-storage.json');

console.log('🔧 Testing API key save...');

// Ensure directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
  console.log('✅ Created storage directory');
}

// Create test data
const testData = {
  'default_user': [
    {
      id: 'openai_default_user_1',
      user_id: 'default_user',
      service: 'openai',
      service_name: 'OpenAI GPT-4',
      api_key: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_KEY_HERE',
      status: 'active',
      enabled: true,
      is_default: true,
      created_at: new Date().toISOString(),
      last_tested: new Date().toISOString()
    }
  ]
};

// Save to file
try {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(testData, null, 2));
  console.log('✅ Saved API key to storage');
  
  // Verify
  const saved = fs.readFileSync(STORAGE_FILE, 'utf8');
  const parsed = JSON.parse(saved);
  console.log('✅ Verified - saved data:', parsed);
  
} catch (error) {
  console.error('❌ Error:', error);
}

console.log('🔧 Test complete');