import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AIConnectionHub = ({ onUpdate }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testingService, setTestingService] = useState(null);

  const aiServices = [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT-4, DALL-E, and advanced language models',
      icon: '🤖',
      color: 'from-green-400 to-green-600',
      features: ['Text Generation', 'Image Creation', 'Code Writing', 'Analysis'],
      placeholder: 'sk-proj-...'
    },
    {
      id: 'claude',
      name: 'Claude AI',
      description: 'Anthropic\'s advanced AI assistant',
      icon: '🧠',
      color: 'from-purple-400 to-purple-600',
      features: ['Long Context', 'Research', 'Analysis', 'Writing'],
      placeholder: 'claude-...'
    },
    {
      id: 'jasper',
      name: 'Jasper AI',
      description: 'Marketing content generation specialist',
      icon: '✍️',
      color: 'from-blue-400 to-blue-600',
      features: ['Marketing Copy', 'Blog Posts', 'Social Media', 'Ads'],
      placeholder: 'jasper-...'
    },
    {
      id: 'midjourney',
      name: 'Midjourney',
      description: 'AI-powered image generation',
      icon: '🎨',
      color: 'from-pink-400 to-pink-600',
      features: ['Art Generation', 'Concept Art', 'Marketing Visuals', 'Branding'],
      placeholder: 'mj-...'
    }
  ];

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const response = await fetch('/api/ai-keys-simple');
      const data = await response.json();
      if (data.success) {
        setConnections(data.keys || []);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const handleConnect = async (serviceId, apiKey) => {
    if (!apiKey.trim()) return;
    
    setLoading(true);
    setTestingService(serviceId);
    
    try {
      const response = await fetch('/api/ai-keys-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: serviceId,
          api_key: apiKey,
          user_id: 'default_user'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadConnections();
        onUpdate();
        // Clear the input
        document.getElementById(`${serviceId}-key`).value = '';
      }
    } catch (error) {
      console.error('Error connecting service:', error);
    } finally {
      setLoading(false);
      setTestingService(null);
    }
  };

  const handleDisconnect = async (serviceId) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/ai-keys-simple', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: serviceId,
          user_id: 'default_user'
        })
      });
      
      if (response.ok) {
        await loadConnections();
        onUpdate();
      }
    } catch (error) {
      console.error('Error disconnecting service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (serviceId) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/ai-keys-simple', {
        method: 'PUT',  
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: serviceId,
          user_id: 'default_user',
          set_default: true
        })
      });
      
      if (response.ok) {
        await loadConnections();
        onUpdate();
      }
    } catch (error) {
      console.error('Error setting default:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConnectionStatus = (serviceId) => {
    return connections.find(conn => conn.service === serviceId);
  };

  const isConnected = (serviceId) => {
    const conn = getConnectionStatus(serviceId);
    return conn && conn.status === 'active';
  };

  const isDefault = (serviceId) => {
    const conn = getConnectionStatus(serviceId);
    return conn && conn.is_default;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI Connection Hub
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Connect your favorite AI services to power your marketing automation. 
          Multiple connections allow for better redundancy and specialized tasks.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Connected Services</p>
              <p className="text-3xl font-bold">{connections.filter(c => c.status === 'active').length}</p>
            </div>
            <div className="text-4xl opacity-80">🔗</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Available Services</p>
              <p className="text-3xl font-bold">{aiServices.length}</p>
            </div>
            <div className="text-4xl opacity-80">🤖</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Default Service</p>
              <p className="text-lg font-semibold">
                {connections.find(c => c.is_default)?.service || 'None'}
              </p>
            </div>
            <div className="text-4xl opacity-80">⭐</div>
          </div>
        </div>
      </div>

      {/* AI Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {aiServices.map((service) => {
          const connected = isConnected(service.id);
          const isDefaultService = isDefault(service.id);
          const testing = testingService === service.id;
          
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${service.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{service.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold">{service.name}</h3>
                      <p className="text-sm opacity-90">{service.description}</p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex flex-col items-end space-y-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      connected 
                        ? 'bg-green-500 bg-opacity-20 text-green-100' 
                        : 'bg-white bg-opacity-20 text-white'
                    }`}>
                      {connected ? '✓ Connected' : 'Not Connected'}
                    </div>
                    
                    {isDefaultService && (
                      <div className="px-3 py-1 bg-yellow-500 bg-opacity-20 text-yellow-100 rounded-full text-xs font-medium">
                        ⭐ Default
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature) => (
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <input
                        id={`${service.id}-key`}
                        type="password"
                        placeholder={service.placeholder}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleConnect(service.id, e.target.value);
                          }
                        }}
                      />
                    </div>
                    
                    <button
                      onClick={() => {
                        const key = document.getElementById(`${service.id}-key`).value;
                        handleConnect(service.id, key);
                      }}
                      disabled={loading || testing}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        testing 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      } disabled:opacity-50`}
                    >
                      {testing ? 'Testing Connection...' : 'Connect Service'}
                    </button>
                  </div>
                ) : (
                  /* Connected State */
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-green-700 font-medium">
                        Service connected and ready
                      </span>
                    </div>
                    
                    <div className="flex space-x-3">
                      {!isDefaultService && (
                        <button
                          onClick={() => handleSetDefault(service.id)}
                          disabled={loading}
                          className="flex-1 py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 font-medium"
                        >
                          Set as Default
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDisconnect(service.id)}
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

      {/* Help Section */}
      <div className="mt-12 bg-gray-50 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help Getting API Keys?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">OpenAI</h4>
            <p className="text-sm text-gray-600 mb-2">
              Visit platform.openai.com → API Keys → Create new secret key
            </p>
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              Get OpenAI API Key →
            </a>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Claude AI</h4>
            <p className="text-sm text-gray-600 mb-2">
              Visit console.anthropic.com → API Keys → Create Key
            </p>
            <a 
              href="https://console.anthropic.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              Get Claude API Key →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConnectionHub;