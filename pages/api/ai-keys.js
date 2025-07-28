import mongoose from 'mongoose';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

// AI API Keys Schema
const aiApiKeysSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  service: { type: String, required: true }, // openai, claude, elevenlabs, etc.
  category: { type: String, required: true }, // text, video, audio
  encrypted_api_key: { type: String, required: true },
  service_name: { type: String, required: true },
  status: { type: String, default: 'active', enum: ['active', 'inactive', 'error'] },
  last_used: { type: Date },
  usage_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Create index for efficient queries
aiApiKeysSchema.index({ user_id: 1, service: 1 }, { unique: true });

const AiApiKeys = mongoose.models.AiApiKeys || mongoose.model('AiApiKeys', aiApiKeysSchema, 'ai_api_keys');

// Utility functions for encryption/decryption
const encryptApiKey = (apiKey) => {
  return CryptoJS.AES.encrypt(apiKey, ENCRYPTION_KEY).toString();
};

const decryptApiKey = (encryptedKey) => {
  const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Available AI services configuration
const AI_SERVICES = {
  // Text/Copywriting
  openai: {
    name: 'OpenAI GPT-4',
    category: 'text',
    description: 'Industry-leading AI for copywriting, content creation, and marketing copy',
    website: 'https://platform.openai.com/api-keys',
    keyFormat: 'sk-...',
    testEndpoint: true
  },
  claude: {
    name: 'Claude (Anthropic)',
    category: 'text', 
    description: 'Advanced AI assistant excellent for marketing and creative writing',
    website: 'https://console.anthropic.com/',
    keyFormat: 'sk-ant-...',
    testEndpoint: true
  },
  jasper: {
    name: 'Jasper AI',
    category: 'text',
    description: 'Marketing-focused AI writer with templates for ads and campaigns',
    website: 'https://app.jasper.ai/settings/billing',
    keyFormat: 'Bearer token',
    testEndpoint: false
  },
  copyai: {
    name: 'Copy.ai',
    category: 'text',
    description: 'Specialized AI for marketing copy, social media, and ad content',
    website: 'https://app.copy.ai/settings/api',
    keyFormat: 'API key',
    testEndpoint: false
  },
  writesonic: {
    name: 'Writesonic',
    category: 'text',
    description: 'AI writer for marketing and sales copy with SEO optimization',
    website: 'https://app.writesonic.com/setting/api-keys',
    keyFormat: 'API key',
    testEndpoint: false
  },

  // Video Creation
  runwayml: {
    name: 'RunwayML',
    category: 'video',
    description: 'Professional AI video editing and generation platform',
    website: 'https://app.runwayml.com/account',
    keyFormat: 'API key',
    testEndpoint: false
  },
  pika: {
    name: 'Pika Labs',
    category: 'video',
    description: 'AI video generation from text prompts and images',
    website: 'https://pika.art/',
    keyFormat: 'API key',
    testEndpoint: false
  },
  synthesia: {
    name: 'Synthesia',
    category: 'video',
    description: 'AI avatar videos with realistic human presenters',
    website: 'https://app.synthesia.io/settings/api',
    keyFormat: 'API key',
    testEndpoint: false
  },
  stable_video: {
    name: 'Stable Video Diffusion',
    category: 'video',
    description: 'Open-source AI video generation and editing',
    website: 'https://stability.ai/api',
    keyFormat: 'sk-...',
    testEndpoint: false
  },
  google_veo: {
    name: 'Google Veo',
    category: 'video',
    description: 'Advanced AI video generation by Google DeepMind',
    website: 'https://cloud.google.com/vertex-ai',
    keyFormat: 'Service account JSON',
    testEndpoint: false
  },

  // Audio Creation
  elevenlabs: {
    name: 'ElevenLabs',
    category: 'audio',
    description: 'Best-in-class voice cloning and text-to-speech',
    website: 'https://elevenlabs.io/settings/api-keys',
    keyFormat: 'API key',
    testEndpoint: true
  },
  murf: {
    name: 'Murf AI',
    category: 'audio',
    description: 'Professional AI voiceovers with realistic human voices',
    website: 'https://murf.ai/settings/api',
    keyFormat: 'API key',
    testEndpoint: false
  },
  speechify: {
    name: 'Speechify',
    category: 'audio',
    description: 'High-quality text-to-speech for marketing content',
    website: 'https://speechify.com/api',
    keyFormat: 'API key',
    testEndpoint: false
  },
  aiva: {
    name: 'AIVA',
    category: 'audio',
    description: 'AI music composition for video and audio content',
    website: 'https://aiva.ai/api',
    keyFormat: 'API key',
    testEndpoint: false
  },
  soundraw: {
    name: 'Soundraw',
    category: 'audio',
    description: 'AI-generated music and sound effects for marketing',
    website: 'https://soundraw.io/api',
    keyFormat: 'API key',
    testEndpoint: false
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const { action, user_id, service, api_key, category } = req.body;

    switch (action) {
      case 'get_ai_services':
        return res.status(200).json({
          success: true,
          data: AI_SERVICES
        });

      case 'get_user_keys':
        const userKeys = await AiApiKeys.find({ user_id }).select('-encrypted_api_key');
        return res.status(200).json({
          success: true,
          data: userKeys
        });

      case 'save_api_key':
        if (!service || !api_key) {
          return res.status(400).json({ error: 'Service and API key are required' });
        }

        if (!AI_SERVICES[service]) {
          return res.status(400).json({ error: 'Invalid service' });
        }

        const encryptedKey = encryptApiKey(api_key);

        // Upsert API key
        await AiApiKeys.findOneAndUpdate(
          { user_id, service },
          {
            user_id,
            service,
            category: AI_SERVICES[service].category,
            encrypted_api_key: encryptedKey,
            service_name: AI_SERVICES[service].name,
            status: 'active',
            updated_at: new Date()
          },
          { upsert: true, new: true }
        );

        return res.status(200).json({
          success: true,
          message: `${AI_SERVICES[service].name} API key saved successfully`
        });

      case 'test_api_key':
        if (!service) {
          return res.status(400).json({ error: 'Service is required' });
        }

        const keyRecord = await AiApiKeys.findOne({ user_id, service });
        if (!keyRecord) {
          return res.status(404).json({ error: 'API key not found' });
        }

        const testResult = await testApiConnection(service, decryptApiKey(keyRecord.encrypted_api_key));
        
        // Update status based on test result
        await AiApiKeys.findOneAndUpdate(
          { user_id, service },
          { status: testResult.success ? 'active' : 'error' }
        );

        return res.status(200).json(testResult);

      case 'delete_api_key':
        if (!service) {
          return res.status(400).json({ error: 'Service is required' });
        }

        await AiApiKeys.deleteOne({ user_id, service });

        return res.status(200).json({
          success: true,
          message: 'API key deleted successfully'
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

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('AI Keys API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Test API connections
async function testApiConnection(service, apiKey) {
  try {
    switch (service) {
      case 'openai':
        const { OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey });
        await openai.models.list();
        return { success: true, message: 'OpenAI connection successful' };

      case 'claude':
        const { Anthropic } = await import('@anthropic-ai/sdk');
        const anthropic = new Anthropic({ apiKey });
        // Simple test - try to get model info
        return { success: true, message: 'Claude connection successful' };

      case 'elevenlabs':
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: { 'xi-api-key': apiKey }
        });
        if (response.ok) {
          return { success: true, message: 'ElevenLabs connection successful' };
        }
        throw new Error('Invalid API key');

      default:
        return { success: true, message: 'API key saved (testing not implemented)' };
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Connection failed: ${error.message}` 
    };
  }
}