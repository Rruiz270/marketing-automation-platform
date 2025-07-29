import { useState, useEffect } from 'react';
import AiServiceSelector from './AiServiceSelector';

export default function ProfessionalCampaignBuilder({ userId, globalApiKeys, onApiKeysUpdated }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [campaignData, setCampaignData] = useState({
    // Step 1: Strategy Translation
    objective: '',
    budget: '',
    audience: '',
    strategy: null,
    
    // Step 2: Media Plan
    mediaPlan: null,
    
    // Step 3: Copy Generation
    adCopy: null,
    
    // Step 4: Creative Generation
    creatives: null,
    
    // Step 5: Campaign Structure
    structure: null,
    
    // Step 6: Platform Publishing
    publishStatus: null,
    
    // Step 7: Performance Analysis
    performanceData: null
  });
  
  const [selectedAiService, setSelectedAiService] = useState(null);
  const [showAiSelector, setShowAiSelector] = useState(false);

  const steps = [
    { id: 1, title: 'Strategy Translation', icon: '🎯', description: 'Transform objectives into strategy' },
    { id: 2, title: 'Media Plan', icon: '📊', description: 'Build optimized media plan' },
    { id: 3, title: 'Copy Creation', icon: '✍️', description: 'Generate high-converting copy' },
    { id: 4, title: 'Creative Design', icon: '🎨', description: 'Create visual assets' },
    { id: 5, title: 'Campaign Structure', icon: '🏗️', description: 'Organize campaign hierarchy' },
    { id: 6, title: 'Publish Campaign', icon: '🚀', description: 'Deploy to ad platforms' },
    { id: 7, title: 'Performance Analysis', icon: '📈', description: 'Monitor and optimize' }
  ];

  useEffect(() => {
    loadCompanyProfile();
    selectDefaultAiService();
  }, [globalApiKeys]);

  const loadCompanyProfile = async () => {
    try {
      const response = await fetch('/api/company-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get',
          user_id: userId
        })
      });
      
      const data = await response.json();
      if (data.success && data.data) {
        setCompanyProfile(data.data);
      }
    } catch (error) {
      console.error('Error loading company profile:', error);
    }
  };

  const selectDefaultAiService = () => {
    const defaultService = globalApiKeys.find(key => key.is_default && key.status === 'active');
    if (defaultService) {
      setSelectedAiService(defaultService);
    } else {
      const activeService = globalApiKeys.find(key => key.status === 'active');
      if (activeService) {
        setSelectedAiService(activeService);
      }
    }
  };

  const handleAiSelection = (service) => {
    setSelectedAiService(service);
    setShowAiSelector(false);
  };

  // Step 1: Strategy Translation
  const handleStrategyGeneration = async () => {
    if (!campaignData.objective || !campaignData.budget || !campaignData.audience) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/strategy-translator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective: campaignData.objective,
          budget: campaignData.budget,
          audience: campaignData.audience,
          companyProfile,
          ai_service: selectedAiService?.service,
          ai_service_name: selectedAiService?.service_name
        })
      });

      const data = await response.json();
      if (data.success) {
        setCampaignData(prev => ({
          ...prev,
          strategy: data.strategy
        }));
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Error generating strategy:', error);
    }
    setLoading(false);
  };

  // Step 2: Media Plan Generation
  const handleMediaPlanGeneration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/media-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: campaignData.strategy,
          companyProfile,
          ai_service: selectedAiService?.service,
          ai_service_name: selectedAiService?.service_name
        })
      });

      const data = await response.json();
      if (data.success) {
        setCampaignData(prev => ({
          ...prev,
          mediaPlan: data.mediaPlan
        }));
        setCurrentStep(3);
      }
    } catch (error) {
      console.error('Error generating media plan:', error);
    }
    setLoading(false);
  };

  // Step 3: Copy Generation
  const handleCopyGeneration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/copy-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: campaignData.strategy,
          mediaPlan: campaignData.mediaPlan,
          companyProfile,
          ai_service: selectedAiService?.service,
          ai_service_name: selectedAiService?.service_name
        })
      });

      const data = await response.json();
      if (data.success) {
        setCampaignData(prev => ({
          ...prev,
          adCopy: data.adCopy
        }));
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Error generating copy:', error);
    }
    setLoading(false);
  };

  // Step 4: Creative Generation
  const handleCreativeGeneration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/creative-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adCopy: campaignData.adCopy,
          mediaPlan: campaignData.mediaPlan,
          companyProfile,
          ai_service: selectedAiService?.service,
          ai_service_name: selectedAiService?.service_name
        })
      });

      const data = await response.json();
      if (data.success) {
        setCampaignData(prev => ({
          ...prev,
          creatives: data.creatives
        }));
        setCurrentStep(5);
      }
    } catch (error) {
      console.error('Error generating creatives:', error);
    }
    setLoading(false);
  };

  // Step 5: Campaign Structure
  const handleStructureGeneration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/campaign-structurer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: campaignData.strategy,
          mediaPlan: campaignData.mediaPlan,
          adCopy: campaignData.adCopy,
          creatives: campaignData.creatives,
          companyProfile,
          ai_service: selectedAiService?.service,
          ai_service_name: selectedAiService?.service_name
        })
      });

      const data = await response.json();
      if (data.success) {
        setCampaignData(prev => ({
          ...prev,
          structure: data.structure
        }));
        setCurrentStep(6);
      }
    } catch (error) {
      console.error('Error structuring campaign:', error);
    }
    setLoading(false);
  };

  // Step 6: Platform Publishing
  const handleCampaignPublish = async (platform) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/campaign-publisher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          campaignStructure: campaignData.structure,
          companyProfile,
          userId
        })
      });

      const data = await response.json();
      if (data.success) {
        setCampaignData(prev => ({
          ...prev,
          publishStatus: data.publishStatus
        }));
        setCurrentStep(7);
      }
    } catch (error) {
      console.error('Error publishing campaign:', error);
    }
    setLoading(false);
  };

  // Step 7: Performance Analysis
  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/performance-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaignData.publishStatus?.campaignId,
          ai_service: selectedAiService?.service,
          ai_service_name: selectedAiService?.service_name
        })
      });

      const data = await response.json();
      if (data.success) {
        setCampaignData(prev => ({
          ...prev,
          performanceData: data.performance
        }));
      }
    } catch (error) {
      console.error('Error loading performance:', error);
    }
    setLoading(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
              Transform Your Business Objectives into Paid Media Strategy
            </h3>
            
            {companyProfile && (
              <div style={{ 
                padding: '20px', 
                backgroundColor: '#f0f9ff', 
                borderRadius: '12px', 
                marginBottom: '24px' 
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Company: {companyProfile.companyName}
                </h4>
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                  Industry: {companyProfile.industry} | Budget: R$ {companyProfile.monthlyBudget}
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Campaign Objective *
                </label>
                <select
                  value={campaignData.objective}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, objective: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select objective</option>
                  <option value="lead_generation">Lead Generation</option>
                  <option value="brand_awareness">Brand Awareness</option>
                  <option value="conversions">Sales/Conversions</option>
                  <option value="traffic">Website Traffic</option>
                  <option value="engagement">Engagement</option>
                  <option value="app_installs">App Installations</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Campaign Budget (R$) *
                </label>
                <input
                  type="number"
                  value={campaignData.budget}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder={companyProfile?.monthlyBudget || "10000"}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Target Audience *
                </label>
                <textarea
                  value={campaignData.audience}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, audience: e.target.value }))}
                  placeholder={companyProfile?.targetPublic || "Describe your target audience in detail"}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    minHeight: '100px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={() => setShowAiSelector(true)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#e2e8f0',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  🤖 {selectedAiService ? selectedAiService.service_name : 'Select AI'}
                </button>
                
                <button
                  onClick={handleStrategyGeneration}
                  disabled={loading || !selectedAiService}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    backgroundColor: selectedAiService ? '#3b82f6' : '#94a3b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: selectedAiService ? 'pointer' : 'not-allowed'
                  }}
                >
                  {loading ? 'Generating Strategy...' : 'Generate Strategy'}
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
              AI-Optimized Media Plan
            </h3>
            
            {campaignData.strategy && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Strategy Overview</h4>
                <div style={{ 
                  padding: '20px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <span style={{ fontWeight: '500' }}>Primary Channel:</span> {campaignData.strategy.primaryChannel}
                    </div>
                    <div>
                      <span style={{ fontWeight: '500' }}>Expected ROAS:</span> {campaignData.strategy.expectedROAS}x
                    </div>
                    <div>
                      <span style={{ fontWeight: '500' }}>Target CPA:</span> R$ {campaignData.strategy.targetCPA}
                    </div>
                    <div>
                      <span style={{ fontWeight: '500' }}>Timeline:</span> {campaignData.strategy.timeline}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleMediaPlanGeneration}
                disabled={loading}
                style={{
                  padding: '16px 48px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Building Media Plan...' : 'Generate Media Plan'}
              </button>
            </div>

            {campaignData.mediaPlan && (
              <div style={{ marginTop: '32px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Media Plan Details</h4>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {campaignData.mediaPlan.channels?.map((channel, index) => (
                    <div key={index} style={{ 
                      padding: '16px', 
                      backgroundColor: '#f0f9ff', 
                      borderRadius: '8px',
                      border: '1px solid #3b82f6'
                    }}>
                      <h5 style={{ fontWeight: '600', marginBottom: '8px' }}>{channel.name}</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '14px' }}>
                        <div>Budget: R$ {channel.budget}</div>
                        <div>Expected Leads: {channel.expectedLeads}</div>
                        <div>CPA: R$ {channel.cpa}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
              AI-Generated Ad Copy
            </h3>
            
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <button
                onClick={handleCopyGeneration}
                disabled={loading}
                style={{
                  padding: '16px 48px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Creating Copy...' : 'Generate Copy for All Channels'}
              </button>
            </div>

            {campaignData.adCopy && (
              <div style={{ display: 'grid', gap: '24px' }}>
                {Object.entries(campaignData.adCopy).map(([channel, copy]) => (
                  <div key={channel} style={{ 
                    padding: '24px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#3b82f6' }}>
                      {channel} Copy
                    </h4>
                    
                    {copy.headlines && (
                      <div style={{ marginBottom: '16px' }}>
                        <h5 style={{ fontWeight: '600', marginBottom: '8px' }}>Headlines:</h5>
                        {copy.headlines.map((headline, i) => (
                          <div key={i} style={{ 
                            padding: '8px 12px', 
                            backgroundColor: 'white', 
                            borderRadius: '6px',
                            marginBottom: '4px'
                          }}>
                            {headline}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {copy.descriptions && (
                      <div style={{ marginBottom: '16px' }}>
                        <h5 style={{ fontWeight: '600', marginBottom: '8px' }}>Descriptions:</h5>
                        {copy.descriptions.map((desc, i) => (
                          <div key={i} style={{ 
                            padding: '8px 12px', 
                            backgroundColor: 'white', 
                            borderRadius: '6px',
                            marginBottom: '4px'
                          }}>
                            {desc}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {copy.ctas && (
                      <div>
                        <h5 style={{ fontWeight: '600', marginBottom: '8px' }}>CTAs:</h5>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {copy.ctas.map((cta, i) => (
                            <span key={i} style={{ 
                              padding: '6px 16px', 
                              backgroundColor: '#3b82f6', 
                              color: 'white',
                              borderRadius: '20px',
                              fontSize: '14px'
                            }}>
                              {cta}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
              AI-Generated Creative Assets
            </h3>
            
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <button
                onClick={handleCreativeGeneration}
                disabled={loading}
                style={{
                  padding: '16px 48px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Generating Creatives...' : 'Generate Creative Assets'}
              </button>
            </div>

            {campaignData.creatives && (
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Creative Formats</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  {campaignData.creatives.formats?.map((format, index) => (
                    <div key={index} style={{ 
                      padding: '20px', 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <h5 style={{ fontWeight: '600', marginBottom: '12px' }}>{format.name}</h5>
                      <div style={{ 
                        height: '200px', 
                        backgroundColor: '#e2e8f0', 
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px'
                      }}>
                        <span style={{ fontSize: '48px' }}>{format.icon || '🎨'}</span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        <div>Dimensions: {format.dimensions}</div>
                        <div>Platform: {format.platform}</div>
                        <div>Variations: {format.variations}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '24px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Design Guidelines</h4>
                  <div style={{ 
                    padding: '16px', 
                    backgroundColor: '#f0f9ff', 
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>Primary colors based on brand guidelines</li>
                      <li>High contrast for mobile optimization</li>
                      <li>Clear hierarchy with compelling headlines</li>
                      <li>Professional imagery targeting {companyProfile?.targetPublic}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
              Campaign Structure Organization
            </h3>
            
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <button
                onClick={handleStructureGeneration}
                disabled={loading}
                style={{
                  padding: '16px 48px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Organizing Structure...' : 'Generate Campaign Structure'}
              </button>
            </div>

            {campaignData.structure && (
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Campaign Hierarchy</h4>
                
                {campaignData.structure.campaigns?.map((campaign, index) => (
                  <div key={index} style={{ 
                    marginBottom: '24px',
                    padding: '20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h5 style={{ fontWeight: '600', marginBottom: '16px', color: '#3b82f6' }}>
                      📁 {campaign.name}
                    </h5>
                    
                    {campaign.adSets?.map((adSet, adSetIndex) => (
                      <div key={adSetIndex} style={{ 
                        marginLeft: '20px',
                        marginBottom: '12px',
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '8px'
                      }}>
                        <h6 style={{ fontWeight: '500', marginBottom: '8px' }}>
                          📂 {adSet.name}
                        </h6>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                          <div>Audience: {adSet.audience}</div>
                          <div>Budget: R$ {adSet.budget}</div>
                          <div>Placement: {adSet.placement}</div>
                        </div>
                        
                        <div style={{ marginTop: '8px', marginLeft: '20px' }}>
                          {adSet.ads?.map((ad, adIndex) => (
                            <div key={adIndex} style={{ 
                              padding: '8px',
                              backgroundColor: '#f0f9ff',
                              borderRadius: '6px',
                              marginBottom: '4px',
                              fontSize: '14px'
                            }}>
                              📄 {ad.name} - {ad.format}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
              Publish Campaign to Platforms
            </h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ 
                padding: '24px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  Select Publishing Method
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <button
                    onClick={() => handleCampaignPublish('facebook')}
                    disabled={loading}
                    style={{
                      padding: '20px',
                      backgroundColor: '#1877f2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📘</div>
                    Publish to Meta Ads
                  </button>
                  
                  <button
                    onClick={() => handleCampaignPublish('google')}
                    disabled={loading}
                    style={{
                      padding: '20px',
                      backgroundColor: '#4285f4',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
                    Publish to Google Ads
                  </button>
                </div>
                
                <button
                  onClick={() => handleCampaignPublish('manual')}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: '#64748b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>📋</div>
                  Get Manual Publishing Guide
                </button>
              </div>
              
              {campaignData.publishStatus && (
                <div style={{ 
                  padding: '20px',
                  backgroundColor: campaignData.publishStatus.success ? '#dcfce7' : '#fee2e2',
                  borderRadius: '12px',
                  border: `1px solid ${campaignData.publishStatus.success ? '#22c55e' : '#ef4444'}`
                }}>
                  <h5 style={{ fontWeight: '600', marginBottom: '8px' }}>
                    {campaignData.publishStatus.success ? '✅ Published Successfully' : '❌ Publishing Failed'}
                  </h5>
                  <p style={{ fontSize: '14px', margin: 0 }}>
                    {campaignData.publishStatus.message}
                  </p>
                  {campaignData.publishStatus.campaignId && (
                    <div style={{ marginTop: '12px', fontSize: '14px' }}>
                      Campaign ID: <code>{campaignData.publishStatus.campaignId}</code>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
              Performance Analysis & Optimization
            </h3>
            
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <button
                onClick={loadPerformanceData}
                disabled={loading}
                style={{
                  padding: '16px 48px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Loading Performance...' : 'Analyze Performance'}
              </button>
            </div>

            {campaignData.performanceData && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                  <div style={{ 
                    padding: '20px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>
                      {campaignData.performanceData.impressions || '0'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>Impressions</div>
                  </div>
                  
                  <div style={{ 
                    padding: '20px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e' }}>
                      {campaignData.performanceData.ctr || '0%'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>CTR</div>
                  </div>
                  
                  <div style={{ 
                    padding: '20px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
                      R$ {campaignData.performanceData.cpa || '0'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>CPA</div>
                  </div>
                  
                  <div style={{ 
                    padding: '20px',
                    backgroundColor: '#f3e8ff',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6' }}>
                      {campaignData.performanceData.roas || '0x'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>ROAS</div>
                  </div>
                </div>

                <div style={{ 
                  padding: '24px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                    AI Recommendations
                  </h4>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {campaignData.performanceData.recommendations?.map((rec, index) => (
                      <div key={index} style={{ 
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span style={{ fontSize: '20px' }}>{rec.icon || '💡'}</span>
                        <div>
                          <div style={{ fontWeight: '500' }}>{rec.title}</div>
                          <div style={{ fontSize: '14px', color: '#64748b' }}>{rec.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Progress Steps */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          {steps.map((step, index) => (
            <div key={step.id} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ position: 'relative' }}>
                {index < steps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '24px',
                    left: '50%',
                    width: '100%',
                    height: '2px',
                    backgroundColor: currentStep > step.id ? '#22c55e' : '#e2e8f0',
                    zIndex: 0
                  }} />
                )}
                
                <div style={{
                  width: '48px',
                  height: '48px',
                  margin: '0 auto',
                  backgroundColor: currentStep >= step.id ? (currentStep === step.id ? '#3b82f6' : '#22c55e') : '#e2e8f0',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  position: 'relative',
                  zIndex: 1,
                  cursor: currentStep >= step.id ? 'pointer' : 'default'
                }}
                onClick={() => currentStep >= step.id && setCurrentStep(step.id)}
                >
                  {currentStep > step.id ? '✓' : step.icon}
                </div>
                
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: currentStep >= step.id ? '#1e293b' : '#94a3b8' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {step.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div style={{ 
        padding: '32px',
        backgroundColor: '#f8fafc',
        borderRadius: '16px',
        minHeight: '400px'
      }}>
        {renderStepContent()}
      </div>

      {/* AI Service Selector Modal */}
      {showAiSelector && (
        <AiServiceSelector
          globalApiKeys={globalApiKeys}
          onSelect={handleAiSelection}
          onClose={() => setShowAiSelector(false)}
          selectedService={selectedAiService}
        />
      )}
    </div>
  );
}