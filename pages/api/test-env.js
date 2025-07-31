// Test API to check environment variables
export default function handler(req, res) {
  const envVars = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Present (starts with: ' + process.env.OPENAI_API_KEY.substring(0, 7) + '...)' : 'Missing',
    NODE_ENV: process.env.NODE_ENV || 'undefined',
    VERCEL: process.env.VERCEL || 'undefined',
    VERCEL_ENV: process.env.VERCEL_ENV || 'undefined'
  };

  console.log('Environment Variables Test:', envVars);

  res.status(200).json({
    success: true,
    message: 'Environment variables test',
    data: envVars,
    timestamp: new Date().toISOString()
  });
}