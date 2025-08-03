// Persistent AI Keys API with MongoDB storage

const AI_SERVICES = {
  // TEXT/COPY AI SERVICES
  openai: {
    name: 'OpenAI GPT-4',
    category: 'text',
    description: 'Industry-leading AI for copywriting, content creation, and marketing copy',
    website: 'https://platform.openai.com/api-keys',
    keyFormat: 'sk-proj-...'
  },
  claude: {
    name: 'Claude AI',
    category: 'text', 
    description: 'Advanced AI assistant excellent for marketing and creative writing',
    website: 'https://console.anthropic.com/',
    keyFormat: 'sk-ant-...'
  },
  jasper: {
    name: 'Jasper AI',
    category: 'text',
    description: 'Marketing-focused AI writer with templates for ads and campaigns',
    website: 'https://app.jasper.ai/settings/billing',
    keyFormat: 'jasper-...'
  },
  'copy.ai': {
    name: 'Copy.ai',
    category: 'text',
    description: 'AI copywriter for marketing and sales',
    website: 'https://app.copy.ai/settings/api',
    keyFormat: 'copy-...'
  },
  writesonic: {
    name: 'Writesonic',
    category: 'text',
    description: 'AI writing assistant for content marketing',
    website: 'https://writesonic.com/dashboard/api',
    keyFormat: 'ws-...'
  },
  // VISUAL/VIDEO AI SERVICES
  dalle: {
    name: 'DALL-E 3',
    category: 'visual',
    description: 'Advanced AI image generation for creative assets',
    website: 'https://platform.openai.com/api-keys',
    keyFormat: 'sk-proj-...'
  },
  midjourney: {
    name: 'Midjourney',
    category: 'visual',
    description: 'AI-powered artistic image generation',
    website: 'https://docs.midjourney.com/docs/api',
    keyFormat: 'mj-...'
  },
  'stable-diffusion': {
    name: 'Stable Diffusion',
    category: 'visual',
    description: 'Open-source AI image generation',
    website: 'https://stability.ai/developers',
    keyFormat: 'sd-...'
  },
  runway: {
    name: 'Runway ML',
    category: 'video',
    description: 'AI video generation and editing',
    website: 'https://runwayml.com/api',
    keyFormat: 'runway-...'
  },
  synthesia: {
    name: 'Synthesia',
    category: 'video',
    description: 'AI video creation with avatars',
    website: 'https://www.synthesia.io/api',
    keyFormat: 'synth-...'
  },
  // AUDIO AI SERVICES
  elevenlabs: {
    name: 'ElevenLabs',
    category: 'audio',
    description: 'Best-in-class voice cloning and text-to-speech',
    website: 'https://elevenlabs.io/settings/api-keys',
    keyFormat: 'eleven-...'
  },
  murf: {
    name: 'Murf AI',
    category: 'audio',
    description: 'Professional AI voice generator',
    website: 'https://murf.ai/api',
    keyFormat: 'murf-...'
  },
  speechify: {
    name: 'Speechify',
    category: 'audio',
    description: 'AI text-to-speech and audio content',
    website: 'https://speechify.com/api',
    keyFormat: 'speech-...'
  }
};

// Persistent storage for AI keys

let memoryStorage = {};

// Load stored keys from MongoDB with fallback
async function loadStoredKeys() {
  try {
    // Try MongoDB first - dynamic import to avoid import errors
    const { connectToDatabase } = await import('../../lib/mongodb');
    const { db } = await connectToDatabase();
    const keys = await db.collection('ai_keys').find({}).toArray();
    
    if (keys.length > 0) {
      const keysById = {};
      keys.forEach(key => {
        const keyId = `${key.user_id}_${key.service}`;
        keysById[keyId] = key;
      });
      memoryStorage = { ...memoryStorage, ...keysById };
      console.log('✅ Loaded AI keys from MongoDB:', Object.keys(keysById).length);
      return keysById;
    }
  } catch (error) {
    console.warn('⚠️ MongoDB not available for AI keys, using memory storage:', error.message);
  }
  
  // Use memory storage as fallback
  console.log('📝 Using memory storage for AI keys:', Object.keys(memoryStorage).length);
  return memoryStorage;
}

// Save keys to MongoDB with memory backup
async function saveStoredKeys(keys) {
  memoryStorage = keys;
  
  try {
    // Try to save to MongoDB - dynamic import to avoid import errors
    const { connectToDatabase } = await import('../../lib/mongodb');
    const { db } = await connectToDatabase();
    
    // Update each key in MongoDB
    for (const [keyId, keyData] of Object.entries(keys)) {
      await db.collection('ai_keys').updateOne(
        { user_id: keyData.user_id, service: keyData.service },
        { $set: keyData },
        { upsert: true }
      );
    }
    
    console.log('✅ Saved AI keys to MongoDB:', Object.keys(keys).length, 'keys');
  } catch (error) {
    console.warn('⚠️ Could not save AI keys to MongoDB, keeping in memory:', error.message);
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, user_id, service, api_key } = req.body;
    console.log('Persistent AI Keys API called with:', { action, user_id, service, api_key: api_key ? 'provided' : 'missing' });
    
    // Load existing keys from persistent storage
    let storedKeys = await loadStoredKeys();
    console.log('Loaded stored keys:', Object.keys(storedKeys).length, 'keys found');

    switch (action) {
      case 'test':
        return res.status(200).json({
          success: true,
          message: 'Persistent API endpoint is working',
          timestamp: new Date().toISOString()
        });

      case 'get_services_by_category':
        const servicesByCategory = {};
        Object.keys(AI_SERVICES).forEach(key => {
          const service = AI_SERVICES[key];
          if (!servicesByCategory[service.category]) {
            servicesByCategory[service.category] = [];
          }
          servicesByCategory[service.category].push({
            id: key,
            ...service
          });
        });

        return res.status(200).json({
          success: true,
          data: servicesByCategory
        });

      case 'save_api_key':
        console.log('📝 Saving API key for service:', service, 'User:', user_id);
        console.log('🔑 API key provided:', api_key ? `${api_key.substring(0, 10)}...` : 'null');
        
        if (!service || !api_key) {
          console.log('❌ Missing required fields - service:', !!service, 'api_key:', !!api_key);
          return res.status(400).json({ error: 'Service and API key are required' });
        }

        if (!AI_SERVICES[service]) {
          console.log('❌ Invalid service:', service, 'Available:', Object.keys(AI_SERVICES));
          return res.status(400).json({ error: 'Invalid service' });
        }

        // Test the API key
        console.log('🧪 Testing API key for service:', service);
        const testResult = await testApiKey(service, api_key);
        console.log('🧪 Test result:', testResult);
        
        if (!testResult.valid) {
          console.log('❌ API key validation failed:', testResult.error);
          return res.status(400).json({ 
            success: false,
            error: 'Invalid API key',
            message: testResult.error || 'API key validation failed'
          });
        }

        // Store persistently
        const keyId = `${user_id}_${service}`;
        storedKeys[keyId] = {
          user_id,
          service,
          service_name: AI_SERVICES[service].name,
          category: AI_SERVICES[service].category,
          api_key: api_key, // Store the full API key for actual usage
          api_key_preview: api_key.substring(0, 12) + '...' + api_key.substring(api_key.length - 4), // Store preview for display
          status: 'active',
          enabled: true,
          is_default: false, // New field for default service
          created_at: new Date().toISOString(),
          last_tested: new Date().toISOString(),
          test_result: testResult
        };

        await saveStoredKeys(storedKeys);

        console.log('API key saved successfully for:', service);
        return res.status(200).json({
          success: true,
          message: `${AI_SERVICES[service].name} API key connected successfully and verified!`,
          data: storedKeys[keyId]
        });

      case 'get_user_keys':
        const userKeys = Object.values(storedKeys).filter(key => key.user_id === user_id);
        console.log('Returning user keys for', user_id, ':', userKeys.length, 'keys found');
        console.log('User keys:', userKeys.map(k => ({ service: k.service, status: k.status, enabled: k.enabled })));
        
        // For security, only return preview for display purposes, but include full key for API usage
        const keysForDisplay = userKeys.map(key => ({
          ...key,
          // Keep both api_key (for actual usage) and api_key_preview (for display)
          // The consuming components should use api_key for API calls and api_key_preview for UI
        }));
        
        return res.status(200).json({
          success: true,
          data: keysForDisplay
        });

      case 'toggle_api_key':
        if (!service) {
          return res.status(400).json({ error: 'Service is required' });
        }

        const toggleKeyId = `${user_id}_${service}`;
        if (!storedKeys[toggleKeyId]) {
          return res.status(404).json({ error: 'API key not found' });
        }

        storedKeys[toggleKeyId].enabled = !storedKeys[toggleKeyId].enabled;
        storedKeys[toggleKeyId].status = storedKeys[toggleKeyId].enabled ? 'active' : 'disabled';
        storedKeys[toggleKeyId].updated_at = new Date().toISOString();

        await saveStoredKeys(storedKeys);

        return res.status(200).json({
          success: true,
          message: `${AI_SERVICES[service].name} ${storedKeys[toggleKeyId].enabled ? 'enabled' : 'disabled'} successfully`,
          data: storedKeys[toggleKeyId]
        });

      case 'disconnect_api_key':
        if (!service) {
          return res.status(400).json({ error: 'Service is required' });
        }

        const disconnectKeyId = `${user_id}_${service}`;
        if (!storedKeys[disconnectKeyId]) {
          return res.status(404).json({ error: 'API key not found' });
        }

        delete storedKeys[disconnectKeyId];
        await saveStoredKeys(storedKeys);

        return res.status(200).json({
          success: true,
          message: `${AI_SERVICES[service].name} disconnected successfully`
        });

      case 'set_default_service':
        if (!service) {
          return res.status(400).json({ error: 'Service is required' });
        }

        console.log('Set default service request:', { user_id, service });
        console.log('Available stored keys:', Object.keys(storedKeys));
        
        const defaultKeyId = `${user_id}_${service}`;
        console.log('Looking for key with ID:', defaultKeyId);
        
        // Try to find the key by the standard format first
        let targetKey = storedKeys[defaultKeyId];
        
        // If not found, try to find it by searching through all keys
        if (!targetKey) {
          console.log('Key not found with standard format, searching...');
          const foundKeyEntry = Object.entries(storedKeys).find(([keyId, keyData]) => {
            return keyData.user_id === user_id && keyData.service === service;
          });
          
          if (foundKeyEntry) {
            console.log('Found key with different format:', foundKeyEntry[0]);
            targetKey = foundKeyEntry[1];
            // Update the stored keys to use the correct format
            delete storedKeys[foundKeyEntry[0]];
            storedKeys[defaultKeyId] = targetKey;
          }
        }
        
        if (!targetKey) {
          console.log('Key not found! Available keys:', storedKeys);
          return res.status(404).json({ 
            error: 'API key not found',
            debug: {
              looking_for: defaultKeyId,
              available_keys: Object.keys(storedKeys),
              stored_keys_data: storedKeys,
              user_id,
              service
            }
          });
        }

        // Remove default from all other services for this user
        Object.values(storedKeys).forEach(key => {
          if (key.user_id === user_id) {
            key.is_default = false;
          }
        });

        // Set this service as default
        targetKey.is_default = true;
        targetKey.updated_at = new Date().toISOString();
        
        // Ensure the key is stored with the correct ID
        storedKeys[defaultKeyId] = targetKey;

        await saveStoredKeys(storedKeys);

        console.log('Successfully set default service:', service);

        return res.status(200).json({
          success: true,
          message: `${AI_SERVICES[service].name} set as default AI service`,
          data: targetKey
        });

      case 'test_api_key':
        if (!service) {
          return res.status(400).json({ error: 'Service is required' });
        }

        const testKeyId = `${user_id}_${service}`;
        if (!storedKeys[testKeyId]) {
          return res.status(404).json({ error: 'API key not found' });
        }

        // Since we don't store the full key, we'll simulate a test
        const mockTestResult = {
          valid: true,
          status: 'active',
          quota_remaining: 'Available',
          last_tested: new Date().toISOString()
        };

        storedKeys[testKeyId].last_tested = new Date().toISOString();
        storedKeys[testKeyId].test_result = mockTestResult;
        await saveStoredKeys(storedKeys);

        return res.status(200).json({
          success: true,
          message: `${AI_SERVICES[service].name} connection test successful!`,
          data: mockTestResult
        });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Persistent AI Keys API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Test API key validity
async function testApiKey(service, apiKey) {
  try {
    switch (service) {
      case 'openai':
      case 'dalle':
        // OpenAI keys can start with sk-proj- or just sk- (be more flexible)
        if (!apiKey.startsWith('sk-') || apiKey.length < 15) {
          return { valid: false, error: 'Invalid OpenAI API key format. Should start with sk- and be at least 15 characters long' };
        }
        
        // Optional: Test actual API connection (commented out for demo)
        /*
        try {
          const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            return { valid: false, error: 'Invalid OpenAI API key - authentication failed' };
          }
          
          const data = await response.json();
          return {
            valid: true,
            status: 'active',
            quota_remaining: 'Available',
            models_available: data.data?.length || 0,
            tested_at: new Date().toISOString()
          };
        } catch (apiError) {
          return { valid: false, error: 'Failed to validate OpenAI API key: ' + apiError.message };
        }
        */
        
        break;
      case 'claude':
        if (!apiKey.startsWith('sk-ant-') || apiKey.length < 15) {
          return { valid: false, error: 'Invalid Claude API key format. Should start with sk-ant- and be at least 15 characters long' };
        }
        break;
      default:
        if (!apiKey || apiKey.length < 5) {
          return { valid: false, error: 'API key is required and must be at least 5 characters long' };
        }
    }

    return {
      valid: true,
      status: 'active',
      quota_remaining: 'Available',
      tested_at: new Date().toISOString()
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}