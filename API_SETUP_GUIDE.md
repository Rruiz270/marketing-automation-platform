# API Integration Setup Guide

This guide will help you connect real Facebook and Google Ads APIs to get existing campaign data in your marketing automation platform.

## 🚀 Quick Overview

The platform now includes:
- ✅ Complete Google Ads API integration
- ✅ Complete Facebook Marketing API integration  
- ✅ Secure credential management system
- ✅ Automated data synchronization
- ✅ Frontend API connection manager

## 📋 Prerequisites

1. **Google Ads Account** with API access
2. **Facebook Business Manager** account
3. **Developer accounts** for both platforms
4. **Active campaigns** on the platforms you want to connect

## 🔧 Setup Instructions

### 1. Google Ads API Setup

#### Step 1: Get Google Ads API Access
1. Go to [Google Ads API Console](https://developers.google.com/google-ads/api)
2. Create a new project or use existing one
3. Enable the Google Ads API
4. Apply for API access (required for production)

#### Step 2: Create OAuth2 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Click "Create Credentials" > "OAuth 2.0 Client IDs"
4. Set application type to "Web application"
5. Add authorized redirect URI: `https://your-domain.com/api/auth/google/callback`

#### Step 3: Get Developer Token
1. In your Google Ads account, go to "Tools & Settings"
2. Under "Setup", click "API Center"
3. Apply for a developer token
4. Wait for approval (can take several days)

#### Step 4: Environment Variables
Add to your `.env.local`:
```env
GOOGLE_ADS_CLIENT_ID=your_client_id_here
GOOGLE_ADS_CLIENT_SECRET=your_client_secret_here
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token_here
GOOGLE_ADS_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
```

### 2. Facebook Marketing API Setup

#### Step 1: Create Facebook App
1. Go to [Facebook for Developers](https://developers.facebook.com)
2. Click "Create App" > "Business" type
3. Add "Marketing API" product to your app
4. Complete business verification process

#### Step 2: Get App Credentials
1. In your app dashboard, go to "Settings" > "Basic"
2. Copy your App ID and App Secret
3. Add your domain to "App Domains"
4. Set redirect URI: `https://your-domain.com/api/auth/facebook/callback`

#### Step 3: Business Manager Setup
1. Go to [Facebook Business Manager](https://business.facebook.com)
2. Add your Facebook app to your business
3. Grant necessary permissions:
   - `ads_management`
   - `ads_read`
   - `business_management`

#### Step 4: Environment Variables  
Add to your `.env.local`:
```env
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_REDIRECT_URI=https://your-domain.com/api/auth/facebook/callback
```

### 3. Install Dependencies

Run the following to install required packages:
```bash
npm install google-ads-api facebook-nodejs-business-sdk crypto-js
```

### 4. Database Setup

The platform automatically creates the required MongoDB collections:
- `apicredentials` - Stores encrypted API tokens
- `campaigns` - Synced campaign data
- `campaignmetrics` - Daily performance metrics

## 🔗 Connecting Your Accounts

### Using the Dashboard

1. Navigate to the **🔗 API Connections** tab
2. Click "Connect" for your desired platform
3. Complete the OAuth authorization flow
4. Test your connection
5. Sync your campaign data

### Manual API Testing

You can also test the APIs directly:

```javascript
// Test Google Ads connection
const response = await fetch('/api/integrations/connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'test_connection',
    platform: 'google_ads',
    user_id: 'your_user_id'
  })
});

// Sync campaigns
const syncResponse = await fetch('/api/integrations/sync-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'sync_campaigns',
    platform: 'google_ads',
    user_id: 'your_user_id'
  })
});
```

## 📊 Available Data

Once connected, the platform will sync:

### Google Ads Data
- Campaign information (name, status, budget)
- Performance metrics (impressions, clicks, conversions, cost)
- Keywords and their performance
- Ad groups and ads
- Real-time budget updates and campaign control

### Facebook Ads Data  
- Campaign and ad set information
- Detailed performance insights
- Audience targeting data
- Creative performance metrics
- Budget management and optimization

## 🔄 Data Synchronization

### Automatic Sync
- **Frequency**: Daily by default (configurable)
- **Metrics**: Last 30 days of performance data
- **Real-time**: Budget changes and campaign status updates

### Manual Sync Options
- **Sync All Platforms**: Updates all connected accounts
- **Platform-Specific Sync**: Updates single platform
- **Campaign-Specific Sync**: Updates specific campaigns only

## 🛡️ Security & Compliance

### Data Protection
- All API tokens are encrypted before database storage
- Automatic token refresh to prevent expiration
- Secure OAuth2 flow implementation
- No sensitive data in logs or error messages

### API Rate Limits
- Automatic rate limiting and retry logic
- Intelligent batching for large accounts
- Error handling and graceful degradation
- Compliance with platform API policies

## 🚨 Troubleshooting

### Common Issues

**"Unauthorized" Errors**
- Check if your tokens have expired
- Verify OAuth redirect URIs match exactly
- Ensure proper API permissions are granted

**"Developer Token Not Approved"**
- Google Ads requires manual approval for production use
- Use test developer token for development
- Check Google Ads API Center for status

**"Business Verification Required"**
- Facebook requires business verification for Marketing API
- Complete the verification process in Business Manager
- May take several days to approve

**Rate Limit Errors**
- The platform handles rate limits automatically
- Check error logs for specific rate limit messages
- Consider reducing sync frequency for large accounts

### Support Resources
- [Google Ads API Documentation](https://developers.google.com/google-ads/api/docs)
- [Facebook Marketing API Documentation](https://developers.facebook.com/docs/marketing-apis)
- [OAuth2 Flow Documentation](https://oauth.net/2/)

## 🎯 Next Steps

After connecting your APIs:

1. **Review Synced Data**: Check that campaigns and metrics appear correctly
2. **Set Up Automation Rules**: Create AI-powered optimization rules
3. **Configure Alerts**: Set up performance monitoring and alerts
4. **Enable Auto-Sync**: Set up regular data synchronization
5. **Test AI Features**: Use the connected data for predictive analytics

## 🔧 Advanced Configuration

### Custom Sync Schedules
Modify sync frequency in the database:
```javascript
// Update sync frequency for a platform
await ApiCredentials.findOneAndUpdate(
  { user_id: 'your_user_id', platform: 'google_ads' },
  { sync_frequency: 'hourly' } // 'hourly', 'daily', 'weekly'
);
```

### Webhook Integration
Set up webhooks for real-time updates (advanced):
```javascript
// Google Ads webhook endpoint
app.post('/api/webhooks/google-ads', (req, res) => {
  // Handle real-time campaign changes
});
```

## 💡 Tips for Success

1. **Start Small**: Connect one platform first, test thoroughly
2. **Monitor Costs**: API calls may incur costs at scale
3. **Regular Testing**: Test connections weekly to catch issues early
4. **Backup Strategy**: Export important data regularly
5. **Documentation**: Keep track of your API keys and settings

---

## 🚀 Ready to Connect?

1. Set up your environment variables
2. Deploy the updated code
3. Go to the **🔗 API Connections** tab
4. Click "Connect" for your first platform
5. Start automating your marketing campaigns with real data!

For additional support, check the platform's audit logs and error reporting in the **📋 Audit & Compliance** tab.