// Platform Integration API - Handles OAuth2 connections for advertising platforms
import fs from 'fs';
import path from 'path';

// Storage file for platform connections
const STORAGE_FILE = path.join('/tmp', 'platform-connections.json');

// In-memory storage for serverless persistence
let memoryStorage = {};

// Load stored connections
function loadStoredConnections() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      const fileData = JSON.parse(data);
      memoryStorage = { ...memoryStorage, ...fileData };
    }
  } catch (error) {
    console.error('Error loading platform connections:', error);
  }
  return memoryStorage;
}

// Save connections
function saveStoredConnections(connections) {
  memoryStorage = connections;
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(connections, null, 2));
  } catch (error) {
    console.error('Error saving platform connections:', error);
  }
}

// Platform configurations
const PLATFORM_CONFIGS = {
  'google-ads': {
    name: 'Google Ads',
    requiredFields: ['clientId', 'clientSecret', 'refreshToken', 'developerToken'],
    validateCredentials: (creds) => {
      if (!creds.clientId.includes('.apps.googleusercontent.com')) {
        return { valid: false, error: 'Invalid Client ID format' };
      }
      if (creds.clientSecret.length < 10) {
        return { valid: false, error: 'Invalid Client Secret' };
      }
      if (!creds.refreshToken.startsWith('1//')) {
        return { valid: false, error: 'Invalid Refresh Token format' };
      }
      if (creds.developerToken.length < 10) {
        return { valid: false, error: 'Invalid Developer Token' };
      }
      return { valid: true };
    }
  },
  'facebook-ads': {
    name: 'Facebook Ads',
    requiredFields: ['appId', 'appSecret', 'accessToken', 'accountId'],
    validateCredentials: (creds) => {
      if (!/^\d{15,16}$/.test(creds.appId)) {
        return { valid: false, error: 'Invalid App ID format' };
      }
      if (creds.appSecret.length !== 32) {
        return { valid: false, error: 'Invalid App Secret length' };
      }
      if (!creds.accessToken.startsWith('EAA')) {
        return { valid: false, error: 'Invalid Access Token format' };
      }
      if (!creds.accountId.startsWith('act_')) {
        return { valid: false, error: 'Account ID must start with act_' };
      }
      return { valid: true };
    }
  },
  'linkedin-ads': {
    name: 'LinkedIn Ads',
    requiredFields: ['clientId', 'clientSecret', 'accessToken'],
    validateCredentials: (creds) => {
      if (creds.clientId.length < 10) {
        return { valid: false, error: 'Invalid Client ID' };
      }
      if (creds.clientSecret.length < 10) {
        return { valid: false, error: 'Invalid Client Secret' };
      }
      if (!creds.accessToken || creds.accessToken.length < 20) {
        return { valid: false, error: 'Invalid Access Token' };
      }
      return { valid: true };
    }
  },
  'twitter-ads': {
    name: 'X (Twitter) Ads',
    requiredFields: ['apiKey', 'apiSecret', 'accessToken', 'accessTokenSecret'],
    validateCredentials: (creds) => {
      if (creds.apiKey.length < 20) {
        return { valid: false, error: 'Invalid API Key' };
      }
      if (creds.apiSecret.length < 40) {
        return { valid: false, error: 'Invalid API Secret' };
      }
      if (!creds.accessToken.includes('-')) {
        return { valid: false, error: 'Invalid Access Token format' };
      }
      if (creds.accessTokenSecret.length < 40) {
        return { valid: false, error: 'Invalid Access Token Secret' };
      }
      return { valid: true };
    }
  },
  'tiktok-ads': {
    name: 'TikTok Ads',
    requiredFields: ['appId', 'appSecret', 'accessToken'],
    validateCredentials: (creds) => {
      if (!/^\d{19}$/.test(creds.appId)) {
        return { valid: false, error: 'Invalid App ID format (should be 19 digits)' };
      }
      if (creds.appSecret.length !== 32) {
        return { valid: false, error: 'Invalid App Secret length' };
      }
      if (creds.accessToken.length < 30) {
        return { valid: false, error: 'Invalid Access Token' };
      }
      return { valid: true };
    }
  },
  'snapchat-ads': {
    name: 'Snapchat Ads',
    requiredFields: ['clientId', 'clientSecret', 'refreshToken'],
    validateCredentials: (creds) => {
      return { valid: true }; // Basic validation
    }
  },
  'pinterest-ads': {
    name: 'Pinterest Ads',
    requiredFields: ['appId', 'appSecret', 'accessToken'],
    validateCredentials: (creds) => {
      return { valid: true }; // Basic validation
    }
  },
  'amazon-ads': {
    name: 'Amazon Ads',
    requiredFields: ['clientId', 'clientSecret', 'refreshToken', 'profileId'],
    validateCredentials: (creds) => {
      return { valid: true }; // Basic validation
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, platform, credentials, user_id } = req.body;

    // Load existing connections
    let storedConnections = loadStoredConnections();

    // Handle getting user connections
    if (action === 'get_user_connections') {
      const userConnections = Object.values(storedConnections)
        .filter(conn => conn.user_id === user_id);
      
      return res.status(200).json({
        success: true,
        data: userConnections
      });
    }

    // Handle platform connection
    if (!platform || !credentials) {
      return res.status(400).json({ error: 'Platform and credentials required' });
    }

    const config = PLATFORM_CONFIGS[platform];
    if (!config) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    // Check required fields
    const missingFields = config.requiredFields.filter(field => !credentials[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate credentials format
    const validation = config.validateCredentials(credentials);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Test the connection (in production, make actual API calls)
    const testResult = await testPlatformConnection(platform, credentials);
    if (!testResult.success) {
      return res.status(400).json({ 
        error: 'Connection test failed',
        details: testResult.error
      });
    }

    // Store the connection
    const connectionId = `${user_id}_${platform}`;
    const connectionData = {
      id: connectionId,
      user_id,
      platform,
      platform_name: config.name,
      status: 'connected',
      connected_at: new Date().toISOString(),
      // Store credentials securely (in production, encrypt these)
      credentials_preview: {
        [config.requiredFields[0]]: credentials[config.requiredFields[0]].substring(0, 10) + '...'
      },
      account_info: testResult.accountInfo || {}
    };

    storedConnections[connectionId] = connectionData;
    saveStoredConnections(storedConnections);

    return res.status(200).json({
      success: true,
      message: `${config.name} connected successfully`,
      account_name: testResult.accountInfo?.name || `${config.name} Account`,
      connection_data: connectionData
    });

  } catch (error) {
    console.error('Platform connection error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Test platform connection (simulate for demo)
async function testPlatformConnection(platform, credentials) {
  // In production, make actual API calls to verify credentials
  // For demo, simulate successful connection
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  
  // Return mock account info based on platform
  const mockAccountInfo = {
    'google-ads': {
      name: 'Demo Google Ads Account',
      customerId: '123-456-7890',
      currency: 'USD',
      timeZone: 'America/New_York'
    },
    'facebook-ads': {
      name: 'Demo Facebook Business',
      accountId: credentials.accountId,
      currency: 'USD',
      businessName: 'Alumni English School'
    },
    'linkedin-ads': {
      name: 'Demo LinkedIn Campaign Manager',
      accountId: '12345678',
      currency: 'USD',
      accountType: 'BUSINESS'
    },
    'twitter-ads': {
      name: 'Demo Twitter Ads Account',
      accountId: 'abc123',
      currency: 'USD',
      handle: '@alumni_english'
    },
    'tiktok-ads': {
      name: 'Demo TikTok Business',
      advertiserId: '7890123456789',
      currency: 'USD',
      region: 'US'
    }
  };

  return {
    success: true,
    accountInfo: mockAccountInfo[platform] || {
      name: `Demo ${platform} Account`,
      accountId: 'demo-123',
      currency: 'USD'
    }
  };
}