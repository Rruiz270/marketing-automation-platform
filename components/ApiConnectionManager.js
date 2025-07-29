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

  // Static fallback AI services in case API fails
  const staticAiServices = {
    text: [
      { id: 'openai', name: 'OpenAI GPT-4', description: 'Industry-leading AI for copywriting, content creation, and marketing copy', website: 'https://platform.openai.com/api-keys', keyFormat: 'sk-...' },
      { id: 'claude', name: 'Claude (Anthropic)', description: 'Advanced AI assistant excellent for marketing and creative writing', website: 'https://console.anthropic.com/', keyFormat: 'sk-ant-...' },
      { id: 'jasper', name: 'Jasper AI', description: 'Marketing-focused AI writer with templates for ads and campaigns', website: 'https://app.jasper.ai/settings/billing', keyFormat: 'Bearer token' },
      { id: 'copyai', name: 'Copy.ai', description: 'Specialized AI for marketing copy, social media, and ad content', website: 'https://app.copy.ai/settings/api', keyFormat: 'API key' },
      { id: 'writesonic', name: 'Writesonic', description: 'AI writer for marketing and sales copy with SEO optimization', website: 'https://app.writesonic.com/setting/api-keys', keyFormat: 'API key' }
    ],
    video: [
      { id: 'google_veo', name: 'Google Veo', description: 'Advanced AI video generation by Google DeepMind', website: 'https://cloud.google.com/vertex-ai', keyFormat: 'Service account JSON' },
      { id: 'runwayml', name: 'RunwayML', description: 'Professional AI video editing and generation platform', website: 'https://app.runwayml.com/account', keyFormat: 'API key' },
      { id: 'pika', name: 'Pika Labs', description: 'AI video generation from text prompts and images', website: 'https://pika.art/', keyFormat: 'API key' },
      { id: 'synthesia', name: 'Synthesia', description: 'AI avatar videos with realistic human presenters', website: 'https://app.synthesia.io/settings/api', keyFormat: 'API key' },
      { id: 'stable_video', name: 'Stable Video Diffusion', description: 'Open-source AI video generation and editing', website: 'https://stability.ai/api', keyFormat: 'sk-...' }
    ],
    audio: [
      { id: 'elevenlabs', name: 'ElevenLabs', description: 'Best-in-class voice cloning and text-to-speech', website: 'https://elevenlabs.io/settings/api-keys', keyFormat: 'API key' },
      { id: 'murf', name: 'Murf AI', description: 'Professional AI voiceovers with realistic human voices', website: 'https://murf.ai/settings/api', keyFormat: 'API key' },
      { id: 'speechify', name: 'Speechify', description: 'High-quality text-to-speech for marketing content', website: 'https://speechify.com/api', keyFormat: 'API key' },
      { id: 'aiva', name: 'AIVA', description: 'AI music composition for video and audio content', website: 'https://aiva.ai/api', keyFormat: 'API key' },
      { id: 'soundraw', name: 'Soundraw', description: 'AI-generated music and sound effects for marketing', website: 'https://soundraw.io/api', keyFormat: 'API key' }
    ]
  };

  useEffect(() => {
    loadConnections();
    loadSyncStatus();
    loadAiServices(); // Load AI services immediately
    loadAiKeys();
  }, []);

  // Also load AI services when component mounts or when activeSection changes to 'ai'
  useEffect(() => {
    if (activeSection === 'ai' && Object.keys(aiServices).length === 0) {
      console.log('Loading AI services because section is ai and services are empty');
      loadAiServices();
    }
  }, [activeSection]);

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
      const response = await fetch('/api/ai-keys-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_services_by_category',
          user_id: userId
        })
      });
      
      const data = await response.json();
      console.log('AI Services API Response:', data);
      if (data.success && data.data) {
        setAiServices(data.data);
        console.log('AI Services set:', data.data);
      } else {
        console.error('AI Services API error:', data.error);
        console.log('Using static AI services as fallback');
        setAiServices(staticAiServices);
      }
    } catch (error) {
      console.error('Error loading AI services:', error);
      console.log('Using static AI services as fallback');
      setAiServices(staticAiServices);
    }
  };

  const loadAiKeys = async () => {
    try {
      const response = await fetch('/api/ai-keys-simple', {
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
      console.log('Saving API key for service:', serviceId);
      
      const response = await fetch('/api/ai-keys-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_api_key',
          user_id: userId,
          service: serviceId,
          api_key: formData.apiKey
        })
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        alert(data.message);
        closeAiServiceForm();
        loadAiKeys();
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
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
      const response = await fetch('/api/ai-keys-simple', {
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

  const toggleAiService = async (serviceId) => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-keys-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_api_key',
          user_id: userId,
          service: serviceId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Update local state immediately for better UX
        setAiKeys(prevKeys => 
          prevKeys.map(key => 
            key.service === serviceId 
              ? { ...key, enabled: data.data.enabled, status: data.data.status }
              : key
          )
        );
        // Also reload to ensure consistency
        loadAiKeys();
      } else {
        alert('Error toggling service: ' + data.error);
      }
    } catch (error) {
      console.error('Error toggling AI service:', error);
      alert('Error toggling service: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const disconnectAiService = async (serviceId) => {
    const serviceName = Object.values(aiServices).flat().find(s => s.id === serviceId)?.name || serviceId;
    
    if (!confirm(`Are you sure you want to disconnect ${serviceName}? This will remove the API key and disable all AI features for this service.`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/ai-keys-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disconnect_api_key',
          user_id: userId,
          service: serviceId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Update local state immediately
        setAiKeys(prevKeys => prevKeys.filter(key => key.service !== serviceId));
        alert(`${serviceName} disconnected successfully!`);
        // Also reload to ensure consistency
        loadAiKeys();
      } else {
        alert('Error disconnecting service: ' + data.error);
      }
    } catch (error) {
      console.error('Error disconnecting AI service:', error);
      alert('Error disconnecting service: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isAiServiceConnected = (serviceId) => {
    return aiKeys.some(key => key.service === serviceId && key.enabled !== false);
  };

  const getAiServiceStatus = (serviceId) => {
    const key = aiKeys.find(key => key.service === serviceId);
    if (!key) return 'not_configured';
    if (key.enabled === false) return 'disabled';
    return key.status || 'active';
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
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '16px', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    }}>
      {/* Header Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '32px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            marginRight: '16px'
          }}>
            🔗
          </div>
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              margin: 0,
              lineHeight: '1.2'
            }}>
              API Connections
            </h1>
            <p style={{ 
              fontSize: '16px', 
              margin: 0,
              opacity: '0.9',
              fontWeight: '400'
            }}>
              Connect your advertising platforms and AI services to power your campaigns
            </p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div style={{ 
          display: 'flex', 
          gap: '24px', 
          marginTop: '24px',
          flexWrap: 'wrap'
        }}>
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.15)', 
            borderRadius: '12px',
            padding: '16px 20px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>
              {connections.length}
            </div>
            <div style={{ fontSize: '14px', opacity: '0.9' }}>
              Connected Platforms
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.15)', 
            borderRadius: '12px',
            padding: '16px 20px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>
              {aiKeys.length}
            </div>
            <div style={{ fontSize: '14px', opacity: '0.9' }}>
              AI Services
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        {connections.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <button
              onClick={syncAllPlatforms}
              disabled={loading}
              style={{
                backgroundColor: loading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.25)';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'none';
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>Syncing All...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Sync All Platforms</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      <div style={{ padding: '32px' }}>

        {/* Section Navigation */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            display: 'flex', 
            backgroundColor: '#f1f5f9',
            borderRadius: '12px',
            padding: '6px',
            gap: '6px'
          }}>
            <button
              onClick={() => setActiveSection('advertising')}
              style={{
                flex: 1,
                padding: '16px 24px',
                border: 'none',
                backgroundColor: activeSection === 'advertising' ? 'white' : 'transparent',
                borderRadius: '8px',
                color: activeSection === 'advertising' ? '#1e293b' : '#64748b',
                fontSize: '15px',
                fontWeight: activeSection === 'advertising' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeSection === 'advertising' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '18px' }}>🎯</span>
              <span>Advertising Platforms</span>
            </button>
            <button
              onClick={() => {
                setActiveSection('ai');
                if (Object.keys(aiServices).length === 0) {
                  loadAiServices();
                }
              }}
              style={{
                flex: 1,
                padding: '16px 24px',
                border: 'none',
                backgroundColor: activeSection === 'ai' ? 'white' : 'transparent',
                borderRadius: '8px',
                color: activeSection === 'ai' ? '#1e293b' : '#64748b',
                fontSize: '15px',
                fontWeight: activeSection === 'ai' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeSection === 'ai' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '18px' }}>🤖</span>
              <span>AI Creative Services</span>
            </button>
          </div>
        </div>

        {/* Connection Status Overview */}
        {syncStatus && (
          <div style={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '16px', 
            padding: '24px', 
            marginBottom: '32px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginRight: '12px'
              }}>
                📊
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Sync Status</h3>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '20px' 
            }}>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                padding: '16px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
                  {syncStatus.connected_platforms}
                </div>
                <div style={{ fontSize: '14px', opacity: '0.9' }}>Connected Platforms</div>
              </div>
              
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                padding: '16px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
                  {syncStatus.total_campaigns}
                </div>
                <div style={{ fontSize: '14px', opacity: '0.9' }}>Total Campaigns</div>
              </div>
              
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                padding: '16px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '14px', opacity: '0.9', marginBottom: '4px' }}>Last Global Sync</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
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
          <div style={{ marginBottom: '40px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                marginBottom: '8px',
                color: '#1e293b'
              }}>
                🎯 Advertising Platforms
              </h3>
              <p style={{ 
                fontSize: '16px', 
                color: '#64748b',
                margin: 0,
                lineHeight: '1.6'
              }}>
                Connect your advertising accounts to sync campaigns, automate bidding, and optimize performance in real-time.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {availablePlatforms.map(platform => {
            const isConnected = connectedPlatformIds.includes(platform.id);
            const connection = connections.find(c => c.platform === platform.id);
            
            return (
              <div
                key={platform.id}
                style={{
                  border: isConnected ? '2px solid #10b981' : '2px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '24px',
                  backgroundColor: isConnected ? '#f0fdf4' : 'white',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!isConnected) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px -8px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isConnected) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {isConnected && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '24px',
                    height: '24px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    ✓
                  </div>
                )}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: platform.color,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      marginRight: '12px',
                      boxShadow: `0 4px 12px -4px ${platform.color}40`
                    }}>
                      {platform.icon}
                    </div>
                    <div>
                      <h4 style={{ 
                        fontSize: '18px', 
                        fontWeight: '700', 
                        margin: '0 0 4px 0',
                        color: '#1e293b'
                      }}>
                        {platform.name}
                      </h4>
                      {isConnected && connection && (
                        <p style={{ 
                          fontSize: '14px', 
                          color: '#64748b', 
                          margin: 0,
                          fontWeight: '500'
                        }}>
                          {connection.account_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {isConnected && connection ? (
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '12px',
                      padding: '12px',
                      backgroundColor: connection.status === 'active' ? '#dcfce7' : '#fef2f2',
                      borderRadius: '8px',
                      border: `1px solid ${connection.status === 'active' ? '#bbf7d0' : '#fecaca'}`
                    }}>
                      <span style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        backgroundColor: connection.status === 'active' ? '#10b981' : '#ef4444',
                        marginRight: '8px'
                      }} />
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: connection.status === 'active' ? '#059669' : '#dc2626'
                      }}>
                        {connection.status === 'active' ? '✅ Connected & Active' : '❌ Connection Issues'}
                      </span>
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
                          color: '#64748b',
                          border: '2px solid #e2e8f0',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.target.style.borderColor = '#cbd5e1';
                            e.target.style.color = '#475569';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.color = '#64748b';
                          }
                        }}
                      >
                        🔍 Test
                      </button>
                      <button
                        onClick={() => syncPlatform(platform.id)}
                        disabled={loading}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.target.style.backgroundColor = '#2563eb';
                            e.target.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.target.style.backgroundColor = '#3b82f6';
                            e.target.style.transform = 'none';
                          }
                        }}
                      >
                        🔄 Sync
                      </button>
                      <button
                        onClick={() => disconnectPlatform(platform.id)}
                        disabled={loading}
                        style={{
                          backgroundColor: 'white',
                          color: '#ef4444',
                          border: '2px solid #fecaca',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.target.style.backgroundColor = '#fef2f2';
                            e.target.style.borderColor = '#f87171';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.borderColor = '#fecaca';
                          }
                        }}
                      >
                        🗑️ Disconnect
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
                      padding: '16px 24px',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      width: '100%',
                      transition: 'all 0.2s ease',
                      boxShadow: `0 4px 12px -4px ${platform.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = `0 8px 25px -8px ${platform.color}`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'none';
                        e.target.style.boxShadow = `0 4px 12px -4px ${platform.color}`;
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <span>🔗</span>
                        <span>Connect {platform.name}</span>
                      </>
                    )}
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
            <div style={{ marginBottom: '40px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  marginBottom: '8px',
                  color: '#1e293b'
                }}>
                  🤖 AI Creative Services
                </h3>
                <p style={{ 
                  fontSize: '16px', 
                  color: '#64748b',
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  Connect AI services to power your creative generation, copywriting, video creation, and audio production.
                </p>
              </div>
              <div style={{ display: 'grid', gap: '32px' }}>
              {['text', 'video', 'audio'].map(category => {
                console.log(`Rendering category ${category}, services:`, aiServices[category]);
                return (
                  <div key={category} style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '24px',
                    backgroundColor: '#f8fafc',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                  }}>
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ 
                        fontSize: '20px', 
                        fontWeight: '700', 
                        marginBottom: '4px',
                        color: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '24px' }}>
                          {category === 'text' ? '✍️' : 
                           category === 'video' ? '🎥' : 
                           '🎵'}
                        </span>
                        {category === 'text' ? 'Text & Copywriting' : 
                         category === 'video' ? 'Video Creation' : 
                         'Audio Creation'}
                      </h4>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#64748b', 
                        margin: 0,
                        fontWeight: '500'
                      }}>
                        {aiServices[category]?.length || 0} services available
                      </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                      {aiServices[category]?.length ? aiServices[category].map(service => {
                      const isConnected = isAiServiceConnected(service.id);
                      const status = getAiServiceStatus(service.id);
                      
                      return (
                        <div
                          key={service.id}
                          style={{
                            border: isConnected ? '2px solid #10b981' : '2px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '20px',
                            backgroundColor: isConnected ? '#f0fdf4' : 'white',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            boxShadow: isConnected ? '0 4px 12px -4px rgba(16, 185, 129, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = isConnected ? 
                              '0 8px 25px -8px rgba(16, 185, 129, 0.4)' : 
                              '0 4px 12px -4px rgba(0, 0, 0, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = isConnected ? 
                              '0 4px 12px -4px rgba(16, 185, 129, 0.3)' : 
                              '0 2px 4px rgba(0,0,0,0.05)';
                          }}
                        >
                          {isConnected && (
                            <div style={{
                              position: 'absolute',
                              top: '16px',
                              right: '16px',
                              width: '24px',
                              height: '24px',
                              backgroundColor: '#10b981',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              ✓
                            </div>
                          )}
                          <div style={{ marginBottom: '16px' }}>
                            <h5 style={{ 
                              fontSize: '16px', 
                              fontWeight: '700', 
                              margin: '0 0 8px 0',
                              color: '#1e293b'
                            }}>
                              {service.name}
                            </h5>
                            <p style={{ 
                              fontSize: '14px', 
                              color: '#64748b', 
                              margin: 0, 
                              lineHeight: '1.5',
                              fontWeight: '400'
                            }}>
                              {service.description}
                            </p>
                          </div>

                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginBottom: '16px',
                            padding: '8px 12px',
                            backgroundColor: status === 'active' ? '#dcfce7' : status === 'error' ? '#fef2f2' : '#f1f5f9',
                            borderRadius: '8px',
                            border: `1px solid ${status === 'active' ? '#bbf7d0' : status === 'error' ? '#fecaca' : '#e2e8f0'}`
                          }}>
                            <span style={{ 
                              width: '10px', 
                              height: '10px', 
                              borderRadius: '50%', 
                              backgroundColor: status === 'active' ? '#10b981' : status === 'error' ? '#ef4444' : '#9ca3af',
                              marginRight: '8px'
                            }} />
                            <span style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: status === 'active' ? '#059669' : status === 'error' ? '#dc2626' : '#64748b'
                            }}>
                              {status === 'active' ? '✅ Connected' : status === 'error' ? '❌ Connection Error' : '⚪ Not Connected'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {!isConnected ? (
                              <button
                                onClick={() => openAiServiceForm(service.id)}
                                style={{
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  padding: '12px 20px',
                                  borderRadius: '8px',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#2563eb';
                                  e.target.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = '#3b82f6';
                                  e.target.style.transform = 'none';
                                }}
                              >
                                <span>🔑</span>
                                <span>Connect {service.name}</span>
                              </button>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {/* Connection Controls */}
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '12px 16px',
                                  backgroundColor: '#f0fdf4',
                                  borderRadius: '8px',
                                  border: '1px solid #bbf7d0'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '16px' }}>🔗</span>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#065f46' }}>
                                      Connected
                                    </span>
                                  </div>
                                  
                                  {/* Toggle Switch */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '12px', color: '#047857' }}>
                                      {getAiServiceStatus(service.id) === 'active' ? 'Enabled' : 'Disabled'}
                                    </span>
                                    <div
                                      onClick={() => toggleAiService(service.id)}
                                      style={{
                                        width: '44px',
                                        height: '24px',
                                        borderRadius: '12px',
                                        backgroundColor: getAiServiceStatus(service.id) === 'active' ? '#10b981' : '#d1d5db',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: 'white',
                                        position: 'absolute',
                                        top: '2px',
                                        left: getAiServiceStatus(service.id) === 'active' ? '22px' : '2px',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                      }} />
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => testAiApiKey(service.id)}
                                    disabled={loading}
                                    style={{
                                      backgroundColor: 'white',
                                      color: '#64748b',
                                      border: '2px solid #e2e8f0',
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      fontWeight: '500',
                                      cursor: loading ? 'not-allowed' : 'pointer',
                                      transition: 'all 0.2s ease',
                                      flex: 1
                                    }}
                                  >
                                    🔍 Test
                                  </button>
                                  
                                  <button
                                    onClick={() => disconnectAiService(service.id)}
                                    disabled={loading}
                                    style={{
                                      backgroundColor: '#fef2f2',
                                      color: '#dc2626',
                                      border: '2px solid #fecaca',
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      fontWeight: '500',
                                      cursor: loading ? 'not-allowed' : 'pointer',
                                      transition: 'all 0.2s ease',
                                      flex: 1
                                    }}
                                  >
                                    🗑️ Remove
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            <a
                              href={service.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: '#3b82f6',
                                fontSize: '14px',
                                textDecoration: 'none',
                                fontWeight: '500',
                                textAlign: 'center',
                                padding: '8px',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '6px',
                                border: '1px solid #bae6fd',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#e0f2fe';
                                e.target.style.borderColor = '#7dd3fc';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#f0f9ff';
                                e.target.style.borderColor = '#bae6fd';
                              }}
                            >
                              🔗 Get API Key from {service.name} →
                            </a>
                          </div>
                        </div>
                      );
                    }) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#64748b',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '2px dashed #e2e8f0'
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                          {category === 'text' ? '📝' : 
                           category === 'video' ? '🎥' : 
                           '🎵'}
                        </div>
                        <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                          No {category} services loaded
                        </div>
                        <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                          Services will appear here once the API is connected
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
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
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}