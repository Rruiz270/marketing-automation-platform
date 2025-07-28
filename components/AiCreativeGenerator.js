import { useState, useEffect } from 'react';

export default function AiCreativeGenerator({ userId = 'demo_user' }) {
  const [activeTab, setActiveTab] = useState('text');
  const [services, setServices] = useState({});
  const [userKeys, setUserKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showApiKeyForm, setShowApiKeyForm] = useState(null);
  const [apiKeyData, setApiKeyData] = useState({});
  const [generationHistory, setGenerationHistory] = useState([]);
  const [usageStats, setUsageStats] = useState(null);
  
  // Generation form state
  const [selectedService, setSelectedService] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generationOptions, setGenerationOptions] = useState({});
  const [generationResult, setGenerationResult] = useState(null);

  useEffect(() => {
    loadAiServices();
    loadUserKeys();
    loadGenerationHistory();
    loadUsageStats();
  }, []);

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
        setServices(data.data);
      }
    } catch (error) {
      console.error('Error loading AI services:', error);
    }
  };

  const loadUserKeys = async () => {
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
        setUserKeys(data.data);
      }
    } catch (error) {
      console.error('Error loading user keys:', error);
    }
  };

  const loadGenerationHistory = async () => {
    try {
      const response = await fetch('/api/creative-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_generation_history',
          user_id: userId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setGenerationHistory(data.data);
      }
    } catch (error) {
      console.error('Error loading generation history:', error);
    }
  };

  const loadUsageStats = async () => {
    try {
      const response = await fetch('/api/creative-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_usage_stats',
          user_id: userId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setUsageStats(data.data);
      }
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };

  const openApiKeyForm = (serviceId) => {
    setShowApiKeyForm(serviceId);
    setApiKeyData({});
  };

  const closeApiKeyForm = () => {
    setShowApiKeyForm(null);
    setApiKeyData({});
  };

  const saveApiKey = async (serviceId) => {
    if (!apiKeyData.apiKey) {
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
          api_key: apiKeyData.apiKey
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        closeApiKeyForm();
        loadUserKeys();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      alert('Error saving API key: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testApiKey = async (serviceId) => {
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
      loadUserKeys();
    } catch (error) {
      console.error('Error testing API key:', error);
      alert('Error testing API key: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async () => {
    if (!selectedService || !prompt) {
      alert('Please select a service and enter a prompt');
      return;
    }

    try {
      setLoading(true);
      setGenerationResult(null);
      
      const response = await fetch('/api/creative-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_content',
          user_id: userId,
          service: selectedService,
          prompt: prompt,
          options: generationOptions
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setGenerationResult(data.data);
        loadGenerationHistory();
        loadUsageStats();
      } else {
        alert('Generation failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Error generating content: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isServiceConnected = (serviceId) => {
    return userKeys.some(key => key.service === serviceId && key.status === 'active');
  };

  const getServiceStatus = (serviceId) => {
    const key = userKeys.find(key => key.service === serviceId);
    return key ? key.status : 'not_configured';
  };

  const tabs = [
    { id: 'text', name: 'Text & Copy', icon: '✍️' },
    { id: 'video', name: 'Video', icon: '🎥' },
    { id: 'audio', name: 'Audio', icon: '🎵' }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>🎨 AI Creative Generator</h2>
        
        {usageStats && (
          <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', color: '#059669' }}>{usageStats.total_generations}</div>
              <div style={{ color: '#6b7280' }}>Total Generations</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', color: '#059669' }}>{usageStats.success_rate}%</div>
              <div style={{ color: '#6b7280' }}>Success Rate</div>
            </div>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* AI Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {services[activeTab]?.map(service => {
          const isConnected = isServiceConnected(service.id);
          const status = getServiceStatus(service.id);
          
          return (
            <div
              key={service.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: isConnected ? '#f0fdf4' : 'white'
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>
                  {service.name}
                </h3>
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
                    onClick={() => openApiKeyForm(service.id)}
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
                  <>
                    <button
                      onClick={() => testApiKey(service.id)}
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
                    <button
                      onClick={() => setSelectedService(service.id)}
                      style={{
                        backgroundColor: selectedService === service.id ? '#059669' : '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {selectedService === service.id ? 'Selected' : 'Select'}
                    </button>
                  </>
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

      {/* Generation Interface */}
      {selectedService && (
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '20px', 
          backgroundColor: '#f8fafc',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Generate with {services[activeTab]?.find(s => s.id === selectedService)?.name}
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Enter your ${activeTab} generation prompt...`}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Generation Options */}
          {activeTab === 'text' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                  Max Tokens
                </label>
                <input
                  type="number"
                  value={generationOptions.max_tokens || 1000}
                  onChange={(e) => setGenerationOptions({...generationOptions, max_tokens: parseInt(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                  Temperature
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={generationOptions.temperature || 0.7}
                  onChange={(e) => setGenerationOptions({...generationOptions, temperature: parseFloat(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
              </div>
            </div>
          )}

          <button
            onClick={generateContent}
            disabled={loading || !prompt}
            style={{
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading || !prompt ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Generating...' : `Generate ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
          </button>
        </div>
      )}

      {/* Generation Result */}
      {generationResult && (
        <div style={{ 
          border: '1px solid #d1d5db', 
          borderRadius: '8px', 
          padding: '20px', 
          backgroundColor: 'white',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Generated Content</h3>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {generationResult.service} • {generationResult.generation_time}ms • ~${generationResult.cost_estimate}
            </div>
          </div>
          
          {generationResult.result.type === 'text' && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '16px',
              whiteSpace: 'pre-wrap',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              {generationResult.result.content}
            </div>
          )}
          
          {generationResult.result.type === 'audio' && (
            <div>
              <audio controls style={{ width: '100%', marginBottom: '8px' }}>
                <source src={`data:audio/mpeg;base64,${generationResult.result.data}`} type="audio/mpeg" />
              </audio>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Size: {Math.round(generationResult.result.size / 1024)}KB
              </div>
            </div>
          )}
        </div>
      )}

      {/* API Key Form Modal */}
      {showApiKeyForm && (
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
              const service = Object.values(services).flat().find(s => s.id === showApiKeyForm);
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
                      value={apiKeyData.apiKey || ''}
                      onChange={(e) => setApiKeyData({...apiKeyData, apiKey: e.target.value})}
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
                      onClick={closeApiKeyForm}
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
                      onClick={() => saveApiKey(showApiKeyForm)}
                      disabled={loading || !apiKeyData.apiKey}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: loading || !apiKeyData.apiKey ? 'not-allowed' : 'pointer',
                        opacity: loading || !apiKeyData.apiKey ? 0.5 : 1
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

      {/* Recent Generations */}
      {generationHistory.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Recent Generations</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {generationHistory.slice(0, 5).map((item, index) => (
              <div key={index} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '12px',
                backgroundColor: item.status === 'success' ? '#f0fdf4' : '#fef2f2'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.service}</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.prompt}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}