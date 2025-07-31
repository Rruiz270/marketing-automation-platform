// Direct OpenAI API key check
export default function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  res.status(200).json({
    status: 'Environment Variable Check',
    OPENAI_API_KEY: apiKey ? {
      present: true,
      starts_with: apiKey.substring(0, 7),
      length: apiKey.length,
      looks_valid: apiKey.startsWith('sk-')
    } : {
      present: false,
      message: 'OPENAI_API_KEY not found in environment'
    },
    deployment_info: {
      vercel_env: process.env.VERCEL_ENV,
      node_env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  });
}