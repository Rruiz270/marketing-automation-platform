import { useState, useEffect } from 'react';

export default function ApiConnectionManager({ userId = 'demo_user' }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    loadConnections();
    loadSyncStatus();
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

  const connectPlatform = async (platform) => {
    try {
      setLoading(true);
      
      // Get authorization URL
      const response = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_auth_url',
          platform: platform,
          user_id: userId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Open authorization URL in popup
        const popup = window.open(
          data.auth_url,
          'oauth',
          'width=600,height=600,scrollbars=yes,resizable=yes'
        );
        
        // Listen for popup close (in real implementation, you'd handle the OAuth callback)
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            // In a real implementation, the OAuth callback would handle token exchange
            alert(`${platform} connection initiated. Please complete the authorization process.`);
            loadConnections();
          }
        }, 1000);
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

  const availablePlatforms = [
    { id: 'google_ads', name: 'Google Ads', icon: '🔍', color: '#4285f4' },
    { id: 'facebook_ads', name: 'Facebook Ads', icon: '📘', color: '#1877f2' },
    { id: 'linkedin_ads', name: 'LinkedIn Ads', icon: '💼', color: '#0077b5' },
    { id: 'twitter_ads', name: 'Twitter Ads', icon: '🐦', color: '#1da1f2' },
    { id: 'tiktok_ads', name: 'TikTok Ads', icon: '🎵', color: '#000000' }
  ];

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
                    onClick={() => connectPlatform(platform.id)}
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
    </div>
  );
}