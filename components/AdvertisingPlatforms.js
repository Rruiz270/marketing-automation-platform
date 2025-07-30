import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import OAuthPopup from './OAuthPopup';

const AdvertisingPlatforms = ({ onUpdate }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testingPlatform, setTestingPlatform] = useState(null);
  const [oauthPopupOpen, setOauthPopupOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  const platforms = [
    {
      id: 'google-ads',
      name: 'Google Ads',
      description: 'Search, Display, and YouTube advertising',
      icon: '🔍',
      color: 'from-blue-500 to-blue-700',
      features: ['Search Ads', 'Display Network', 'YouTube Ads', 'Shopping Campaigns'],
      connectionType: 'OAuth2',
      status: 'available'
    },
    {
      id: 'facebook-ads',
      name: 'Facebook Ads',
      description: 'Facebook and Instagram advertising platform',
      icon: '📘',
      color: 'from-blue-600 to-indigo-700',
      features: ['Facebook Ads', 'Instagram Ads', 'Audience Network', 'Messenger Ads'],
      connectionType: 'OAuth2',
      status: 'available'
    },
    {
      id: 'linkedin-ads',
      name: 'LinkedIn Ads',
      description: 'Professional B2B advertising platform',
      icon: '💼',
      color: 'from-blue-700 to-blue-900',
      features: ['Sponsored Content', 'Message Ads', 'Dynamic Ads', 'Lead Gen Forms'],
      connectionType: 'OAuth2',
      status: 'available'
    },
    {
      id: 'twitter-ads',
      name: 'X (Twitter) Ads',
      description: 'Real-time conversation advertising',
      icon: '🐦',
      color: 'from-gray-800 to-black',
      features: ['Promoted Tweets', 'Video Ads', 'App Install Ads', 'Website Clicks'],
      connectionType: 'OAuth2',
      status: 'available'
    },
    {
      id: 'tiktok-ads',
      name: 'TikTok Ads',
      description: 'Short-form video advertising platform',
      icon: '🎵',
      color: 'from-pink-500 to-red-500',
      features: ['In-Feed Ads', 'TopView', 'Brand Takeover', 'Hashtag Challenge'],
      connectionType: 'OAuth2',
      status: 'available'
    },
    {
      id: 'snapchat-ads',
      name: 'Snapchat Ads',
      description: 'Visual storytelling advertising',
      icon: '👻',
      color: 'from-yellow-400 to-yellow-600',
      features: ['Snap Ads', 'Story Ads', 'Collection Ads', 'AR Lenses'],
      connectionType: 'OAuth2',
      status: 'available'
    },
    {
      id: 'pinterest-ads',
      name: 'Pinterest Ads',
      description: 'Visual discovery advertising',
      icon: '📌',
      color: 'from-red-500 to-red-700',
      features: ['Promoted Pins', 'Shopping Ads', 'Video Ads', 'Carousel Ads'],
      connectionType: 'OAuth2',
      status: 'available'
    },
    {
      id: 'amazon-ads',
      name: 'Amazon Ads',
      description: 'E-commerce advertising platform',
      icon: '📦',
      color: 'from-orange-400 to-orange-600',
      features: ['Sponsored Products', 'Sponsored Brands', 'Display Ads', 'Video Ads'],
      connectionType: 'OAuth2',
      status: 'available'
    }
  ];

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const response = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_user_connections',
          user_id: 'default_user'
        })
      });
      const data = await response.json();
      if (data.success) {
        setConnections(data.data || []);
      }
    } catch (error) {
      console.error('Error loading platform connections:', error);
      // Set mock connections for demo
      setConnections([]);
    }
  };

  const handleConnectClick = (platformId) => {
    setSelectedPlatform(platformId);
    setOauthPopupOpen(true);
  };

  const handleConnect = async (platformId, credentials) => {
    setLoading(true);
    setTestingPlatform(platformId);
    
    try {
      const response = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: platformId,
          credentials,
          user_id: 'default_user'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const newConnection = {
          platform: platformId,
          status: 'connected',
          connected_at: new Date().toISOString(),
          account_name: data.account_name || `${platforms.find(p => p.id === platformId)?.name} Account`,
          ...data.connection_data
        };
        
        setConnections(prev => [...prev.filter(c => c.platform !== platformId), newConnection]);
        onUpdate && onUpdate();
        alert(`${platforms.find(p => p.id === platformId)?.name} connected successfully!`);
      } else {
        alert(`Error connecting: ${data.error || 'Connection failed'}`);
      }
    } catch (error) {
      console.error('Error connecting platform:', error);
      alert('Error connecting platform. Please check your credentials.');
    } finally {
      setLoading(false);
      setTestingPlatform(null);
    }
  };

  const handleDisconnect = async (platformId) => {
    setLoading(true);
    
    try {
      // Simulate disconnection
      setTimeout(() => {
        setConnections(prev => prev.filter(c => c.platform !== platformId));
        onUpdate && onUpdate();
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      setLoading(false);
    }
  };

  const isConnected = (platformId) => {
    return connections.some(conn => conn.platform === platformId && conn.status === 'connected');
  };

  const isTesting = (platformId) => {
    return testingPlatform === platformId;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Advertising Platforms
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Connect your advertising accounts to enable automated campaign management and cross-platform optimization
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Connected Platforms</p>
              <p className="text-3xl font-bold">{connections.length}</p>
            </div>
            <div className="text-4xl opacity-80">🔗</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Available Platforms</p>
              <p className="text-3xl font-bold">{platforms.length}</p>
            </div>
            <div className="text-4xl opacity-80">🚀</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Campaign Reach</p>
              <p className="text-lg font-semibold">Multi-Platform</p>
            </div>
            <div className="text-4xl opacity-80">🌐</div>
          </div>
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const connected = isConnected(platform.id);
          const testing = isTesting(platform.id);
          
          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${platform.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{platform.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold">{platform.name}</h3>
                      <p className="text-sm opacity-90">{platform.description}</p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    connected 
                      ? 'bg-green-500 bg-opacity-20 text-green-100' 
                      : 'bg-white bg-opacity-20 text-white'
                  }`}>
                    {connected ? '✓ Connected' : 'Not Connected'}
                  </div>
                </div>
                
                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {platform.features.map((feature) => (
                    <span 
                      key={feature}
                      className="px-2 py-1 bg-white bg-opacity-20 rounded text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {!connected ? (
                  /* Connection Form */
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        Connect via {platform.connectionType} to enable automated campaigns
                      </p>
                      
                      <button
                        onClick={() => handleConnectClick(platform.id)}
                        disabled={loading || testing}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                          testing 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        } disabled:opacity-50`}
                      >
                        {testing ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Connecting...</span>
                          </div>
                        ) : (
                          `Connect ${platform.name}`
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Connected State */
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <span className="text-green-700 font-medium block">Platform Connected</span>
                        <span className="text-green-600 text-sm">
                          {connections.find(c => c.platform === platform.id)?.account_name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => alert('Campaign management coming soon!')}
                        className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                      >
                        Manage Campaigns
                      </button>
                      
                      <button
                        onClick={() => handleDisconnect(platform.id)}
                        disabled={loading}
                        className="flex-1 py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Integration Guide */}
      <div className="mt-12 bg-gray-50 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Integration Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">OAuth2 Connection</h4>
            <p className="text-sm text-gray-600 mb-2">
              All platforms use secure OAuth2 authentication. No passwords stored.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Automatic token refresh</li>
              <li>• Granular permissions</li>
              <li>• Secure data handling</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Campaign Management</h4>
            <p className="text-sm text-gray-600 mb-2">
              Once connected, manage campaigns across all platforms from one dashboard.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Cross-platform optimization</li>
              <li>• Unified reporting</li>
              <li>• Automated bidding</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* OAuth Popup */}
      <OAuthPopup
        platform={selectedPlatform}
        isOpen={oauthPopupOpen}
        onClose={() => {
          setOauthPopupOpen(false);
          setSelectedPlatform(null);
        }}
        onConnect={handleConnect}
      />
    </div>
  );
};

export default AdvertisingPlatforms;