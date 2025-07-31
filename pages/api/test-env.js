// Test API to check environment variables
export default function handler(req, res) {
  // Allow all methods and add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const envVars = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Present (starts with: ' + process.env.OPENAI_API_KEY.substring(0, 7) + '...)' : 'Missing',
    OPENAI_KEY: process.env.OPENAI_KEY ? 'Present (starts with: ' + process.env.OPENAI_KEY.substring(0, 7) + '...)' : 'Missing',
    OPENAI_API_KEY_BACKUP: process.env.OPENAI_API_KEY_BACKUP ? 'Present (starts with: ' + process.env.OPENAI_API_KEY_BACKUP.substring(0, 7) + '...)' : 'Missing',
    EMERGENCY_OPENAI_KEY: process.env.EMERGENCY_OPENAI_KEY ? 'Present (starts with: ' + process.env.EMERGENCY_OPENAI_KEY.substring(0, 7) + '...)' : 'Missing',
    NODE_ENV: process.env.NODE_ENV || 'undefined',
    VERCEL: process.env.VERCEL || 'undefined',
    VERCEL_ENV: process.env.VERCEL_ENV || 'undefined',
    totalEnvVars: Object.keys(process.env).length
  };

  console.log('Environment Variables Test:', envVars);

  res.status(200).json({
    success: true,
    message: 'Environment variables test',
    data: envVars,
    timestamp: new Date().toISOString()
  });
}