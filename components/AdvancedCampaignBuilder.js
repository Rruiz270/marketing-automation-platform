import { useState, useEffect } from 'react';
import AiServiceSelector from './AiServiceSelector';

export default function AdvancedCampaignBuilder({ userId = 'demo_user', globalApiKeys = [], onApiKeysUpdated }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    objective: '',
    audience: '',
    budget: '',
    duration: '',
    platforms: [],
    keywords: '',
    competitors: '',
    tone: '',
    creativePreferences: []
  });
  
  const [aiConnections, setAiConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [researchData, setResearchData] = useState(null);
  const [campaignRecommendations, setCampaignRecommendations] = useState([]);
  const [competitorInsights, setCompetitorInsights] = useState(null);
  const [showAiSelector, setShowAiSelector] = useState(false);
  const [aiSelectorTask, setAiSelectorTask] = useState(null);

  // Campaign building steps
  const steps = [
    { 
      id: 1, 
      title: 'AI Setup', 
      subtitle: 'Connect your AI services',
      icon: '🤖',
      description: 'Ensure AI services are connected for intelligent campaign creation'
    },
    { 
      id: 2, 
      title: 'Campaign Goal', 
      subtitle: 'Define your objective',
      icon: '🎯',
      description: 'Set clear, measurable goals for your campaign'
    },
    { 
      id: 3, 
      title: 'Market Research', 
      subtitle: 'AI-powered insights',
      icon: '🔍',
      description: 'Let AI analyze market conditions and competitors'
    },
    { 
      id: 4, 
      title: 'Audience & Budget', 
      subtitle: 'Target and allocate',
      icon: '👥',
      description: 'Define your audience and set optimal budget allocation'
    },
    { 
      id: 5, 
      title: 'Creative Strategy', 
      subtitle: 'AI-generated content',
      icon: '🎨',
      description: 'Generate high-performing creatives with AI'
    },
    { 
      id: 6, 
      title: 'Launch & Monitor', 
      subtitle: 'Deploy and optimize',
      icon: '🚀',
      description: 'Launch campaign with real-time monitoring'
    }
  ];

  // Use global API keys if available, otherwise load them
  useEffect(() => {
    if (globalApiKeys && globalApiKeys.length > 0) {
      setAiConnections(globalApiKeys);
    } else {
      loadAiConnections();
    }
  }, [globalApiKeys]);

  // Refresh connections when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && onApiKeysUpdated) {
        onApiKeysUpdated();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', () => {
      if (onApiKeysUpdated) {
        onApiKeysUpdated();
      }
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', () => {
        if (onApiKeysUpdated) {
          onApiKeysUpdated();
        }
      });
    };
  }, [onApiKeysUpdated]);

  const loadAiConnections = async () => {
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
        setAiConnections(data.data);
        // Notify parent component about the update
        if (onApiKeysUpdated) {
          onApiKeysUpdated();
        }
      }
    } catch (error) {
      console.error('Error loading AI connections:', error);
    }
  };

  // AI service requirements for different functions (updated mapping)
  const aiRequirements = {
    research: ['openai', 'claude', 'jasper'],
    creative: ['openai', 'dalle', 'midjourney', 'claude'],
    copywriting: ['openai', 'claude', 'jasper', 'copyai', 'writesonic'],
    analytics: ['openai', 'claude', 'jasper']
  };

  const getConnectedAiServices = () => {
    return aiConnections.filter(conn => conn.status === 'active' && conn.enabled !== false);
  };

  const getDefaultAiService = () => {
    return aiConnections.find(conn => conn.status === 'active' && conn.enabled !== false && conn.is_default);
  };

  const getActiveAiServices = () => {
    return aiConnections.filter(conn => conn.status === 'active' && conn.enabled !== false);
  };

  const checkAiCapabilities = () => {
    const connected = getConnectedAiServices();
    console.log('Connected AI services:', connected);
    console.log('AI connections raw data:', aiConnections);
    
    const capabilities = {
      research: connected.some(ai => {
        console.log(`Checking research: ${ai.service} in`, aiRequirements.research);
        return aiRequirements.research.includes(ai.service);
      }),
      creative: connected.some(ai => {
        console.log(`Checking creative: ${ai.service} in`, aiRequirements.creative);
        return aiRequirements.creative.includes(ai.service);
      }),
      copywriting: connected.some(ai => {
        console.log(`Checking copywriting: ${ai.service} in`, aiRequirements.copywriting);
        return aiRequirements.copywriting.includes(ai.service);
      }),
      analytics: connected.some(ai => {
        console.log(`Checking analytics: ${ai.service} in`, aiRequirements.analytics);
        return aiRequirements.analytics.includes(ai.service);
      })
    };
    
    console.log('Final capabilities:', capabilities);
    return capabilities;
  };

  // Show AI selector and then conduct market research
  const initiateConductMarketResearch = () => {
    const activeServices = getActiveAiServices();
    const defaultService = getDefaultAiService();
    
    if (activeServices.length === 0) {
      alert('Please connect at least one AI service to conduct market research.');
      return;
    }
    
    if (activeServices.length === 1) {
      // Only one service available, use it directly
      conductMarketResearch(activeServices[0]);
    } else {
      // Multiple services available, show selector
      setAiSelectorTask({
        description: "Market Research Analysis",
        callback: conductMarketResearch
      });
      setShowAiSelector(true);
    }
  };

  // Intelligent market research with selected AI service
  const conductMarketResearch = async (selectedAiService) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/market-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective: campaignData.objective,
          industry: 'English Education',
          company: 'Alumni English School',
          competitors: campaignData.competitors,
          budget: campaignData.budget,
          ai_service: selectedAiService.service,
          ai_service_name: selectedAiService.service_name
        })
      });

      const data = await response.json();
      if (data.success) {
        setResearchData(data.insights);
        setCampaignRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Market research error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Smart campaign optimization suggestions
  const generateOptimizationSuggestions = (performanceData) => {
    // This would analyze campaign performance and suggest improvements
    const suggestions = [];
    
    if (performanceData?.ctr < 0.02) {
      suggestions.push({
        type: 'creative',
        priority: 'high',
        title: 'Low Click-Through Rate Detected',
        description: 'Run competitor analysis and refresh creatives',
        action: 'analyze_competitors'
      });
    }

    if (performanceData?.cpa > 60) {
      suggestions.push({
        type: 'targeting',
        priority: 'high',
        title: 'High Cost Per Acquisition',
        description: 'Optimize audience targeting and bidding strategy',
        action: 'optimize_targeting'
      });
    }

    return suggestions;
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateCampaignData = (field, value) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '20px', 
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    }}>
      {/* Header with Progress */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '32px',
        color: 'white'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            margin: '0 0 8px 0',
            lineHeight: '1.2'
          }}>
            🚀 Advanced Campaign Builder
          </h1>
          <p style={{ 
            fontSize: '16px', 
            margin: 0,
            opacity: '0.9'
          }}>
            AI-powered campaign creation with step-by-step guidance
          </p>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {steps.map((step, index) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: currentStep >= step.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  border: currentStep >= step.id ? '2px solid white' : '2px solid rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  marginBottom: '8px',
                  backdropFilter: 'blur(10px)'
                }}>
                  {currentStep > step.id ? '✓' : step.icon}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '600',
                    opacity: currentStep >= step.id ? 1 : 0.7
                  }}>
                    {step.title}
                  </div>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: currentStep > step.id ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
                  margin: '0 12px',
                  alignSelf: 'flex-start',
                  marginTop: '24px'
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '40px' }}>
        {/* Step 1: AI Setup */}
        {currentStep === 1 && (
          <div>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>
                AI Services Status
              </h2>
              <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
                Connected AI services power intelligent campaign creation
              </p>
            </div>

            {/* AI Capabilities Dashboard */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px',
              marginBottom: '32px'
            }}>
              {Object.entries(checkAiCapabilities()).map(([capability, available]) => (
                <div key={capability} style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: `2px solid ${available ? '#10b981' : '#f59e0b'}`,
                  backgroundColor: available ? '#f0fdf4' : '#fef3c7'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '12px' 
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: available ? '#10b981' : '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      color: 'white',
                      fontSize: '16px'
                    }}>
                      {available ? '✓' : '!'}
                    </div>
                    <div>
                      <h3 style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        margin: 0,
                        color: available ? '#065f46' : '#92400e',
                        textTransform: 'capitalize'
                      }}>
                        {capability} AI
                      </h3>
                    </div>
                  </div>
                  <p style={{ 
                    fontSize: '14px', 
                    color: available ? '#047857' : '#d97706', 
                    margin: 0 
                  }}>
                    {available ? 
                      `✅ Ready for ${capability} tasks` : 
                      `⚠️ Connect AI service for ${capability}`
                    }
                  </p>
                </div>
              ))}
            </div>

            {/* Connected AI Services */}
            <div style={{ 
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                Connected AI Services ({getConnectedAiServices().length})
              </h3>
              
              {getConnectedAiServices().length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {getConnectedAiServices().map(ai => (
                    <div key={ai.service} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 16px',
                      backgroundColor: ai.enabled !== false ? '#10b981' : '#d1d5db',
                      borderRadius: '20px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      position: 'relative',
                      border: ai.is_default ? '2px solid #fbbf24' : 'none'
                    }}>
                      <span style={{ marginRight: '8px' }}>
                        {ai.is_default ? '🌟' : (ai.enabled !== false ? '✓' : '⏸️')}
                      </span>
                      {ai.service_name || ai.service.toUpperCase()}
                      {ai.is_default && (
                        <span style={{ 
                          fontSize: '10px', 
                          marginLeft: '6px',
                          opacity: '0.9',
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          padding: '2px 6px',
                          borderRadius: '8px'
                        }}>
                          DEFAULT
                        </span>
                      )}
                      {ai.enabled === false && (
                        <span style={{ 
                          fontSize: '10px', 
                          marginLeft: '4px',
                          opacity: '0.8'
                        }}>
                          (Disabled)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                  <p style={{ color: '#64748b', marginBottom: '16px', fontSize: '16px' }}>
                    No AI services connected yet
                  </p>
                  <p style={{ color: '#9ca3af', marginBottom: '20px', fontSize: '14px' }}>
                    Connect AI services like OpenAI, Claude, or Jasper to power your campaigns
                  </p>
                  <button
                    onClick={() => {
                      // Trigger parent component navigation to API connections
                      if (onApiKeysUpdated) {
                        onApiKeysUpdated();
                      }
                      // Try to navigate to API connections section
                      const event = new CustomEvent('navigate-to-api', { detail: 'api-connections' });
                      window.dispatchEvent(event);
                    }}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    🔗 Connect AI Services
                  </button>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={nextStep}
                disabled={getConnectedAiServices().length === 0}
                style={{
                  backgroundColor: getConnectedAiServices().length > 0 ? '#10b981' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: getConnectedAiServices().length > 0 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Continue to Campaign Goal</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Campaign Goal */}
        {currentStep === 2 && (
          <div>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>
                Define Your Campaign Goal
              </h2>
              <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
                Set a clear, measurable objective for AI-powered optimization
              </p>
            </div>

            {/* Campaign Objectives */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px',
              marginBottom: '32px'
            }}>
              {[
                {
                  id: 'enrollment',
                  title: '🎓 Student Enrollment',
                  description: 'Drive new student registrations and course sign-ups',
                  kpis: ['Cost per enrollment', 'Conversion rate', 'Student lifetime value'],
                  aiOptimization: 'Optimizes for highest-value students with best retention potential'
                },
                {
                  id: 'awareness',
                  title: '📢 Brand Awareness',
                  description: 'Increase recognition of Alumni English School brand',
                  kpis: ['Reach', 'Brand mention lift', 'Search volume increase'],
                  aiOptimization: 'Maximizes qualified reach and brand recall among target audience'
                },
                {
                  id: 'corporate',
                  title: '💼 Corporate Partnerships',
                  description: 'Attract B2B corporate English training clients',
                  kpis: ['Lead quality score', 'Enterprise deal size', 'Sales cycle length'],
                  aiOptimization: 'Targets decision-makers with personalized messaging'
                }
              ].map(objective => (
                <div
                  key={objective.id}
                  onClick={() => updateCampaignData('objective', objective.id)}
                  style={{
                    border: campaignData.objective === objective.id ? '3px solid #3b82f6' : '2px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: campaignData.objective === objective.id ? '#eff6ff' : 'white'
                  }}
                >
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    marginBottom: '12px',
                    color: '#1e293b'
                  }}>
                    {objective.title}
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#64748b', 
                    marginBottom: '16px',
                    lineHeight: '1.5'
                  }}>
                    {objective.description}
                  </p>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      KEY METRICS:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {objective.kpis.map(kpi => (
                        <span key={kpi} style={{
                          fontSize: '11px',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontWeight: '500'
                        }}>
                          {kpi}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#0369a1', marginBottom: '4px' }}>
                      🤖 AI OPTIMIZATION:
                    </div>
                    <div style={{ fontSize: '12px', color: '#0c4a6e', lineHeight: '1.4' }}>
                      {objective.aiOptimization}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={prevStep}
                style={{
                  backgroundColor: 'white',
                  color: '#64748b',
                  border: '2px solid #e2e8f0',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>←</span>
                <span>Back</span>
              </button>
              
              <button
                onClick={nextStep}
                disabled={!campaignData.objective}
                style={{
                  backgroundColor: campaignData.objective ? '#10b981' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: campaignData.objective ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Start Market Research</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Market Research */}
        {currentStep === 3 && (
          <div>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>
                AI Market Research
              </h2>
              <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
                Let AI analyze market conditions, competitors, and opportunities
              </p>
            </div>

            {/* Research Form */}
            <div style={{ 
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Research Parameters
              </h3>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Budget Range
                  </label>
                  <select
                    value={campaignData.budget}
                    onChange={(e) => updateCampaignData('budget', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select budget range</option>
                    <option value="5000-10000">R$ 5,000 - R$ 10,000/month</option>
                    <option value="10000-25000">R$ 10,000 - R$ 25,000/month</option>
                    <option value="25000-50000">R$ 25,000 - R$ 50,000/month</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Known Competitors (optional)
                  </label>
                  <input
                    type="text"
                    value={campaignData.competitors}
                    onChange={(e) => updateCampaignData('competitors', e.target.value)}
                    placeholder="e.g., Wizard, CCAA, CNA, Cultura Inglesa"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <button
                onClick={initiateConductMarketResearch}
                disabled={loading || !campaignData.budget}
                style={{
                  backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
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
                    <span>Analyzing Market...</span>
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    <span>Start AI Research</span>
                  </>
                )}
              </button>
            </div>

            {/* Research Results */}
            {researchData && (
              <div style={{
                border: '2px solid #10b981',
                borderRadius: '16px',
                padding: '24px',
                backgroundColor: '#f0fdf4',
                marginBottom: '32px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#065f46' }}>
                  ✅ Market Research Complete
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#047857' }}>
                      MARKET INSIGHTS
                    </h4>
                    <ul style={{ fontSize: '14px', color: '#065f46', paddingLeft: '16px' }}>
                      <li>English education market growing 12% annually in São Paulo</li>
                      <li>Corporate training segment shows highest ROI potential</li>
                      <li>Online + in-person hybrid model gaining 67% preference</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#047857' }}>
                      COMPETITIVE LANDSCAPE
                    </h4>
                    <ul style={{ fontSize: '14px', color: '#065f46', paddingLeft: '16px' }}>
                      <li>Alumni's 60-year heritage is unique differentiator</li>
                      <li>Competitors focus on price, Alumni should emphasize quality</li>
                      <li>Opportunity in premium corporate segment underserved</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={prevStep}
                style={{
                  backgroundColor: 'white',
                  color: '#64748b',
                  border: '2px solid #e2e8f0',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>←</span>
                <span>Back</span>
              </button>
              
              <button
                onClick={nextStep}
                disabled={!researchData}
                style={{
                  backgroundColor: researchData ? '#10b981' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: researchData ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Configure Audience & Budget</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Audience & Budget */}
        {currentStep === 4 && (
          <div>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>
                Audience & Budget Configuration
              </h2>
              <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
                Define your target audience and allocate budget based on AI insights
              </p>
            </div>

            {/* Audience Configuration */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1e293b' }}>
                🎯 Target Audience
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {[
                  {
                    id: 'professionals',
                    title: '👨‍💼 Working Professionals',
                    description: 'Career-focused individuals seeking English skills',
                    demographics: 'Ages 25-45, Mid to senior-level',
                    size: '~85K in São Paulo',
                    cpa: 'R$ 42'
                  },
                  {
                    id: 'corporate',
                    title: '🏢 Corporate Decision Makers',
                    description: 'HR managers and executives planning team training',
                    demographics: 'Ages 30-55, Management level',
                    size: '~12K in São Paulo',
                    cpa: 'R$ 95'
                  },
                  {
                    id: 'entrepreneurs',
                    title: '🚀 Entrepreneurs & Business Owners',
                    description: 'Business leaders expanding internationally',
                    demographics: 'Ages 28-50, High income',
                    size: '~8K in São Paulo',
                    cpa: 'R$ 68'
                  }
                ].map(audience => (
                  <div
                    key={audience.id}
                    onClick={() => updateCampaignData('audience', audience.id)}
                    style={{
                      border: campaignData.audience === audience.id ? '3px solid #10b981' : '2px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '24px',
                      cursor: 'pointer',
                      backgroundColor: campaignData.audience === audience.id ? '#f0fdf4' : 'white',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>
                      {audience.title}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                      {audience.description}
                    </p>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      <div>👥 {audience.demographics}</div>
                      <div>📊 {audience.size}</div>
                      <div>💰 Target CPA: {audience.cpa}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Allocation */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1e293b' }}>
                💰 Smart Budget Allocation
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                {[
                  { platform: 'LinkedIn Ads', percentage: 45, amount: 'R$ 11,250', reason: 'B2B professional targeting' },
                  { platform: 'Google Ads', percentage: 35, amount: 'R$ 8,750', reason: 'High-intent search traffic' },
                  { platform: 'Facebook/Instagram', percentage: 20, amount: 'R$ 5,000', reason: 'Brand awareness & retargeting' }
                ].map((allocation, index) => (
                  <div key={index} style={{
                    padding: '20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>
                      {allocation.platform}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
                      {allocation.percentage}%
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                      {allocation.amount} / month
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {allocation.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={prevStep} style={{
                backgroundColor: 'white', color: '#64748b', border: '2px solid #e2e8f0',
                padding: '16px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer'
              }}>
                ← Back
              </button>
              <button
                onClick={nextStep}
                disabled={!campaignData.audience}
                style={{
                  backgroundColor: campaignData.audience ? '#10b981' : '#9ca3af', color: 'white', border: 'none',
                  padding: '16px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: '600',
                  cursor: campaignData.audience ? 'pointer' : 'not-allowed'
                }}
              >
                Generate Creatives →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Creative Strategy */}
        {currentStep === 5 && (
          <div>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>
                AI Creative Strategy
              </h2>
              <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
                Generate high-performing ad creatives with AI-powered insights
              </p>
            </div>

            {/* Creative Generation */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                {[
                  {
                    type: 'Heritage Video',
                    description: 'Showcase Alumni\'s 60-year legacy and government recognition',
                    platforms: ['LinkedIn', 'Facebook'],
                    performance: '+45% CTR vs standard ads'
                  },
                  {
                    type: 'Professional Testimonials',
                    description: 'Success stories from Alumni corporate graduates',
                    platforms: ['LinkedIn', 'Google Display'],
                    performance: '+67% conversion rate'
                  },
                  {
                    type: 'Flexible Learning Demo',
                    description: 'Interactive showcase of online + in-person options',
                    platforms: ['Facebook', 'Instagram', 'YouTube'],
                    performance: '+34% engagement rate'
                  }
                ].map((creative, index) => (
                  <div key={index} style={{
                    padding: '24px', backgroundColor: 'white', borderRadius: '16px',
                    border: '2px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: '#1e293b' }}>
                      🎬 {creative.type}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                      {creative.description}
                    </p>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        PLATFORMS:
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {creative.platforms.map(platform => (
                          <span key={platform} style={{
                            fontSize: '11px', backgroundColor: '#eff6ff', color: '#1d4ed8',
                            padding: '4px 8px', borderRadius: '12px', fontWeight: '500'
                          }}>
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{
                      padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#065f46' }}>
                        📈 EXPECTED PERFORMANCE:
                      </div>
                      <div style={{ fontSize: '12px', color: '#047857' }}>
                        {creative.performance}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={prevStep} style={{
                backgroundColor: 'white', color: '#64748b', border: '2px solid #e2e8f0',
                padding: '16px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer'
              }}>
                ← Back
              </button>
              <button onClick={nextStep} style={{
                backgroundColor: '#10b981', color: 'white', border: 'none',
                padding: '16px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer'
              }}>
                Launch Campaign →
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Launch & Monitor */}
        {currentStep === 6 && (
          <div>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>
                Launch & Monitor Campaign
              </h2>
              <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
                Deploy your AI-optimized campaign with real-time monitoring
              </p>
            </div>

            {/* Campaign Summary */}
            <div style={{ marginBottom: '32px', padding: '24px', backgroundColor: '#f0fdf4', borderRadius: '16px', border: '2px solid #bbf7d0' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#065f46' }}>
                ✅ Campaign Ready for Launch
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#047857', fontWeight: '600' }}>OBJECTIVE</div>
                  <div style={{ fontSize: '16px', color: '#065f46' }}>
                    {campaignData.objective === 'enrollment' ? '🎓 Student Enrollment' :
                     campaignData.objective === 'awareness' ? '📢 Brand Awareness' : 
                     '💼 Corporate Partnerships'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#047857', fontWeight: '600' }}>TARGET AUDIENCE</div>
                  <div style={{ fontSize: '16px', color: '#065f46' }}>
                    {campaignData.audience === 'professionals' ? '👨‍💼 Working Professionals' :
                     campaignData.audience === 'corporate' ? '🏢 Corporate Decision Makers' :
                     '🚀 Entrepreneurs'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#047857', fontWeight: '600' }}>BUDGET</div>
                  <div style={{ fontSize: '16px', color: '#065f46' }}>{campaignData.budget || 'Not set'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#047857', fontWeight: '600' }}>AI SERVICES</div>
                  <div style={{ fontSize: '16px', color: '#065f46' }}>{getConnectedAiServices().length} Connected</div>
                </div>
              </div>
            </div>

            {/* Launch Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <button style={{
                padding: '24px', backgroundColor: '#10b981', color: 'white', border: 'none',
                borderRadius: '16px', fontSize: '18px', fontWeight: '700', cursor: 'pointer',
                textAlign: 'left', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚀</div>
                <div>Launch Campaign Now</div>
                <div style={{ fontSize: '14px', opacity: '0.9', fontWeight: '400' }}>
                  Deploy across all selected platforms
                </div>
              </button>
              
              <button style={{
                padding: '24px', backgroundColor: '#3b82f6', color: 'white', border: 'none',
                borderRadius: '16px', fontSize: '18px', fontWeight: '700', cursor: 'pointer',
                textAlign: 'left', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                <div>Preview & Test</div>
                <div style={{ fontSize: '14px', opacity: '0.9', fontWeight: '400' }}>
                  Run A/B tests before full launch
                </div>
              </button>
              
              <button style={{
                padding: '24px', backgroundColor: '#8b5cf6', color: 'white', border: 'none',
                borderRadius: '16px', fontSize: '18px', fontWeight: '700', cursor: 'pointer',
                textAlign: 'left', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
                <div>Auto-Optimization</div>
                <div style={{ fontSize: '14px', opacity: '0.9', fontWeight: '400' }}>
                  Enable AI-powered optimization
                </div>
              </button>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={prevStep} style={{
                backgroundColor: 'white', color: '#64748b', border: '2px solid #e2e8f0',
                padding: '16px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer'
              }}>
                ← Back
              </button>
              <button
                onClick={() => {
                  alert('🎉 Campaign launched successfully! Monitor performance in the Performance Monitor section.');
                  // Navigate back to dashboard or performance monitor
                  const event = new CustomEvent('navigate-to-api', { detail: 'performance-monitor' });
                  window.dispatchEvent(event);
                }}
                style={{
                  backgroundColor: '#10b981', color: 'white', border: 'none',
                  padding: '16px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                🎉 Complete Campaign
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Service Selector Modal */}
      <AiServiceSelector
        isOpen={showAiSelector}
        onClose={() => setShowAiSelector(false)}
        onSelect={(service) => {
          if (aiSelectorTask) {
            aiSelectorTask.callback(service);
          }
          setShowAiSelector(false);
          setAiSelectorTask(null);
        }}
        availableServices={getActiveAiServices()}
        defaultService={getDefaultAiService()}
        taskDescription={aiSelectorTask?.description || "AI task"}
        allowSkip={true}
      />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }\n        }
      `}</style>
    </div>
  );
}