// Simple AI Keys API without MongoDB for debugging
const AI_SERVICES = {
  openai: {
    name: 'OpenAI GPT-4',
    category: 'text',
    description: 'Industry-leading AI for copywriting, content creation, and marketing copy',
    website: 'https://platform.openai.com/api-keys',
    keyFormat: 'sk-...'
  },
  claude: {
    name: 'Claude (Anthropic)',
    category: 'text', 
    description: 'Advanced AI assistant excellent for marketing and creative writing',
    website: 'https://console.anthropic.com/',
    keyFormat: 'sk-ant-...'
  },
  elevenlabs: {
    name: 'ElevenLabs',
    category: 'audio',
    description: 'Best-in-class voice cloning and text-to-speech',
    website: 'https://elevenlabs.io/settings/api-keys',
    keyFormat: 'API key'
  }
};

// In-memory storage for testing
let storedKeys = {};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, user_id, service, api_key } = req.body;
    console.log('Simple AI Keys API called with:', { action, user_id, service, api_key: api_key ? 'provided' : 'missing' });

    switch (action) {
      case 'test':
        return res.status(200).json({
          success: true,
          message: 'Simple API endpoint is working',
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
        console.log('Saving API key for service:', service);
        if (!service || !api_key) {
          return res.status(400).json({ error: 'Service and API key are required' });
        }

        if (!AI_SERVICES[service]) {
          return res.status(400).json({ error: 'Invalid service' });
        }

        // Store in memory for testing
        const keyId = `${user_id}_${service}`;
        storedKeys[keyId] = {
          user_id,
          service,
          service_name: AI_SERVICES[service].name,
          category: AI_SERVICES[service].category,
          api_key: api_key.substring(0, 10) + '...', // Don't store full key
          status: 'active',
          created_at: new Date()
        };

        console.log('API key saved successfully for:', service);
        return res.status(200).json({
          success: true,
          message: `${AI_SERVICES[service].name} API key saved successfully`
        });

      case 'get_user_keys':
        const userKeys = Object.values(storedKeys).filter(key => key.user_id === user_id);
        return res.status(200).json({
          success: true,
          data: userKeys
        });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Simple AI Keys API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}