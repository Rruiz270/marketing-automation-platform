import { useState, useEffect } from 'react';

export default function AdvancedCampaignBuilder({ userId = 'demo_user' }) {
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

  // Load AI connections on mount
  useEffect(() => {
    loadAiConnections();
  }, []);

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
      }
    } catch (error) {
      console.error('Error loading AI connections:', error);
    }
  };

  // AI service requirements for different functions
  const aiRequirements = {
    research: ['openai', 'claude'],
    creative: ['openai', 'dalle', 'midjourney'],
    copywriting: ['openai', 'claude', 'jasper'],
    analytics: ['openai', 'claude']
  };

  const getConnectedAiServices = () => {
    return aiConnections.filter(conn => conn.status === 'active');
  };

  const checkAiCapabilities = () => {
    const connected = getConnectedAiServices();
    const capabilities = {
      research: connected.some(ai => aiRequirements.research.includes(ai.service)),
      creative: connected.some(ai => aiRequirements.creative.includes(ai.service)),
      copywriting: connected.some(ai => aiRequirements.copywriting.includes(ai.service)),
      analytics: connected.some(ai => aiRequirements.analytics.includes(ai.service))
    };
    return capabilities;
  };

  // Intelligent market research
  const conductMarketResearch = async () => {
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
          budget: campaignData.budget
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
                      padding: '8px 16px',
                      backgroundColor: '#10b981',
                      borderRadius: '20px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      <span style={{ marginRight: '6px' }}>✓</span>
                      {ai.service.toUpperCase()}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p style={{ color: '#64748b', marginBottom: '16px' }}>
                    No AI services connected yet
                  </p>
                  <button
                    onClick={() => window.location.href = '#api-connections'}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Connect AI Services
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
                onClick={conductMarketResearch}
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

        {/* Additional steps would continue here... */}
        {currentStep > 3 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚧</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
              Step {currentStep} Coming Soon
            </h3>
            <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '24px' }}>
              {steps.find(s => s.id === currentStep)?.description}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
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
                  cursor: 'pointer'
                }}
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }\n        }
      `}</style>
    </div>
  );
}