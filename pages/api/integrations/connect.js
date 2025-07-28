import dbConnect from '../../../lib/mongodb';
import ApiCredentials from '../../../lib/models/ApiCredentials';
import GoogleAdsIntegration from '../../../lib/integrations/google-ads';
import FacebookAdsIntegration from '../../../lib/integrations/facebook-ads';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { action, platform, user_id } = req.body;

    switch (action) {
      case 'get_auth_url':
        const authUrl = await getAuthUrl(platform);
        res.status(200).json({
          success: true,
          auth_url: authUrl,
          platform: platform
        });
        break;

      case 'exchange_code':
        const result = await exchangeCodeForCredentials(req.body);
        res.status(200).json({
          success: true,
          data: result,
          message: 'Credentials saved successfully'
        });
        break;

      case 'test_connection':
        const testResult = await testConnection(user_id, platform);
        res.status(200).json({
          success: true,
          data: testResult,
          message: 'Connection test completed'
        });
        break;

      case 'disconnect':
        await disconnectPlatform(user_id, platform);
        res.status(200).json({
          success: true,
          message: 'Platform disconnected successfully'
        });
        break;

      case 'get_connected_platforms':
        const platforms = await getConnectedPlatforms(user_id);
        res.status(200).json({
          success: true,
          data: platforms
        });
        break;

      default:
        res.status(400).json({
          success: false,
          message: 'Invalid action specified'
        });
    }
  } catch (error) {
    console.error('Integration API error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in integration API',
      error: error.message
    });
  }
}

async function getAuthUrl(platform) {
  switch (platform) {
    case 'google_ads':
      const googleAds = new GoogleAdsIntegration();
      return googleAds.generateAuthUrl();
      
    case 'facebook_ads':
      const facebookAds = new FacebookAdsIntegration();
      return facebookAds.generateAuthUrl();
      
    default:
      throw new Error(`Platform ${platform} not supported`);
  }
}

async function exchangeCodeForCredentials(data) {
  const { platform, auth_code, user_id, additional_data } = data;
  
  let credentials;
  let accountInfo = {};
  
  switch (platform) {
    case 'google_ads':
      const googleAds = new GoogleAdsIntegration();
      const googleTokens = await googleAds.exchangeCodeForTokens(auth_code);
      
      credentials = {
        refresh_token: googleTokens.refresh_token,
        access_token: googleTokens.access_token,
        customer_id: additional_data.customer_id,
        expires_at: new Date(Date.now() + (googleTokens.expires_in * 1000)),
        token_type: googleTokens.token_type
      };
      
      // Get account info
      const googleResult = await googleAds.initialize({
        refresh_token: googleTokens.refresh_token,
        customer_id: additional_data.customer_id
      });
      
      if (googleResult.success) {
        accountInfo = {
          account_name: additional_data.account_name || 'Google Ads Account',
          account_id: additional_data.customer_id,
          currency: additional_data.currency || 'USD',
          timezone: additional_data.timezone || 'UTC'
        };
      }
      break;
      
    case 'facebook_ads':
      const facebookAds = new FacebookAdsIntegration();
      const facebookTokens = await facebookAds.exchangeCodeForToken(auth_code);
      
      credentials = {
        access_token_fb: facebookTokens.access_token,
        ad_account_id: additional_data.ad_account_id,
        app_id: process.env.FACEBOOK_APP_ID,
        expires_at: facebookTokens.expires_in ? 
          new Date(Date.now() + (facebookTokens.expires_in * 1000)) : null,
        token_type: facebookTokens.token_type
      };
      
      // Get account info
      const facebookResult = await facebookAds.initialize({
        access_token: facebookTokens.access_token,
        ad_account_id: additional_data.ad_account_id
      });
      
      if (facebookResult.success) {
        accountInfo = {
          account_name: additional_data.account_name || 'Facebook Ads Account',
          account_id: additional_data.ad_account_id,
          currency: additional_data.currency || 'USD',
          timezone: additional_data.timezone || 'UTC'
        };
      }
      break;
      
    default:
      throw new Error(`Platform ${platform} not supported`);
  }
  
  // Save or update credentials
  const existingCredentials = await ApiCredentials.findOne({
    user_id: user_id,
    platform: platform
  });
  
  if (existingCredentials) {
    existingCredentials.credentials = credentials;
    existingCredentials.account_info = { ...existingCredentials.account_info, ...accountInfo };
    existingCredentials.status = 'active';
    existingCredentials.error_log = []; // Clear previous errors
    await existingCredentials.save();
    return existingCredentials;
  } else {
    const newCredentials = new ApiCredentials({
      user_id: user_id,
      platform: platform,
      credentials: credentials,
      account_info: accountInfo,
      status: 'active'
    });
    await newCredentials.save();
    return newCredentials;
  }
}

async function testConnection(userId, platform) {
  const credentials = await ApiCredentials.findActiveCredentials(userId, platform);
  
  if (!credentials) {
    throw new Error('No active credentials found for this platform');
  }
  
  const decryptedCreds = credentials.getDecryptedCredentials();
  
  try {
    switch (platform) {
      case 'google_ads':
        const googleAds = new GoogleAdsIntegration();
        const googleResult = await googleAds.initialize({
          refresh_token: decryptedCreds.refresh_token,
          customer_id: decryptedCreds.customer_id
        });
        
        if (googleResult.success) {
          // Try to fetch a small amount of data to test
          const campaigns = await googleAds.getCampaigns();
          await credentials.updateLastSync();
          
          return {
            status: 'connected',
            platform: platform,
            account_name: credentials.account_info.account_name,
            campaigns_found: campaigns.length,
            last_sync: new Date()
          };
        }
        break;
        
      case 'facebook_ads':
        const facebookAds = new FacebookAdsIntegration();
        const facebookResult = await facebookAds.initialize({
          access_token: decryptedCreds.access_token_fb,
          ad_account_id: decryptedCreds.ad_account_id
        });
        
        if (facebookResult.success) {
          const campaigns = await facebookAds.getCampaigns();
          await credentials.updateLastSync();
          
          return {
            status: 'connected',
            platform: platform,
            account_name: credentials.account_info.account_name,
            campaigns_found: campaigns.length,
            last_sync: new Date()
          };
        }
        break;
        
      default:
        throw new Error(`Platform ${platform} not supported`);
    }
  } catch (error) {
    // Log error and update credentials status
    await credentials.logError(error.message, 'CONNECTION_TEST_FAILED');
    
    if (error.message.includes('unauthorized') || error.message.includes('expired')) {
      credentials.status = 'expired';
      await credentials.save();
    }
    
    throw error;
  }
}

async function disconnectPlatform(userId, platform) {
  const credentials = await ApiCredentials.findOne({
    user_id: userId,
    platform: platform
  });
  
  if (credentials) {
    credentials.status = 'revoked';
    credentials.credentials = {}; // Clear sensitive data
    await credentials.save();
  }
}

async function getConnectedPlatforms(userId) {
  const credentials = await ApiCredentials.find({
    user_id: userId,
    status: { $in: ['active', 'expired'] }
  }).select('platform account_info status last_sync error_log');
  
  return credentials.map(cred => ({
    platform: cred.platform,
    account_name: cred.account_info.account_name,
    account_id: cred.account_info.account_id,
    status: cred.status,
    last_sync: cred.last_sync,
    has_errors: cred.error_log.some(error => !error.resolved),
    currency: cred.account_info.currency,
    timezone: cred.account_info.timezone
  }));
}