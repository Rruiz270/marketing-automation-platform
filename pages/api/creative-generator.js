import mongoose from 'mongoose';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

// Import AI API Keys model
const aiApiKeysSchema = new mongoose.Schema({
  user_id: String,
  service: String,
  category: String,
  encrypted_api_key: String,
  service_name: String,
  status: String,
  last_used: Date,
  usage_count: Number,
  created_at: Date,
  updated_at: Date
});

const AiApiKeys = mongoose.models.AiApiKeys || mongoose.model('AiApiKeys', aiApiKeysSchema, 'ai_api_keys');

// Creative Generation History Schema
const creativeHistorySchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  service: { type: String, required: true },
  category: { type: String, required: true },
  prompt: { type: String, required: true },
  result: mongoose.Schema.Types.Mixed,
  status: { type: String, enum: ['success', 'error'], required: true },
  error_message: String,
  generation_time: Number, // in milliseconds
  cost_estimate: Number,
  created_at: { type: Date, default: Date.now }
});

const CreativeHistory = mongoose.models.CreativeHistory || mongoose.model('CreativeHistory', creativeHistorySchema, 'creative_history');

// Decrypt API key
const decryptApiKey = (encryptedKey) => {
  const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
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

    const { action, user_id, service, category, prompt, options = {} } = req.body;

    switch (action) {
      case 'generate_content':
        if (!service || !prompt) {
          return res.status(400).json({ error: 'Service and prompt are required' });
        }

        // Get user's API key for the service
        const keyRecord = await AiApiKeys.findOne({ user_id, service });
        if (!keyRecord) {
          return res.status(404).json({ 
            error: `No API key found for ${service}. Please add your API key first.` 
          });
        }

        if (keyRecord.status !== 'active') {
          return res.status(400).json({ 
            error: `API key for ${service} is not active. Please check your configuration.` 
          });
        }

        const apiKey = decryptApiKey(keyRecord.encrypted_api_key);
        const startTime = Date.now();

        try {
          const result = await generateContent(service, apiKey, prompt, options);
          const generationTime = Date.now() - startTime;

          // Save to history
          await new CreativeHistory({
            user_id,
            service,
            category: keyRecord.category,
            prompt,
            result,
            status: 'success',
            generation_time: generationTime,
            cost_estimate: estimateCost(service, prompt, result)
          }).save();

          // Update usage count
          await AiApiKeys.findOneAndUpdate(
            { user_id, service },
            { 
              $inc: { usage_count: 1 },
              last_used: new Date()
            }
          );

          return res.status(200).json({
            success: true,
            data: {
              result,
              service: keyRecord.service_name,
              generation_time: generationTime,
              cost_estimate: estimateCost(service, prompt, result)
            }
          });

        } catch (error) {
          const generationTime = Date.now() - startTime;
          
          // Save error to history
          await new CreativeHistory({
            user_id,
            service,
            category: keyRecord.category,
            prompt,
            status: 'error',
            error_message: error.message,
            generation_time: generationTime
          }).save();

          return res.status(500).json({
            error: 'Generation failed',
            message: error.message,
            service: keyRecord.service_name
          });
        }

      case 'get_generation_history':
        const history = await CreativeHistory.find({ user_id })
          .sort({ created_at: -1 })
          .limit(50);

        return res.status(200).json({
          success: true,
          data: history
        });

      case 'get_usage_stats':
        const stats = await AiApiKeys.aggregate([
          { $match: { user_id } },
          {
            $group: {
              _id: '$category',
              total_services: { $sum: 1 },
              total_usage: { $sum: '$usage_count' },
              active_services: {
                $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
              }
            }
          }
        ]);

        const totalHistory = await CreativeHistory.countDocuments({ user_id });
        const successfulGenerations = await CreativeHistory.countDocuments({ 
          user_id, 
          status: 'success' 
        });

        return res.status(200).json({
          success: true,
          data: {
            categories: stats,
            total_generations: totalHistory,
            successful_generations: successfulGenerations,
            success_rate: totalHistory > 0 ? (successfulGenerations / totalHistory * 100).toFixed(1) : 0
          }
        });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Creative Generator API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Generate content using different AI services
async function generateContent(service, apiKey, prompt, options) {
  switch (service) {
    case 'openai':
      return await generateWithOpenAI(apiKey, prompt, options);
    
    case 'claude':
      return await generateWithClaude(apiKey, prompt, options);
    
    case 'elevenlabs':
      return await generateWithElevenLabs(apiKey, prompt, options);
    
    case 'jasper':
      return await generateWithJasper(apiKey, prompt, options);
    
    case 'copyai':
      return await generateWithCopyAI(apiKey, prompt, options);
    
    case 'writesonic':
      return await generateWithWritesonic(apiKey, prompt, options);
    
    case 'runwayml':
      return await generateWithRunwayML(apiKey, prompt, options);
    
    case 'synthesia':
      return await generateWithSynthesia(apiKey, prompt, options);
    
    case 'murf':
      return await generateWithMurf(apiKey, prompt, options);
    
    default:
      throw new Error(`Service ${service} not implemented yet`);
  }
}

// OpenAI Integration
async function generateWithOpenAI(apiKey, prompt, options) {
  const { OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model: options.model || 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a professional marketing copywriter. Create compelling, conversion-focused content that drives results.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: options.max_tokens || 1000,
    temperature: options.temperature || 0.7
  });

  return {
    type: 'text',
    content: response.choices[0].message.content,
    model: response.model,
    usage: response.usage
  };
}

// Claude Integration
async function generateWithClaude(apiKey, prompt, options) {
  const { Anthropic } = await import('@anthropic-ai/sdk');
  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model: options.model || 'claude-3-sonnet-20240229',
    max_tokens: options.max_tokens || 1000,
    messages: [
      {
        role: 'user',
        content: `As a professional marketing copywriter, ${prompt}`
      }
    ]
  });

  return {
    type: 'text',
    content: response.content[0].text,
    model: response.model,
    usage: response.usage
  };
}

// ElevenLabs Integration
async function generateWithElevenLabs(apiKey, prompt, options) {
  const voiceId = options.voice_id || 'EXAVITQu4vr4xnSDxMaL'; // Default voice
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    body: JSON.stringify({
      text: prompt,
      model_id: options.model_id || 'eleven_monolingual_v1',
      voice_settings: {
        stability: options.stability || 0.5,
        similarity_boost: options.similarity_boost || 0.5
      }
    })
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const base64Audio = Buffer.from(audioBuffer).toString('base64');

  return {
    type: 'audio',
    format: 'mp3',
    data: base64Audio,
    size: audioBuffer.byteLength,
    voice_id: voiceId
  };
}

// Placeholder implementations for other services
async function generateWithJasper(apiKey, prompt, options) {
  // Jasper API implementation would go here
  return {
    type: 'text',
    content: 'Jasper integration coming soon...',
    note: 'This is a placeholder. Real implementation requires Jasper API documentation.'
  };
}

async function generateWithCopyAI(apiKey, prompt, options) {
  return {
    type: 'text',
    content: 'Copy.ai integration coming soon...',
    note: 'This is a placeholder. Real implementation requires Copy.ai API documentation.'
  };
}

async function generateWithWritesonic(apiKey, prompt, options) {
  return {
    type: 'text',
    content: 'Writesonic integration coming soon...',
    note: 'This is a placeholder. Real implementation requires Writesonic API documentation.'
  };
}

async function generateWithRunwayML(apiKey, prompt, options) {
  return {
    type: 'video',
    content: 'RunwayML integration coming soon...',
    note: 'This is a placeholder. Real implementation requires RunwayML API documentation.'
  };
}

async function generateWithSynthesia(apiKey, prompt, options) {
  return {
    type: 'video',
    content: 'Synthesia integration coming soon...',
    note: 'This is a placeholder. Real implementation requires Synthesia API documentation.'
  };
}

async function generateWithMurf(apiKey, prompt, options) {
  return {
    type: 'audio',
    content: 'Murf AI integration coming soon...',
    note: 'This is a placeholder. Real implementation requires Murf API documentation.'
  };
}

// Estimate generation cost
function estimateCost(service, prompt, result) {
  const baseCosts = {
    openai: 0.03, // per 1K tokens
    claude: 0.015,
    elevenlabs: 0.30, // per 1K characters
    jasper: 0.05,
    copyai: 0.04,
    writesonic: 0.025,
    runwayml: 0.50,
    synthesia: 1.00,
    murf: 0.20
  };

  const promptLength = prompt.length;
  const baseCost = baseCosts[service] || 0.05;
  
  return Math.round(baseCost * (promptLength / 1000) * 100) / 100; // Round to 2 decimal places
}