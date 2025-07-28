import { useState, useEffect } from 'react';

export default function AiCreativeGenerator({ userId = 'demo_user' }) {
  const [activeTab, setActiveTab] = useState('text');
  const [userKeys, setUserKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generationHistory, setGenerationHistory] = useState([]);
  const [usageStats, setUsageStats] = useState(null);
  
  // Generation form state
  const [selectedService, setSelectedService] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generationOptions, setGenerationOptions] = useState({});
  const [generationResult, setGenerationResult] = useState(null);

  useEffect(() => {
    loadUserKeys();
    loadGenerationHistory();
    loadUsageStats();
  }, []);

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

  const getActiveServicesByCategory = () => {
    const activeKeys = userKeys.filter(key => key.status === 'active');
    const servicesByCategory = {
      text: [],
      video: [],
      audio: []
    };
    
    activeKeys.forEach(key => {
      if (servicesByCategory[key.category]) {
        servicesByCategory[key.category].push(key);
      }
    });
    
    return servicesByCategory;
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

      {/* Active AI Services */}
      {(() => {
        const activeServices = getActiveServicesByCategory();
        const currentServices = activeServices[activeTab] || [];
        
        if (currentServices.length === 0) {
          return (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '2px dashed #e5e7eb',
              marginBottom: '32px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', color: '#374151' }}>
                No {activeTab} services connected
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>
                Connect AI services in the API Connections tab to start generating content
              </p>
              <button
                onClick={() => {
                  alert('Please go to API Connections tab → AI Creative Services to add your AI service API keys');
                }}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Connect AI Services
              </button>
            </div>
          );
        }

        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {currentServices.map(service => (
              <div
                key={service.service}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#f0fdf4'
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>
                    {service.service_name}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, lineHeight: '1.4' }}>
                    Last used: {service.last_used ? new Date(service.last_used).toLocaleDateString() : 'Never'}
                  </p>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '12px',
                  fontSize: '12px',
                  color: '#059669'
                }}>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: '#10b981',
                    marginRight: '6px'
                  }} />
                  Connected • {service.usage_count || 0} generations
                </div>

                <button
                  onClick={() => setSelectedService(service.service)}
                  style={{
                    backgroundColor: selectedService === service.service ? '#059669' : '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  {selectedService === service.service ? '✓ Selected for Generation' : `Use ${service.service_name}`}
                </button>
              </div>
            ))}
          </div>
        );
      })()}

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
            Generate with {userKeys.find(k => k.service === selectedService)?.service_name || selectedService}
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