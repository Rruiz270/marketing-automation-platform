import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AIConnectionHub = ({ onUpdate }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testingService, setTestingService] = useState(null);

  const aiServices = [
    // TEXT/COPY AI SERVICES
    {
      id: 'openai',
      name: 'OpenAI GPT-4',
      description: 'GPT-4, DALL-E, and advanced language models',
      icon: '🤖',
      color: 'from-green-400 to-green-600',
      features: ['Text Generation', 'Image Creation', 'Code Writing', 'Analysis'],
      placeholder: 'sk-proj-...',
      category: 'text'
    },
    {
      id: 'claude',
      name: 'Claude AI',
      description: 'Anthropic\'s advanced AI assistant',
      icon: '🧠',
      color: 'from-purple-400 to-purple-600',
      features: ['Long Context', 'Research', 'Analysis', 'Writing'],
      placeholder: 'sk-ant-...',
      category: 'text'
    },
    {
      id: 'jasper',
      name: 'Jasper AI',
      description: 'Marketing content generation specialist',
      icon: '✍️',
      color: 'from-blue-400 to-blue-600',
      features: ['Marketing Copy', 'Blog Posts', 'Social Media', 'Ads'],
      placeholder: 'jasper-...',
      category: 'text'
    },
    {
      id: 'copy.ai',
      name: 'Copy.ai',
      description: 'AI copywriter for marketing and sales',
      icon: '📝',
      color: 'from-orange-400 to-orange-600',
      features: ['Sales Copy', 'Email Marketing', 'Product Descriptions', 'Headlines'],
      placeholder: 'copy-...',
      category: 'text'
    },
    {
      id: 'writesonic',
      name: 'Writesonic',
      description: 'AI writing assistant for content marketing',
      icon: '✨',
      color: 'from-teal-400 to-teal-600',
      features: ['Blog Writing', 'Ad Copy', 'Landing Pages', 'SEO Content'],
      placeholder: 'ws-...',
      category: 'text'
    },
    // VISUAL/VIDEO AI SERVICES
    {
      id: 'dalle',
      name: 'DALL-E 3',
      description: 'Advanced AI image generation',
      icon: '🎨',
      color: 'from-pink-400 to-pink-600',
      features: ['Art Generation', 'Marketing Visuals', 'Product Images', 'Branding'],
      placeholder: 'sk-proj-...',
      category: 'visual'
    },
    {
      id: 'midjourney',
      name: 'Midjourney',
      description: 'AI-powered artistic image generation',
      icon: '🖼️',
      color: 'from-indigo-400 to-indigo-600',
      features: ['Concept Art', 'Creative Visuals', 'Brand Assets', 'Illustrations'],
      placeholder: 'mj-...',
      category: 'visual'
    },
    {
      id: 'stable-diffusion',
      name: 'Stable Diffusion',
      description: 'Open-source AI image generation',
      icon: '🌊',
      color: 'from-cyan-400 to-cyan-600',
      features: ['Custom Models', 'Fine-tuning', 'Commercial Use', 'High Resolution'],
      placeholder: 'sd-...',
      category: 'visual'
    },
    {
      id: 'runway',
      name: 'Runway ML',
      description: 'AI video generation and editing',
      icon: '🎬',
      color: 'from-red-400 to-red-600',
      features: ['Video Generation', 'Video Editing', 'Motion Graphics', 'Visual Effects'],
      placeholder: 'runway-...',
      category: 'video'
    },
    {
      id: 'synthesia',
      name: 'Synthesia',
      description: 'AI video creation with avatars',
      icon: '👤',
      color: 'from-yellow-400 to-yellow-600',
      features: ['AI Avatars', 'Video Production', 'Multilingual', 'Corporate Videos'],
      placeholder: 'synth-...',
      category: 'video'
    },
    // AUDIO AI SERVICES
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      description: 'Best-in-class voice cloning and text-to-speech',
      icon: '🎤',
      color: 'from-violet-400 to-violet-600',
      features: ['Voice Cloning', 'Text-to-Speech', 'Voice Over', 'Multilingual Audio'],
      placeholder: 'eleven-...',
      category: 'audio'
    },
    {
      id: 'murf',
      name: 'Murf AI',
      description: 'Professional AI voice generator',
      icon: '🎙️',
      color: 'from-emerald-400 to-emerald-600',
      features: ['Professional Voices', 'Studio Quality', 'Voice Editing', 'Commercial Use'],
      placeholder: 'murf-...',
      category: 'audio'
    },
    {
      id: 'speechify',
      name: 'Speechify',
      description: 'AI text-to-speech and audio content',
      icon: '🔊',
      color: 'from-lime-400 to-lime-600',
      features: ['Natural Voices', 'Speed Control', 'Audio Books', 'Accessibility'],
      placeholder: 'speech-...',
      category: 'audio'
    }
  ];

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      console.log('Loading AI connections...');
      const response = await fetch('/api/ai-keys-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_user_keys',
          user_id: 'default_user'
        })
      });
      
      if (!response.ok) {
        console.error('Failed to load connections:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      console.log('AI Keys loaded:', data);
      if (data.success) {
        setConnections(data.data || []);
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
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      console.log(`Attempting to connect ${serviceId} with API key starting with: ${apiKey.substring(0, 10)}...`);
      
      const response = await fetch('/api/ai-keys-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_api_key',
          service: serviceId,
          api_key: apiKey,
          user_id: 'default_user'
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Connect response:', data);
      
      if (data.success) {
        await loadConnections();
        onUpdate();
        // Clear the input
        document.getElementById(`${serviceId}-key`).value = '';
        // Show success message
        alert(`${data.message || 'AI service connected successfully!'}`);
      } else {
        alert(`Error: ${data.error || data.message || 'Failed to connect AI service'}`);
      }
    } catch (error) {
      console.error('Error connecting service:', error);
      if (error.name === 'AbortError') {
        alert('Connection timeout: The server took too long to respond. Please check your internet connection and try again.');
      } else {
        alert(`Connection failed: ${error.message || 'Unknown error occurred'}`);
      }
    } finally {
      setLoading(false);
      setTestingService(null);
    }
  };

  const handleDisconnect = async (serviceId) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/ai-keys-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disconnect_api_key',
          service: serviceId,
          user_id: 'default_user'
        })
      });
      
      const data = await response.json();
      if (data.success) {
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
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_default_service',
          service: serviceId,
          user_id: 'default_user'
        })
      });
      
      const data = await response.json();
      if (data.success) {
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