import { useState, useEffect } from 'react';
import RealTimeOptimization from './RealTimeOptimization';
import AiCampaignGenerator from './AiCampaignGenerator';
import AutonomousAiDashboard from './AutonomousAiDashboard';
import ApiConnectionManager from './ApiConnectionManager';

export default function ImprovedDashboard() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [userProgress, setUserProgress] = useState({
    apiKeysConnected: false,
    firstCampaignCreated: false,
    optimizationStarted: false
  });

  // Check user progress
  useEffect(() => {
    checkUserProgress();
  }, []);

  const checkUserProgress = async () => {
    try {
      // Check if AI keys are connected
      const response = await fetch('/api/ai-keys-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_user_keys',
          user_id: 'demo_user'
        })
      });
      const data = await response.json();
      
      setUserProgress(prev => ({
        ...prev,
        apiKeysConnected: data.success && data.data.length > 0
      }));
    } catch (error) {
      console.error('Error checking progress:', error);
    }
  };

  const sections = [
    { 
      id: 'getting-started', 
      title: 'Getting Started', 
      icon: '🚀',
      description: 'Set up your AI marketing automation',
      color: '#3b82f6'
    },
    { 
      id: 'ai-suite', 
      title: 'AI Marketing Suite', 
      icon: '🤖',
      description: 'Predict performance & create campaigns',
      color: '#8b5cf6'
    },
    { 
      id: 'campaign-generator', 
      title: 'Campaign Builder', 
      icon: '🎯',
      description: 'Generate Alumni-specific campaigns',
      color: '#10b981'
    },
    { 
      id: 'optimization', 
      title: 'Auto-Optimization', 
      icon: '⚡',
      description: '24/7 performance optimization',
      color: '#f59e0b'
    },
    { 
      id: 'api-connections', 
      title: 'Connect APIs', 
      icon: '🔗',
      description: 'Link your advertising accounts',
      color: '#ef4444'
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Modern Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: '#3b82f6', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🎓
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#1e293b',
                  margin: 0,
                  lineHeight: '1.2'
                }}>
                  Alumni AI Marketing
                </h1>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#64748b', 
                  margin: 0,
                  fontWeight: '500'
                }}>
                  Autonomous marketing automation for Alumni English School
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                padding: '8px 16px',
                backgroundColor: userProgress.apiKeysConnected ? '#dcfce7' : '#fef3c7',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                color: userProgress.apiKeysConnected ? '#166534' : '#92400e'
              }}>
                {userProgress.apiKeysConnected ? '✅ AI Connected' : '⚠️ Setup Needed'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Navigation Cards */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#1e293b',
            marginBottom: '24px'
          }}>
            What would you like to do?
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '20px' 
          }}>
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  padding: '24px',
                  backgroundColor: activeSection === section.id ? section.color : 'white',
                  border: `2px solid ${activeSection === section.id ? section.color : '#e2e8f0'}`,
                  borderRadius: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: activeSection === section.id ? 
                    '0 8px 25px -8px rgba(0, 0, 0, 0.25)' : 
                    '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  transform: activeSection === section.id ? 'translateY(-2px)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== section.id) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px -4px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== section.id) {
                    e.target.style.transform = 'none';
                    e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                <div style={{ 
                  fontSize: '32px', 
                  marginBottom: '12px',
                  filter: activeSection === section.id ? 'brightness(0) invert(1)' : 'none'
                }}>
                  {section.icon}
                </div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: activeSection === section.id ? 'white' : '#1e293b',
                  margin: '0 0 8px 0'
                }}>
                  {section.title}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: activeSection === section.id ? 'rgba(255,255,255,0.9)' : '#64748b',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  {section.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '20px', 
          padding: '32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          {/* Getting Started */}
          {activeSection === 'getting-started' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚀</div>
                <h2 style={{ 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#1e293b',
                  marginBottom: '12px'
                }}>
                  Welcome to Alumni AI Marketing!
                </h2>
                <p style={{ 
                  fontSize: '18px', 
                  color: '#64748b',
                  maxWidth: '600px',
                  margin: '0 auto',
                  lineHeight: '1.6'
                }}>
                  Get your AI-powered marketing automation up and running in just 3 simple steps.
                </p>
              </div>

              <div style={{ display: 'grid', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
                {/* Step 1 */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '20px',
                  padding: '24px',
                  backgroundColor: userProgress.apiKeysConnected ? '#dcfce7' : '#f8fafc',
                  borderRadius: '16px',
                  border: `2px solid ${userProgress.apiKeysConnected ? '#22c55e' : '#e2e8f0'}`
                }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px',
                    backgroundColor: userProgress.apiKeysConnected ? '#22c55e' : '#3b82f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    {userProgress.apiKeysConnected ? '✓' : '1'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      margin: '0 0 8px 0'
                    }}>
                      Connect Your AI Services
                    </h3>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#64748b',
                      margin: '0 0 16px 0'
                    }}>
                      Connect OpenAI, Claude, or other AI services to power your campaigns.
                    </p>
                    <button
                      onClick={() => setActiveSection('api-connections')}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: userProgress.apiKeysConnected ? '#22c55e' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {userProgress.apiKeysConnected ? '✅ Connected' : '🔗 Connect Now'}
                    </button>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '20px',
                  padding: '24px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px',
                  border: '2px solid #e2e8f0',
                  opacity: userProgress.apiKeysConnected ? 1 : 0.6
                }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    2
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      margin: '0 0 8px 0'
                    }}>
                      Generate Your First Campaign
                    </h3>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#64748b',
                      margin: '0 0 16px 0'
                    }}>
                      Create AI-powered campaigns specifically optimized for Alumni English School.
                    </p>
                    <button
                      onClick={() => setActiveSection('campaign-generator')}
                      disabled={!userProgress.apiKeysConnected}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: userProgress.apiKeysConnected ? '#10b981' : '#94a3b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: userProgress.apiKeysConnected ? 'pointer' : 'not-allowed'
                      }}
                    >
                      🎯 Create Campaign
                    </button>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '20px',
                  padding: '24px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px',
                  border: '2px solid #e2e8f0',
                  opacity: userProgress.apiKeysConnected ? 1 : 0.6
                }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    3
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      margin: '0 0 8px 0'
                    }}>
                      Start Auto-Optimization
                    </h3>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#64748b',
                      margin: '0 0 16px 0'
                    }}>
                      Let AI optimize your campaigns 24/7 with automatic budget adjustments.
                    </p>
                    <button
                      onClick={() => setActiveSection('optimization')}
                      disabled={!userProgress.apiKeysConnected}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: userProgress.apiKeysConnected ? '#f59e0b' : '#94a3b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: userProgress.apiKeysConnected ? 'pointer' : 'not-allowed'
                      }}
                    >
                      ⚡ Start Optimization
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div style={{ 
                marginTop: '48px',
                padding: '32px',
                backgroundColor: '#f1f5f9',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  marginBottom: '24px'
                }}>
                  Why Alumni AI Marketing?
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '24px' 
                }}>
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>90%</div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>Prediction Accuracy</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>24/7</div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>Auto-Optimization</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>4.2x</div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>Target ROAS</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444' }}>$45</div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>Target CPA</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Suite */}
          {activeSection === 'ai-suite' && (
            <AutonomousAiDashboard userId="demo_user" />
          )}

          {/* Campaign Generator */}
          {activeSection === 'campaign-generator' && (
            <AiCampaignGenerator userId="demo_user" />
          )}

          {/* Optimization */}
          {activeSection === 'optimization' && (
            <RealTimeOptimization campaignId="demo_campaign" userId="demo_user" />
          )}

          {/* API Connections */}
          {activeSection === 'api-connections' && (
            <ApiConnectionManager userId="demo_user" />
          )}
        </div>
      </div>
    </div>
  );
}