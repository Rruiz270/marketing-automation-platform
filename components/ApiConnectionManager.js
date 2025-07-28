import { useState, useEffect } from 'react';

export default function ApiConnectionManager({ userId = 'demo_user' }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [showConnectionForm, setShowConnectionForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [aiServices, setAiServices] = useState({});
  const [aiKeys, setAiKeys] = useState([]);
  const [showAiServiceForm, setShowAiServiceForm] = useState(null);
  const [activeSection, setActiveSection] = useState('advertising');

  useEffect(() => {
    loadConnections();
    loadSyncStatus();
    loadAiServices();
    loadAiKeys();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_connected_platforms',
          user_id: userId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setConnections(data.data);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSyncStatus = async () => {
    try {
      const response = await fetch('/api/integrations/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_sync_status',
          user_id: userId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setSyncStatus(data.data);
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const loadAiServices = async () => {
    try {
      const response = await fetch('/api/ai-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_services_by_category',
          user_id: userId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setAiServices(data.data);
      }
    } catch (error) {
      console.error('Error loading AI services:', error);
    }
  };

  const loadAiKeys = async () => {
    try {
      const response = await fetch('/api/ai-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_user_keys',
          user_id: userId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setAiKeys(data.data);
      }
    } catch (error) {
      console.error('Error loading AI keys:', error);
    }
  };

  const openConnectionForm = (platform) => {
    setShowConnectionForm(platform);
    setFormData({});
  };

  const closeConnectionForm = () => {
    setShowConnectionForm(null);
    setFormData({});
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const submitConnection = async (platform) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect_with_credentials',
          platform: platform,
          user_id: userId,
          credentials: formData
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`${platform} connected successfully!`);
        closeConnectionForm();
        loadConnections();
      } else {
        alert('Connection failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error connecting platform:', error);
      alert('Error connecting platform: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (platform) => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_connection',
          platform: platform,
          user_id: userId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Connection test successful! Found ${data.data.campaigns_found} campaigns.`);
        loadConnections();
      } else {
        alert('Connection test failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      alert('Connection test failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const syncPlatform = async (platform) => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_campaigns',
          platform: platform,
          user_id: userId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Sync successful! Updated ${data.data.campaigns_updated} campaigns, created ${data.data.campaigns_created} new campaigns.`);
        loadSyncStatus();
      } else {
        alert('Sync failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error syncing platform:', error);
      alert('Sync failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const syncAllPlatforms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_all_platforms',
          user_id: userId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Synced all platforms! ${data.data.successful_syncs} successful, ${data.data.failed_syncs} failed.`);
        loadSyncStatus();
        loadConnections();
      }
    } catch (error) {
      console.error('Error syncing all platforms:', error);
      alert('Sync all failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const disconnectPlatform = async (platform) => {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disconnect',
          platform: platform,
          user_id: userId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`${platform} disconnected successfully.`);
        loadConnections();
      }
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      alert('Disconnect failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openAiServiceForm = (serviceId) => {
    setShowAiServiceForm(serviceId);
    setFormData({});
  };

  const closeAiServiceForm = () => {
    setShowAiServiceForm(null);
    setFormData({});
  };

  const saveAiApiKey = async (serviceId) => {
    if (!formData.apiKey) {
      alert('Please enter your API key');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/ai-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_api_key',
          user_id: userId,
          service: serviceId,
          api_key: formData.apiKey
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        closeAiServiceForm();
        loadAiKeys();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving AI API key:', error);
      alert('Error saving API key: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testAiApiKey = async (serviceId) => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_api_key',
          user_id: userId,
          service: serviceId
        })
      });
      
      const data = await response.json();
      alert(data.message);
      loadAiKeys();
    } catch (error) {
      console.error('Error testing AI API key:', error);
      alert('Error testing API key: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isAiServiceConnected = (serviceId) => {
    return aiKeys.some(key => key.service === serviceId && key.status === 'active');
  };

  const getAiServiceStatus = (serviceId) => {
    const key = aiKeys.find(key => key.service === serviceId);
    return key ? key.status : 'not_configured';
  };

  const availablePlatforms = [
    { id: 'google_ads', name: 'Google Ads', icon: '🔍', color: '#4285f4' },
    { id: 'facebook_ads', name: 'Facebook Ads', icon: '📘', color: '#1877f2' },
    { id: 'linkedin_ads', name: 'LinkedIn Ads', icon: '💼', color: '#0077b5' },
    { id: 'twitter_ads', name: 'Twitter Ads', icon: '🐦', color: '#1da1f2' },
    { id: 'tiktok_ads', name: 'TikTok Ads', icon: '🎵', color: '#000000' }
  ];

  const platformRequirements = {
    google_ads: {
      title: 'Google Ads API Connection',
      description: 'Connect your Google Ads account to sync campaign data and enable automated management.',
      fields: [
        { 
          key: 'customer_id', 
          label: 'Customer ID', 
          type: 'text', 
          placeholder: 'e.g., 123-456-7890',
          required: true,
          description: 'Found in your Google Ads account under Tools & Settings → Account Settings'
        },
        { 
          key: 'developer_token', 
          label: 'Developer Token', 
          type: 'password', 
          placeholder: 'Your Google Ads API developer token',
          required: true,
          description: 'Get this from Google Ads API Center (requires approval)'
        },
        { 
          key: 'client_id', 
          label: 'OAuth Client ID', 
          type: 'text', 
          placeholder: 'Your OAuth 2.0 Client ID',
          required: true,
          description: 'From Google Cloud Console → APIs & Services → Credentials'
        },
        { 
          key: 'client_secret', 
          label: 'OAuth Client Secret', 
          type: 'password', 
          placeholder: 'Your OAuth 2.0 Client Secret',
          required: true,
          description: 'From Google Cloud Console → APIs & Services → Credentials'
        },
        { 
          key: 'refresh_token', 
          label: 'Refresh Token', 
          type: 'password', 
          placeholder: 'OAuth refresh token (optional)',
          required: false,
          description: 'Will be generated during OAuth flow if not provided'
        }
      ]
    },
    facebook_ads: {
      title: 'Meta (Facebook) Ads API Connection',
      description: 'Connect your Facebook Business Manager to sync ad campaigns and automate marketing activities.',
      fields: [
        { 
          key: 'ad_account_id', 
          label: 'Ad Account ID', 
          type: 'text', 
          placeholder: 'act_1234567890123456',
          required: true,
          description: 'Found in Facebook Ads Manager URL or Business Settings'
        },
        { 
          key: 'app_id', 
          label: 'Facebook App ID', 
          type: 'text', 
          placeholder: 'Your Facebook App ID',
          required: true,
          description: 'From Facebook for Developers → Your App → Settings → Basic'
        },
        { 
          key: 'app_secret', 
          label: 'Facebook App Secret', 
          type: 'password', 
          placeholder: 'Your Facebook App Secret',
          required: true,
          description: 'From Facebook for Developers → Your App → Settings → Basic'
        },
        { 
          key: 'access_token', 
          label: 'Access Token', 
          type: 'password', 
          placeholder: 'Long-lived user access token',
          required: true,
          description: 'Generate using Facebook\'s Access Token Tool with ads_management permissions'
        },
        { 
          key: 'business_id', 
          label: 'Business Manager ID', 
          type: 'text', 
          placeholder: 'Your Business Manager ID (optional)',
          required: false,
          description: 'Found in Business Settings → Business Info'
        }
      ]
    },
    tiktok_ads: {
      title: 'TikTok Ads API Connection',
      description: 'Connect your TikTok for Business account to manage and optimize your TikTok advertising campaigns.',
      fields: [
        { 
          key: 'app_id', 
          label: 'TikTok App ID', 
          type: 'text', 
          placeholder: 'Your TikTok for Business App ID',
          required: true,
          description: 'From TikTok for Business → Developer Portal → Your App'
        },
        { 
          key: 'secret', 
          label: 'App Secret', 
          type: 'password', 
          placeholder: 'Your TikTok App Secret',
          required: true,
          description: 'From TikTok for Business → Developer Portal → Your App'
        },
        { 
          key: 'advertiser_id', 
          label: 'Advertiser ID', 
          type: 'text', 
          placeholder: 'Your TikTok Advertiser ID',
          required: true,
          description: 'Found in TikTok Ads Manager → Settings → Account Info'
        },
        { 
          key: 'access_token', 
          label: 'Access Token', 
          type: 'password', 
          placeholder: 'Long-term access token',
          required: true,
          description: 'Obtain through TikTok\'s OAuth flow with required permissions'
        }
      ]
    },
    linkedin_ads: {
      title: 'LinkedIn Ads API Connection',
      description: 'Connect your LinkedIn Campaign Manager to automate B2B advertising campaigns and lead generation.',
      fields: [
        { 
          key: 'client_id', 
          label: 'LinkedIn App Client ID', 
          type: 'text', 
          placeholder: 'Your LinkedIn App Client ID',
          required: true,
          description: 'From LinkedIn Developer Portal → Your App → Auth'
        },
        { 
          key: 'client_secret', 
          label: 'Client Secret', 
          type: 'password', 
          placeholder: 'Your LinkedIn App Client Secret',
          required: true,
          description: 'From LinkedIn Developer Portal → Your App → Auth'
        },
        { 
          key: 'account_id', 
          label: 'Ad Account ID', 
          type: 'text', 
          placeholder: 'Sponsored account ID',
          required: true,
          description: 'Found in LinkedIn Campaign Manager → Account Assets → Accounts'
        },
        { 
          key: 'access_token', 
          label: 'Access Token', 
          type: 'password', 
          placeholder: 'OAuth 2.0 access token',
          required: true,
          description: 'Generated through LinkedIn OAuth with advertising permissions'
        }
      ]
    },
    twitter_ads: {
      title: 'Twitter Ads API Connection',
      description: 'Connect your Twitter Ads account to manage promoted tweets, campaigns, and audience targeting.',
      fields: [
        { 
          key: 'api_key', 
          label: 'Twitter API Key', 
          type: 'text', 
          placeholder: 'Your Twitter API Key',
          required: true,
          description: 'From Twitter Developer Portal → Your App → Keys and Tokens'
        },
        { 
          key: 'api_secret', 
          label: 'API Secret Key', 
          type: 'password', 
          placeholder: 'Your Twitter API Secret Key',
          required: true,
          description: 'From Twitter Developer Portal → Your App → Keys and Tokens'
        },
        { 
          key: 'access_token', 
          label: 'Access Token', 
          type: 'password', 
          placeholder: 'Your Twitter Access Token',
          required: true,
          description: 'From Twitter Developer Portal → Your App → Keys and Tokens'
        },
        { 
          key: 'access_token_secret', 
          label: 'Access Token Secret', 
          type: 'password', 
          placeholder: 'Your Twitter Access Token Secret',
          required: true,
          description: 'From Twitter Developer Portal → Your App → Keys and Tokens'
        },
        { 
          key: 'account_id', 
          label: 'Ads Account ID', 
          type: 'text', 
          placeholder: 'Your Twitter Ads Account ID',
          required: true,
          description: 'Found in Twitter Ads Manager → Settings → Account Settings'
        }
      ]
    }
  };

  const connectedPlatformIds = connections.map(c => c.platform);

  return (
    <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>API Connections</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={syncAllPlatforms}
            disabled={loading || connections.length === 0}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading || connections.length === 0 ? 0.5 : 1
            }}
          >
            {loading ? 'Syncing...' : 'Sync All'}
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '0' }}>
          <button
            onClick={() => setActiveSection('advertising')}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeSection === 'advertising' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeSection === 'advertising' ? '#3b82f6' : '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            🎯 Advertising Platforms
          </button>
          <button
            onClick={() => setActiveSection('ai')}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeSection === 'ai' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeSection === 'ai' ? '#3b82f6' : '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            🤖 AI Creative Services
          </button>
        </div>
      </div>

      {/* Connection Status Overview */}
      {syncStatus && (
        <div style={{ 
          backgroundColor: '#f0fdf4', 
          border: '1px solid #bbf7d0', 
          borderRadius: '8px', 
          padding: '16px', 
          marginBottom: '24px' 
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>Sync Status</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                {syncStatus.connected_platforms}
              </div>
              <div style={{ fontSize: '12px', color: '#065f46' }}>Connected Platforms</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                {syncStatus.total_campaigns}
              </div>
              <div style={{ fontSize: '12px', color: '#065f46' }}>Total Campaigns</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#065f46' }}>Last Global Sync</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>
                {syncStatus.last_global_sync ? 
                  new Date(syncStatus.last_global_sync).toLocaleString() : 
                  'Never'
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advertising Platforms Section */}
      {activeSection === 'advertising' && (
        <>
          {/* Available Platforms */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Available Platforms</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {availablePlatforms.map(platform => {
            const isConnected = connectedPlatformIds.includes(platform.id);
            const connection = connections.find(c => c.platform === platform.id);
            
            return (
              <div
                key={platform.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: isConnected ? '#f0fdf4' : 'white'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px', marginRight: '8px' }}>{platform.icon}</span>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>{platform.name}</h4>
                    {isConnected && connection && (
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                        {connection.account_name}
                      </p>
                    )}
                  </div>
                </div>
                
                {isConnected && connection ? (
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '8px',
                      fontSize: '12px',
                      color: connection.status === 'active' ? '#059669' : '#dc2626'
                    }}>
                      <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        backgroundColor: connection.status === 'active' ? '#10b981' : '#ef4444',
                        marginRight: '6px'
                      }} />
                      {connection.status === 'active' ? 'Connected' : 'Connection Issues'}
                    </div>
                    
                    {connection.last_sync && (
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 12px 0' }}>
                        Last sync: {new Date(connection.last_sync).toLocaleString()}
                      </p>
                    )}
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => testConnection(platform.id)}
                        disabled={loading}
                        style={{
                          backgroundColor: 'white',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Test
                      </button>
                      <button
                        onClick={() => syncPlatform(platform.id)}
                        disabled={loading}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Sync
                      </button>
                      <button
                        onClick={() => disconnectPlatform(platform.id)}
                        disabled={loading}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => openConnectionForm(platform.id)}
                    disabled={loading}
                    style={{
                      backgroundColor: platform.color,
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    {loading ? 'Connecting...' : `Connect ${platform.name}`}
                  </button>
                )}
                
                {isConnected && connection && connection.has_errors && (
                  <div style={{ 
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '4px'
                  }}>
                    <p style={{ fontSize: '12px', color: '#dc2626', margin: 0 }}>
                      ⚠️ Connection has errors
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Setup Instructions */}
      <div style={{ 
        backgroundColor: '#f8fafc', 
        border: '1px solid #e2e8f0', 
        borderRadius: '8px', 
        padding: '16px' 
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Setup Instructions</h3>
        <ol style={{ fontSize: '14px', color: '#4b5563', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>
            <strong>Google Ads:</strong> Requires Developer Token, Client ID, and Client Secret. 
            Get these from <a href="https://developers.google.com/google-ads/api" target="_blank" rel="noopener noreferrer">Google Ads API Console</a>.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Facebook Ads:</strong> Requires App ID, App Secret, and Business Manager access. 
            Set up at <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer">Facebook for Developers</a>.
          </li>
          <li style={{ marginBottom: '8px' }}>
            Add the required environment variables to your .env.local file.
          </li>
          <li>
            Each platform requires approval and proper permissions for production use.
          </li>
        </ol>
      </div>
        </>
      )}

      {/* AI Services Section */}
      {activeSection === 'ai' && (
        <>
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>AI Creative Services</h3>
            <div style={{ display: 'grid', gap: '24px' }}>
              {['text', 'video', 'audio'].map(category => (
                <div key={category} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#f8fafc'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', textTransform: 'capitalize' }}>
                    {category === 'text' ? '✍️ Text & Copywriting' : 
                     category === 'video' ? '🎥 Video Creation' : 
                     '🎵 Audio Creation'}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {aiServices[category]?.map(service => {
                      const isConnected = isAiServiceConnected(service.id);
                      const status = getAiServiceStatus(service.id);
                      
                      return (
                        <div
                          key={service.id}
                          style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            padding: '16px',
                            backgroundColor: isConnected ? '#f0fdf4' : 'white'
                          }}
                        >
                          <div style={{ marginBottom: '12px' }}>
                            <h5 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                              {service.name}
                            </h5>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, lineHeight: '1.4' }}>
                              {service.description}
                            </p>
                          </div>

                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginBottom: '12px',
                            fontSize: '12px',
                            color: status === 'active' ? '#059669' : status === 'error' ? '#dc2626' : '#6b7280'
                          }}>
                            <span style={{ 
                              width: '8px', 
                              height: '8px', 
                              borderRadius: '50%', 
                              backgroundColor: status === 'active' ? '#10b981' : status === 'error' ? '#ef4444' : '#9ca3af',
                              marginRight: '6px'
                            }} />
                            {status === 'active' ? 'Connected' : status === 'error' ? 'Connection Error' : 'Not Connected'}
                          </div>

                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {!isConnected ? (
                              <button
                                onClick={() => openAiServiceForm(service.id)}
                                style={{
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                              >
                                Add API Key
                              </button>
                            ) : (
                              <button
                                onClick={() => testAiApiKey(service.id)}
                                disabled={loading}
                                style={{
                                  backgroundColor: 'white',
                                  color: '#374151',
                                  border: '1px solid #d1d5db',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                              >
                                Test
                              </button>
                            )}
                            
                            <a
                              href={service.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: '#3b82f6',
                                fontSize: '12px',
                                textDecoration: 'none',
                                padding: '6px 0'
                              }}
                            >
                              Get API Key →
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Connection Form Modal */}
      {showConnectionForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {(() => {
              const platformInfo = platformRequirements[showConnectionForm];
              if (!platformInfo) return null;

              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                      {platformInfo.title}
                    </h2>
                    <button 
                      onClick={closeConnectionForm}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#6b7280'
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                    {platformInfo.description}
                  </p>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    submitConnection(showConnectionForm);
                  }}>
                    {platformInfo.fields.map((field) => (
                      <div key={field.key} style={{ marginBottom: '20px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '600',
                          marginBottom: '4px',
                          color: '#374151'
                        }}>
                          {field.label}
                          {field.required && <span style={{ color: '#ef4444' }}> *</span>}
                        </label>
                        
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          required={field.required}
                          value={formData[field.key] || ''}
                          onChange={(e) => updateFormData(field.key, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            boxSizing: 'border-box'
                          }}
                        />
                        
                        <p style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          margin: '4px 0 0 0',
                          lineHeight: '1.4'
                        }}>
                          {field.description}
                        </p>
                      </div>
                    ))}

                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'flex-end',
                      marginTop: '32px',
                      paddingTop: '20px',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <button
                        type="button"
                        onClick={closeConnectionForm}
                        disabled={loading}
                        style={{
                          backgroundColor: 'white',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          padding: '10px 20px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.5 : 1
                        }}
                      >
                        {loading ? 'Connecting...' : `Connect ${availablePlatforms.find(p => p.id === showConnectionForm)?.name}`}
                      </button>
                    </div>
                  </form>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* AI Service Form Modal */}
      {showAiServiceForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%'
          }}>
            {(() => {
              const service = Object.values(aiServices).flat().find(s => s.id === showAiServiceForm);
              if (!service) return null;

              return (
                <>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                    Add API Key for {service.name}
                  </h3>
                  
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                    {service.description}
                  </p>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      API Key
                    </label>
                    <input
                      type="password"
                      placeholder={`Enter your ${service.name} API key`}
                      value={formData.apiKey || ''}
                      onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      Expected format: {service.keyFormat}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={closeAiServiceForm}
                      style={{
                        backgroundColor: 'white',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveAiApiKey(showAiServiceForm)}
                      disabled={loading || !formData.apiKey}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: loading || !formData.apiKey ? 'not-allowed' : 'pointer',
                        opacity: loading || !formData.apiKey ? 0.5 : 1
                      }}
                    >
                      {loading ? 'Saving...' : 'Save API Key'}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}