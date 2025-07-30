import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OAuthPopup = ({ platform, isOpen, onClose, onConnect }) => {
  const [credentials, setCredentials] = useState({
    clientId: '',
    clientSecret: '',
    refreshToken: '',
    developerToken: '',
    accountId: '',
    appId: '',
    appSecret: '',
    accessToken: ''
  });

  const platformConfigs = {
    'google-ads': {
      name: 'Google Ads',
      icon: '🔍',
      color: 'from-blue-500 to-blue-700',
      fields: [
        { key: 'clientId', label: 'Client ID', placeholder: '123456789-abcdef.apps.googleusercontent.com', required: true },
        { key: 'clientSecret', label: 'Client Secret', placeholder: 'GOCSPX-xxxxxxxxxxxxx', required: true },
        { key: 'refreshToken', label: 'Refresh Token', placeholder: '1//0gxxxxxxxxxxxxxx', required: true },
        { key: 'developerToken', label: 'Developer Token', placeholder: 'xxxxxxxxxxxxxxxxxxxx', required: true }
      ],
      instructions: [
        '1. Go to Google Cloud Console (console.cloud.google.com)',
        '2. Create a new project or select existing',
        '3. Enable Google Ads API',
        '4. Create OAuth2 credentials',
        '5. Get your developer token from Google Ads Manager'
      ],
      docsUrl: 'https://developers.google.com/google-ads/api/docs/oauth/overview'
    },
    'facebook-ads': {
      name: 'Facebook Ads',
      icon: '📘',
      color: 'from-blue-600 to-indigo-700',
      fields: [
        { key: 'appId', label: 'App ID', placeholder: '1234567890123456', required: true },
        { key: 'appSecret', label: 'App Secret', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
        { key: 'accessToken', label: 'Access Token', placeholder: 'EAAxxxxxxxxxxxxxxxxxx', required: true },
        { key: 'accountId', label: 'Ad Account ID', placeholder: 'act_123456789012345', required: true }
      ],
      instructions: [
        '1. Go to Facebook Developers (developers.facebook.com)',
        '2. Create a new app or use existing',
        '3. Add Marketing API product',
        '4. Generate access token with ads_management permission',
        '5. Get your Ad Account ID from Business Manager'
      ],
      docsUrl: 'https://developers.facebook.com/docs/marketing-apis/get-started'
    },
    'linkedin-ads': {
      name: 'LinkedIn Ads',
      icon: '💼',
      color: 'from-blue-700 to-blue-900',
      fields: [
        { key: 'clientId', label: 'Client ID', placeholder: '78xxxxxxxxxx', required: true },
        { key: 'clientSecret', label: 'Client Secret', placeholder: 'xxxxxxxxxxxxxxxx', required: true },
        { key: 'accessToken', label: 'Access Token', placeholder: 'AQxxxxxxxxxxxxxxxxxx', required: true },
        { key: 'accountId', label: 'Ad Account ID', placeholder: '123456789', required: true }
      ],
      instructions: [
        '1. Go to LinkedIn Developers (linkedin.com/developers)',
        '2. Create a new app',
        '3. Add Marketing Developer Platform product',
        '4. Configure OAuth2 settings',
        '5. Generate access token with appropriate scopes'
      ],
      docsUrl: 'https://docs.microsoft.com/en-us/linkedin/marketing/getting-started'
    },
    'twitter-ads': {
      name: 'X (Twitter) Ads',
      icon: '🐦',
      color: 'from-gray-800 to-black',
      fields: [
        { key: 'apiKey', label: 'API Key', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxx', required: true },
        { key: 'apiSecret', label: 'API Secret', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
        { key: 'accessToken', label: 'Access Token', placeholder: 'xxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
        { key: 'accessTokenSecret', label: 'Access Token Secret', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true }
      ],
      instructions: [
        '1. Apply for Twitter Ads API access',
        '2. Create app in Twitter Developer Portal',
        '3. Generate API keys and tokens',
        '4. Enable Ads API in app settings',
        '5. Wait for approval (can take several days)'
      ],
      docsUrl: 'https://developer.twitter.com/en/docs/twitter-ads-api/getting-started'
    },
    'tiktok-ads': {
      name: 'TikTok Ads',
      icon: '🎵',
      color: 'from-pink-500 to-red-500',
      fields: [
        { key: 'appId', label: 'App ID', placeholder: '1234567890123456789', required: true },
        { key: 'appSecret', label: 'App Secret', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
        { key: 'accessToken', label: 'Access Token', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true }
      ],
      instructions: [
        '1. Go to TikTok Ads Manager',
        '2. Create developer app',
        '3. Get App ID and Secret',
        '4. Generate access token',
        '5. Configure webhook endpoints'
      ],
      docsUrl: 'https://ads.tiktok.com/marketing_api/docs'
    },
    'snapchat-ads': {
      name: 'Snapchat Ads',
      icon: '👻',
      color: 'from-yellow-400 to-yellow-600',
      fields: [
        { key: 'clientId', label: 'Client ID', placeholder: 'snap-client-id-xxxxx', required: true },
        { key: 'clientSecret', label: 'Client Secret', placeholder: 'snap-secret-xxxxx', required: true },
        { key: 'refreshToken', label: 'Refresh Token', placeholder: 'snap-refresh-xxxxx', required: true }
      ],
      instructions: [
        '1. Apply for Snapchat Marketing API',
        '2. Create Business account',
        '3. Generate OAuth credentials',
        '4. Set up webhook endpoints',
        '5. Request production access'
      ],
      docsUrl: 'https://businesshelp.snapchat.com/s/article/api-documentation'
    },
    'pinterest-ads': {
      name: 'Pinterest Ads',
      icon: '📌',
      color: 'from-red-500 to-red-700',
      fields: [
        { key: 'appId', label: 'App ID', placeholder: '1234567890', required: true },
        { key: 'appSecret', label: 'App Secret', placeholder: 'pinterest-secret-xxxxx', required: true },
        { key: 'accessToken', label: 'Access Token', placeholder: 'pinterest-token-xxxxx', required: true }
      ],
      instructions: [
        '1. Create Pinterest App',
        '2. Add Ads product',
        '3. Generate access token',
        '4. Configure OAuth redirect',
        '5. Request ads_read and ads_write scopes'
      ],
      docsUrl: 'https://developers.pinterest.com/docs/getting-started/introduction/'
    },
    'amazon-ads': {
      name: 'Amazon Ads',
      icon: '📦',
      color: 'from-orange-400 to-orange-600',
      fields: [
        { key: 'clientId', label: 'Client ID', placeholder: 'amzn1.application.xxxxx', required: true },
        { key: 'clientSecret', label: 'Client Secret', placeholder: 'amazon-secret-xxxxx', required: true },
        { key: 'refreshToken', label: 'Refresh Token', placeholder: 'Atzr|xxxxx', required: true },
        { key: 'profileId', label: 'Profile ID', placeholder: '1234567890', required: true }
      ],
      instructions: [
        '1. Register as Amazon Developer',
        '2. Create Security Profile',
        '3. Add Amazon Advertising API',
        '4. Generate LWA credentials',
        '5. Get advertising profile ID'
      ],
      docsUrl: 'https://advertising.amazon.com/API/docs/en-us/get-started/how-to-get-started'
    }
  };

  const config = platformConfigs[platform] || platformConfigs['google-ads'];

  const handleInputChange = (key, value) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const requiredFields = config.fields.filter(f => f.required);
    const allFieldsFilled = requiredFields.every(field => credentials[field.key]?.trim());
    
    if (!allFieldsFilled) {
      alert('Please fill in all required fields');
      return;
    }

    onConnect(platform, credentials);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${config.color} p-6 text-white rounded-t-2xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{config.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold">Connect {config.name}</h2>
                  <p className="text-sm opacity-90">Enter your API credentials to enable campaign management</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Instructions */}
            <div className="mb-6 bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions:</h3>
              <ol className="text-sm text-blue-800 space-y-1">
                {config.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
              <a 
                href={config.docsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Full Documentation →
              </a>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {config.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    value={credentials[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Connect {config.name}
              </button>
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Security Note */}
            <p className="text-xs text-gray-500 text-center mt-4">
              🔒 Your credentials are encrypted and stored securely. We never share your data.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OAuthPopup;