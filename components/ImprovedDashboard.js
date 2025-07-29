import { useState, useEffect } from 'react';
import RealTimeOptimization from './RealTimeOptimization';
import AdvancedCampaignBuilder from './AdvancedCampaignBuilder';
import AutonomousAiDashboard from './AutonomousAiDashboard';
import ApiConnectionManager from './ApiConnectionManager';
import IntelligentPerformanceMonitor from './IntelligentPerformanceMonitor';
import CompanyRegistration from './CompanyRegistration';
import ProfessionalCampaignBuilder from './ProfessionalCampaignBuilder';

export default function ImprovedDashboard() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [userProgress, setUserProgress] = useState({
    companyRegistered: false,
    apiKeysConnected: false,
    firstCampaignCreated: false,
    optimizationStarted: false
  });
  const [globalApiKeys, setGlobalApiKeys] = useState([]);

  // Check user progress on initial load
  useEffect(() => {
    checkUserProgress(true); // Force initial load
  }, []);

  // Refresh progress when active section changes to ensure fresh data
  useEffect(() => {
    if (activeSection === 'campaign-builder' || activeSection === 'performance-monitor' || activeSection === 'ai-suite') {
      checkUserProgress();
    } else if (activeSection === 'getting-started') {
      // For getting started, only check if we don't have any keys yet
      if (globalApiKeys.length === 0) {
        checkUserProgress();
      } else {
        // Use existing state for better persistence
        const hasActiveKeys = globalApiKeys.some(key => key.status === 'active' && key.enabled !== false);
        setUserProgress(prev => ({
          ...prev,
          apiKeysConnected: hasActiveKeys
        }));
      }
    }
  }, [activeSection, globalApiKeys]);

  // Listen for navigation events from child components
  useEffect(() => {
    const handleNavigation = (event) => {
      if (event.detail) {
        setActiveSection(event.detail);
      }
    };

    window.addEventListener('navigate-to-api', handleNavigation);
    return () => window.removeEventListener('navigate-to-api', handleNavigation);
  }, []);

  // Monitor globalApiKeys changes and update user progress accordingly
  useEffect(() => {
    console.log('ImprovedDashboard: globalApiKeys changed:', globalApiKeys.length);
    if (globalApiKeys.length >= 0) {
      const hasActiveKeys = globalApiKeys.some(key => key.status === 'active' && key.enabled !== false);
      console.log('ImprovedDashboard: Updating apiKeysConnected to:', hasActiveKeys);
      setUserProgress(prev => ({
        ...prev,
        apiKeysConnected: hasActiveKeys
      }));
    }
  }, [globalApiKeys]);

  const checkUserProgress = async (force = false) => {
    try {
      console.log('ImprovedDashboard: Checking user progress, force:', force);
      console.log('ImprovedDashboard: Current globalApiKeys:', globalApiKeys.length);
      
      // Check company profile
      const profileResponse = await fetch('/api/company-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get',
          user_id: 'demo_user'
        })
      });
      const profileData = await profileResponse.json();
      
      if (profileData.success && profileData.data) {
        setUserProgress(prev => ({
          ...prev,
          companyRegistered: true
        }));
      }
      
      // If we already have API keys and this isn't a forced update, use existing state
      if (globalApiKeys.length > 0 && !force) {
        console.log('ImprovedDashboard: Using existing globalApiKeys state');
        const hasActiveKeys = globalApiKeys.some(key => key.status === 'active' && key.enabled !== false);
        setUserProgress(prev => ({
          ...prev,
          apiKeysConnected: hasActiveKeys
        }));
        return;
      }
      
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
      
      console.log('ImprovedDashboard: API response:', data);
      
      if (data.success && data.data) {
        console.log('ImprovedDashboard: Updating globalApiKeys with', data.data.length, 'keys');
        
        // Only update if we got meaningful data or if this is a forced update
        if (data.data.length > 0 || force || globalApiKeys.length === 0) {
          setGlobalApiKeys(data.data);
          
          const hasActiveKeys = data.data.some(key => key.status === 'active' && key.enabled !== false);
          console.log('ImprovedDashboard: Has active keys:', hasActiveKeys);
          
          setUserProgress(prev => ({
            ...prev,
            apiKeysConnected: hasActiveKeys
          }));
        } else {
          console.log('ImprovedDashboard: Preserving existing globalApiKeys state');
        }
      } else {
        console.error('ImprovedDashboard: API response not successful:', data);
        // Don't clear existing state on error
        if (globalApiKeys.length > 0) {
          console.log('ImprovedDashboard: Preserving existing state due to API error');
          const hasActiveKeys = globalApiKeys.some(key => key.status === 'active' && key.enabled !== false);
          setUserProgress(prev => ({
            ...prev,
            apiKeysConnected: hasActiveKeys
          }));
        }
      }
    } catch (error) {
      console.error('ImprovedDashboard: Error checking progress:', error);
      // Don't clear existing state on error
      if (globalApiKeys.length > 0) {
        console.log('ImprovedDashboard: Preserving existing state due to network error');
        const hasActiveKeys = globalApiKeys.some(key => key.status === 'active' && key.enabled !== false);
        setUserProgress(prev => ({
          ...prev,
          apiKeysConnected: hasActiveKeys
        }));
      }
    }
  };

  // Callback function for child components to refresh API state
  const onApiKeysUpdated = () => {
    console.log('ImprovedDashboard: onApiKeysUpdated called');
    checkUserProgress(true);
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
      id: 'company-registration', 
      title: 'Company Profile', 
      icon: '🏢',
      description: 'Business information & insights',
      color: '#f59e0b'
    },
    { 
      id: 'campaign-builder', 
      title: 'Campaign Builder', 
      icon: '🎯',
      description: '7-step AI campaign creation',
      color: '#10b981'
    },
    { 
      id: 'performance-monitor', 
      title: 'Performance Monitor', 
      icon: '📊',
      description: 'Intelligent insights & optimization',
      color: '#8b5cf6'
    },
    { 
      id: 'ai-suite', 
      title: 'AI Marketing Suite', 
      icon: '🤖',
      description: 'Advanced AI automation features',
      color: '#f59e0b'
    },
    { 
      id: 'optimization', 
      title: 'Auto-Optimization', 
      icon: '⚡',
      description: '24/7 real-time optimization',
      color: '#14b8a6'
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
                  Professional-grade campaign management with step-by-step AI guidance. Create, monitor, and optimize campaigns like a marketing expert.
                </p>
              </div>

              <div style={{ display: 'grid', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
                {/* Step 0 - Company Registration */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '20px',
                  padding: '24px',
                  backgroundColor: userProgress.companyRegistered ? '#dcfce7' : '#fef3c7',
                  borderRadius: '16px',
                  border: `2px solid ${userProgress.companyRegistered ? '#22c55e' : '#f59e0b'}`
                }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px',
                    backgroundColor: userProgress.companyRegistered ? '#22c55e' : '#f59e0b',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    {userProgress.companyRegistered ? '✓' : '1'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      margin: '0 0 8px 0'
                    }}>
                      Register Your Company
                    </h3>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#64748b',
                      margin: '0 0 16px 0'
                    }}>
                      Provide essential business information for personalized AI strategies.
                    </p>
                    <button
                      onClick={() => setActiveSection('company-registration')}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: userProgress.companyRegistered ? '#22c55e' : '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {userProgress.companyRegistered ? '✅ Registered' : '📝 Register Now'}
                    </button>
                  </div>
                </div>

                {/* Step 1 */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '20px',
                  padding: '24px',
                  backgroundColor: userProgress.apiKeysConnected ? '#dcfce7' : '#f8fafc',
                  borderRadius: '16px',
                  border: `2px solid ${userProgress.apiKeysConnected ? '#22c55e' : '#e2e8f0'}`,
                  opacity: userProgress.companyRegistered ? 1 : 0.6
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
                    {userProgress.apiKeysConnected ? '✓' : '2'}
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
                      disabled={!userProgress.companyRegistered}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: userProgress.apiKeysConnected ? '#22c55e' : userProgress.companyRegistered ? '#3b82f6' : '#94a3b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: userProgress.companyRegistered ? 'pointer' : 'not-allowed'
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
                  opacity: userProgress.apiKeysConnected && userProgress.companyRegistered ? 1 : 0.6
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
                    3
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      margin: '0 0 8px 0'
                    }}>
                      Build Your First Campaign
                    </h3>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#64748b',
                      margin: '0 0 16px 0'
                    }}>
                      Step-by-step wizard with AI market research, competitor analysis, and intelligent recommendations.
                    </p>
                    <button
                      onClick={() => setActiveSection('campaign-builder')}
                      disabled={!userProgress.apiKeysConnected || !userProgress.companyRegistered}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: userProgress.apiKeysConnected && userProgress.companyRegistered ? '#10b981' : '#94a3b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: userProgress.apiKeysConnected && userProgress.companyRegistered ? 'pointer' : 'not-allowed'
                      }}
                    >
                      🎯 Build Campaign
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
                  opacity: userProgress.apiKeysConnected && userProgress.companyRegistered ? 1 : 0.6
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
                    4
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      margin: '0 0 8px 0'
                    }}>
                      Monitor & Optimize
                    </h3>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#64748b',
                      margin: '0 0 16px 0'
                    }}>
                      Intelligent performance monitoring with automatic competitor analysis and optimization suggestions.
                    </p>
                    <button
                      onClick={() => setActiveSection('performance-monitor')}
                      disabled={!userProgress.apiKeysConnected}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: userProgress.apiKeysConnected ? '#8b5cf6' : '#94a3b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: userProgress.apiKeysConnected ? 'pointer' : 'not-allowed'
                      }}
                    >
                      📊 Monitor Performance
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

          {/* Company Registration */}
          {activeSection === 'company-registration' && (
            <CompanyRegistration 
              userId="demo_user" 
              onComplete={() => {
                checkUserProgress(true);
                setActiveSection('getting-started');
              }}
            />
          )}

          {/* Campaign Builder */}
          {activeSection === 'campaign-builder' && (
            <ProfessionalCampaignBuilder 
              userId="demo_user" 
              globalApiKeys={globalApiKeys}
              onApiKeysUpdated={onApiKeysUpdated}
            />
          )}

          {/* Performance Monitor */}
          {activeSection === 'performance-monitor' && (
            <IntelligentPerformanceMonitor 
              campaignId="demo_campaign" 
              userId="demo_user"
              globalApiKeys={globalApiKeys}
              onApiKeysUpdated={onApiKeysUpdated}
            />
          )}

          {/* AI Suite */}
          {activeSection === 'ai-suite' && (
            <AutonomousAiDashboard 
              userId="demo_user"
              globalApiKeys={globalApiKeys}
              onApiKeysUpdated={onApiKeysUpdated}
            />
          )}

          {/* Optimization */}
          {activeSection === 'optimization' && (
            <RealTimeOptimization 
              campaignId="demo_campaign" 
              userId="demo_user"
              globalApiKeys={globalApiKeys}
              onApiKeysUpdated={onApiKeysUpdated}
            />
          )}

          {/* API Connections */}
          {activeSection === 'api-connections' && (
            <ApiConnectionManager 
              userId="demo_user"
              globalApiKeys={globalApiKeys}
              onApiKeysUpdated={onApiKeysUpdated}
            />
          )}
        </div>
      </div>
    </div>
  );
}