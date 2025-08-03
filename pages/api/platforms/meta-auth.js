// Meta (Facebook/Instagram) OAuth Authentication Handler
import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Initiate OAuth flow
      return initiateOAuth(req, res);
    
    case 'POST':
      // Handle OAuth callback
      return handleCallback(req, res);
    
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function initiateOAuth(req, res) {
  const { userId = 'default_user' } = req.query;
  
  // Meta OAuth configuration
  const clientId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI || 'http://localhost:3000/api/platforms/meta-auth';
  const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');
  
  if (!clientId) {
    return res.status(500).json({ 
      error: 'Meta App ID not configured',
      setup: 'Please add META_APP_ID to your environment variables'
    });
  }
  
  // Meta OAuth URL with required permissions
  const permissions = [
    'ads_management',
    'ads_read',
    'business_management',
    'pages_read_engagement',
    'pages_manage_ads',
    'instagram_basic',
    'instagram_content_publish'
  ].join(',');
  
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `state=${state}&` +
    `scope=${permissions}&` +
    `response_type=code`;
  
  return res.status(200).json({ 
    success: true,
    authUrl,
    message: 'Redirect user to authUrl to begin OAuth flow'
  });
}

async function handleCallback(req, res) {
  const { code, state } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code required' });
  }
  
  try {
    // Decode state to get userId
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const { userId } = stateData;
    
    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(code);
    
    if (!tokenResponse.access_token) {
      throw new Error('Failed to obtain access token');
    }
    
    // Get user's ad accounts
    const adAccounts = await getAdAccounts(tokenResponse.access_token);
    
    // Save connection to database
    const { db } = await connectToDatabase();
    
    await db.collection('platform_connections').updateOne(
      { userId, platform: 'meta' },
      {
        $set: {
          userId,
          platform: 'meta',
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          adAccounts: adAccounts,
          permissions: tokenResponse.scope?.split(',') || [],
          expiresAt: new Date(Date.now() + (tokenResponse.expires_in * 1000)),
          connectedAt: new Date(),
          status: 'active'
        }
      },
      { upsert: true }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Meta account connected successfully',
      adAccounts: adAccounts.length,
      permissions: tokenResponse.scope
    });
    
  } catch (error) {
    console.error('Meta OAuth error:', error);
    return res.status(500).json({ 
      error: 'Failed to connect Meta account',
      details: error.message
    });
  }
}

async function exchangeCodeForToken(code) {
  const clientId = process.env.META_APP_ID;
  const clientSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI || 'http://localhost:3000/api/platforms/meta-auth';
  
  const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code: code
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }
  
  return response.json();
}

async function getAdAccounts(accessToken) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/adaccounts?access_token=${accessToken}&fields=id,name,account_status,currency,timezone_name`
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch ad accounts: ${error}`);
  }
  
  const data = await response.json();
  return data.data || [];
}