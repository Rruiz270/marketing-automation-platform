#!/usr/bin/env node

// Test script to verify API key saving and retrieval works correctly
const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3000';

async function testApiKeyFlow() {
  console.log('🧪 Testing API Key Flow...\n');
  
  const testApiKey = 'sk-proj-test-key-for-validation-only-1234567890abcdef';
  const userId = 'test_user';
  const service = 'openai';
  
  try {
    // Step 1: Test API endpoint
    console.log('1. Testing API endpoint...');
    const testResponse = await fetch(`${baseUrl}/api/ai-keys-simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'test'
      })
    });
    
    const testData = await testResponse.json();
    console.log('✅ API endpoint test:', testData.success ? 'PASSED' : 'FAILED');
    
    // Step 2: Save API key
    console.log('\n2. Saving API key...');
    const saveResponse = await fetch(`${baseUrl}/api/ai-keys-simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_api_key',
        service: service,
        api_key: testApiKey,
        user_id: userId
      })
    });
    
    const saveData = await saveResponse.json();
    console.log('Save response:', {
      success: saveData.success,
      message: saveData.message,
      hasApiKey: !!saveData.data?.api_key,
      hasPreview: !!saveData.data?.api_key_preview
    });
    
    if (!saveData.success) {
      console.log('❌ API key save failed:', saveData.error);
      return;
    }
    
    // Step 3: Retrieve user keys
    console.log('\n3. Retrieving user keys...');
    const getResponse = await fetch(`${baseUrl}/api/ai-keys-simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_user_keys',
        user_id: userId
      })
    });
    
    const getData = await getResponse.json();
    console.log('Get response:', {
      success: getData.success,
      keysCount: getData.data?.length || 0,
      keys: getData.data?.map(k => ({
        service: k.service,
        hasFullKey: !!k.api_key,
        hasPreview: !!k.api_key_preview,
        keyStartsWith: k.api_key?.substring(0, 10) || 'N/A',
        previewValue: k.api_key_preview
      }))
    });
    
    // Step 4: Verify the key can be used
    console.log('\n4. Verifying key usage...');
    const userKeys = getData.data || [];
    const openaiKey = userKeys.find(k => k.service === 'openai');
    
    if (openaiKey && openaiKey.api_key) {
      console.log('✅ Full API key retrieved successfully:', openaiKey.api_key.substring(0, 15) + '...');
      console.log('✅ API key format valid:', openaiKey.api_key.startsWith('sk-'));
      console.log('✅ API key length valid:', openaiKey.api_key.length > 20);
    } else {
      console.log('❌ Full API key not found or missing');
    }
    
    // Step 5: Clean up - disconnect the test key
    console.log('\n5. Cleaning up test key...');
    const disconnectResponse = await fetch(`${baseUrl}/api/ai-keys-simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'disconnect_api_key',
        service: service,
        user_id: userId
      })
    });
    
    const disconnectData = await disconnectResponse.json();
    console.log('Cleanup:', disconnectData.success ? 'COMPLETED' : 'FAILED');
    
    console.log('\n🎉 API Key Flow Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the development server is running: npm run dev');
  }
}

// Run the test if server is available
testApiKeyFlow();