import { useState, useEffect } from 'react';

export default function AiCampaignGenerator({ userId = 'demo_user' }) {
  const [activeStep, setActiveStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    industry: 'English Teaching',
    schoolName: 'Alumni English School',
    targetAudience: '',
    campaignObjective: '',
    tone: '',
    keywords: '',
    competitors: '',
    uniqueSellingPoints: '',
    budget: '',
    duration: ''
  });
  const [generatedContent, setGeneratedContent] = useState({
    masterPrompt: '',
    copyVariations: [],
    visualSuggestions: [],
    campaignStrategy: ''
  });
  const [loading, setLoading] = useState(false);
  const [connectedAiServices, setConnectedAiServices] = useState([]);

  useEffect(() => {
    loadConnectedServices();
  }, []);

  const loadConnectedServices = async () => {
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
        setConnectedAiServices(data.data);
      }
    } catch (error) {
      console.error('Error loading connected services:', error);
    }
  };

  const updateCampaignData = (field, value) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const alumniSchoolData = {
    about: "Alumni English School is a Brazil-USA Binational Center with over 60 years of experience in English teaching. Founded in 1961 by alumni of American universities, officially recognized by both Brazilian and US governments.",
    methodology: "Exclusive methodology focused on constant student evolution, collaborative approach, communication-based learning, personalized experience with small groups and flexible scheduling.",
    services: "English courses for adults, companies, and children. Online and live classes, intensive courses, graduation programs, teacher training.",
    uniquePoints: [
      "Only English school in São Paulo officially recognized as Brazil-USA Binational Center",
      "60+ years of teaching experience and tradition",
      "100% online and live classes focused on conversation",
      "Small groups with personalized attention",
      "Flexible scheduling up to 6 times per week",
      "Interactive digital platform with innovative resources",
      "Official government recognition from Brazil and USA"
    ],
    targetMarkets: "Professionals seeking career advancement, students preparing for international exams, companies needing corporate English training, children and teenagers, adults looking to travel or study abroad"
  };

  const campaignObjectives = [
    { id: 'enrollment', name: 'Increase Course Enrollments', desc: 'Drive new student registrations' },
    { id: 'awareness', name: 'Brand Awareness', desc: 'Increase recognition of Alumni brand' },
    { id: 'corporate', name: 'Corporate Partnerships', desc: 'Attract B2B corporate clients' },
    { id: 'retention', name: 'Student Retention', desc: 'Keep existing students engaged' },
    { id: 'premium', name: 'Premium Course Promotion', desc: 'Promote high-value intensive programs' }
  ];

  const targetAudiences = [
    { id: 'young-professionals', name: 'Young Professionals (25-35)', desc: 'Career-focused individuals seeking advancement' },
    { id: 'executives', name: 'Corporate Executives (35-50)', desc: 'Senior professionals needing business English' },
    { id: 'students', name: 'University Students (18-25)', desc: 'Students preparing for international opportunities' },
    { id: 'parents', name: 'Parents (30-45)', desc: 'Parents seeking English education for their children' },
    { id: 'retirees', name: 'Active Retirees (55+)', desc: 'Retirees pursuing personal enrichment and travel' }
  ];

  const toneOptions = [
    { id: 'professional', name: 'Professional & Trustworthy', desc: 'Emphasizing expertise and credibility' },
    { id: 'friendly', name: 'Friendly & Approachable', desc: 'Warm and welcoming tone' },
    { id: 'inspiring', name: 'Inspiring & Motivational', desc: 'Encouraging personal growth' },
    { id: 'urgent', name: 'Urgent & Action-Oriented', desc: 'Creating sense of urgency' },
    { id: 'premium', name: 'Premium & Exclusive', desc: 'Luxury positioning for high-value courses' }
  ];

  const generateMasterPrompt = () => {
    const selectedObjective = campaignObjectives.find(obj => obj.id === campaignData.campaignObjective);
    const selectedAudience = targetAudiences.find(aud => aud.id === campaignData.targetAudience);
    const selectedTone = toneOptions.find(tone => tone.id === campaignData.tone);

    return `# Alumni English School - Master Campaign Prompt

## School Context:
${alumniSchoolData.about}

**Unique Selling Points:**
${alumniSchoolData.uniquePoints.map(point => `• ${point}`).join('\n')}

**Teaching Methodology:** ${alumniSchoolData.methodology}

## Campaign Parameters:
- **Objective:** ${selectedObjective?.name} - ${selectedObjective?.desc}
- **Target Audience:** ${selectedAudience?.name} - ${selectedAudience?.desc}
- **Tone:** ${selectedTone?.name} - ${selectedTone?.desc}
- **Keywords:** ${campaignData.keywords}
- **Budget:** ${campaignData.budget}
- **Duration:** ${campaignData.duration}

## Additional Context:
- **Unique Selling Points:** ${campaignData.uniqueSellingPoints}
- **Competitors:** ${campaignData.competitors}

## Content Generation Instructions:
Create compelling marketing content that:
1. Highlights Alumni's 60+ years of experience and official government recognition
2. Emphasizes the Brazil-USA Binational Center status as a unique differentiator
3. Showcases the flexible, personalized learning approach
4. Appeals specifically to ${selectedAudience?.name}
5. Uses a ${selectedTone?.name.toLowerCase()} tone
6. Focuses on ${selectedObjective?.name.toLowerCase()}
7. Incorporates these keywords naturally: ${campaignData.keywords}

## Content Types Needed:
- Headlines and taglines
- Social media posts (Instagram, Facebook, LinkedIn)
- Google Ads copy
- Email marketing content
- Landing page copy
- Video script concepts

Generate content that positions Alumni not just as an English school, but as a gateway to international opportunities, career advancement, and personal growth through the world's most important global language.`;
  };

  const generateCampaignContent = async () => {
    if (!campaignData.targetAudience || !campaignData.campaignObjective || !campaignData.tone) {
      alert('Please fill in all required fields: Target Audience, Campaign Objective, and Tone');
      return;
    }

    setLoading(true);
    
    try {
      const masterPrompt = generateMasterPrompt();
      
      // For now, we'll generate static content. Later this can be connected to AI services
      const staticContent = generateStaticContent();
      
      setGeneratedContent({
        masterPrompt,
        ...staticContent
      });
      
      setActiveStep(3);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Error generating content: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateStaticContent = () => {
    const selectedAudience = targetAudiences.find(aud => aud.id === campaignData.targetAudience);
    const selectedObjective = campaignObjectives.find(obj => obj.id === campaignData.campaignObjective);
    
    return {
      copyVariations: [
        {
          type: 'Headline',
          content: `Transform Your Career with Alumni's 60-Year English Excellence`,
          platform: 'Universal'
        },
        {
          type: 'Social Media Post',
          content: `🇺🇸🇧🇷 Why choose Alumni?\n✅ Only Brazil-USA Binational Center in São Paulo\n✅ 60+ years of teaching excellence\n✅ 100% online live classes\n✅ Small groups, big results\n\nStart your English journey today! #AlumniEnglish`,
          platform: 'Instagram/Facebook'
        },
        {
          type: 'Google Ad',
          content: `Learn English at Alumni - Brazil-USA Binational Center. 60 years of excellence. Flexible schedules. Small groups. Government-recognized quality.`,
          platform: 'Google Ads'
        },
        {
          type: 'Email Subject',
          content: `Your English goals are closer than you think - Alumni's proven method`,
          platform: 'Email Marketing'
        }
      ],
      visualSuggestions: [
        {
          type: 'Hero Image',
          description: 'Professional diverse group in an online class setting with Alumni branding and Brazil-USA flags',
          style: 'Modern corporate photography'
        },
        {
          type: 'Social Media Graphic',
          description: 'Split-screen showing "60 Years of Excellence" with vintage Alumni photos and modern online classroom',
          style: 'Brand heritage design'
        },
        {
          type: 'Video Concept',
          description: 'Student success stories: Before/after transformations showing career advancement after Alumni courses',
          style: 'Documentary-style testimonials'
        },
        {
          type: 'Infographic',
          description: 'Alumni methodology breakdown: Small groups → Live interaction → Flexible schedule → Career success',
          style: 'Clean, educational infographic'
        }
      ],
      campaignStrategy: `
## Campaign Strategy for ${selectedAudience?.name}

### Phase 1: Awareness (Weeks 1-2)
- Focus on Alumni's unique Brazil-USA Binational Center status
- Highlight 60+ years of excellence and government recognition
- Target: ${selectedAudience?.desc}

### Phase 2: Consideration (Weeks 3-4)
- Showcase methodology and flexibility
- Student testimonials and success stories
- Free trial class offers

### Phase 3: Conversion (Weeks 5-6)
- Limited-time enrollment bonuses
- Personalized consultation offers
- Urgency-driven messaging

### Key Metrics to Track:
- Website visits from target audience
- Trial class bookings
- Course enrollment conversions
- Social media engagement rates
- Email open and click rates

### Budget Allocation:
- 40% Google Ads (Search + Display)
- 30% Social Media Advertising
- 20% Email Marketing
- 10% Content Creation
      `
    };
  };

  const steps = [
    { id: 1, name: 'Campaign Setup', desc: 'Define your campaign parameters' },
    { id: 2, name: 'Review & Generate', desc: 'Review settings and generate content' },
    { id: 3, name: 'Campaign Assets', desc: 'View and refine generated content' }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1f2937' }}>
          🎯 AI Campaign Generator for Alumni English School
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
          Generate comprehensive marketing campaigns powered by AI and 60 years of Alumni expertise
        </p>
      </div>

      {/* Progress Steps */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          {steps.map((step, index) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: activeStep >= step.id ? '#3b82f6' : '#e5e7eb',
                color: activeStep >= step.id ? 'white' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                {step.id}
              </div>
              <div style={{ marginLeft: '12px', marginRight: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: activeStep >= step.id ? '#1f2937' : '#6b7280' }}>
                  {step.name}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {step.desc}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div style={{
                  width: '60px',
                  height: '2px',
                  backgroundColor: activeStep > step.id ? '#3b82f6' : '#e5e7eb',
                  marginRight: '24px'
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Campaign Setup */}
      {activeStep === 1 && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>About Alumni English School</h3>
            <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: 0 }}>
              {alumniSchoolData.about}
            </p>
            <div style={{ marginTop: '16px' }}>
              <strong style={{ fontSize: '14px', color: '#374151' }}>Key Differentiators:</strong>
              <ul style={{ fontSize: '14px', color: '#4b5563', marginTop: '8px', paddingLeft: '20px' }}>
                {alumniSchoolData.uniquePoints.slice(0, 3).map((point, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{point}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Target Audience Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                Target Audience *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                {targetAudiences.map(audience => (
                  <div
                    key={audience.id}
                    onClick={() => updateCampaignData('targetAudience', audience.id)}
                    style={{
                      border: campaignData.targetAudience === audience.id ? '2px solid #3b82f6' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                      backgroundColor: campaignData.targetAudience === audience.id ? '#eff6ff' : 'white'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{audience.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{audience.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign Objective */}
            <div>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                Campaign Objective *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                {campaignObjectives.map(objective => (
                  <div
                    key={objective.id}
                    onClick={() => updateCampaignData('campaignObjective', objective.id)}
                    style={{
                      border: campaignData.campaignObjective === objective.id ? '2px solid #3b82f6' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                      backgroundColor: campaignData.campaignObjective === objective.id ? '#eff6ff' : 'white'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{objective.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{objective.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tone Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                Campaign Tone *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                {toneOptions.map(tone => (
                  <div
                    key={tone.id}
                    onClick={() => updateCampaignData('tone', tone.id)}
                    style={{
                      border: campaignData.tone === tone.id ? '2px solid #3b82f6' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                      backgroundColor: campaignData.tone === tone.id ? '#eff6ff' : 'white'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{tone.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{tone.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Target Keywords
                </label>
                <input
                  type="text"
                  value={campaignData.keywords}
                  onChange={(e) => updateCampaignData('keywords', e.target.value)}
                  placeholder="e.g., curso de inglês, english school, binational center"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Campaign Budget
                </label>
                <select
                  value={campaignData.budget}
                  onChange={(e) => updateCampaignData('budget', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select budget range</option>
                  <option value="5000-10000">R$ 5,000 - R$ 10,000</option>
                  <option value="10000-25000">R$ 10,000 - R$ 25,000</option>
                  <option value="25000-50000">R$ 25,000 - R$ 50,000</option>
                  <option value="50000+">R$ 50,000+</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Additional Unique Selling Points
              </label>
              <textarea
                value={campaignData.uniqueSellingPoints}
                onChange={(e) => updateCampaignData('uniqueSellingPoints', e.target.value)}
                placeholder="Any additional strengths or unique aspects you'd like to highlight..."
                rows={3}
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
          </div>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <button
              onClick={() => setActiveStep(2)}
              disabled={!campaignData.targetAudience || !campaignData.campaignObjective || !campaignData.tone}
              style={{
                backgroundColor: !campaignData.targetAudience || !campaignData.campaignObjective || !campaignData.tone ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: !campaignData.targetAudience || !campaignData.campaignObjective || !campaignData.tone ? 'not-allowed' : 'pointer'
              }}
            >
              Continue to Review →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Review & Generate */}
      {activeStep === 2 && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Review Your Campaign Settings</h3>
          
          <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <strong>Target Audience:</strong> {targetAudiences.find(a => a.id === campaignData.targetAudience)?.name}
              </div>
              <div>
                <strong>Campaign Objective:</strong> {campaignObjectives.find(o => o.id === campaignData.campaignObjective)?.name}
              </div>
              <div>
                <strong>Campaign Tone:</strong> {toneOptions.find(t => t.id === campaignData.tone)?.name}
              </div>
              {campaignData.keywords && (
                <div>
                  <strong>Keywords:</strong> {campaignData.keywords}
                </div>
              )}
              {campaignData.budget && (
                <div>
                  <strong>Budget:</strong> {campaignData.budget}
                </div>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setActiveStep(1)}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                marginRight: '12px',
                cursor: 'pointer'
              }}
            >
              ← Back to Edit
            </button>
            <button
              onClick={generateCampaignContent}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Generating Campaign...' : '🚀 Generate Campaign Content'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Generated Content */}
      {activeStep === 3 && (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Your Campaign Assets</h3>
            <button
              onClick={() => setActiveStep(1)}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Create New Campaign
            </button>
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Master Prompt */}
            <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>🎯 Master Prompt for AI</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                Copy this prompt to ChatGPT or Claude to generate additional content variations:
              </p>
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '16px',
                fontSize: '12px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {generatedContent.masterPrompt}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(generatedContent.masterPrompt)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  marginTop: '12px',
                  cursor: 'pointer'
                }}
              >
                📋 Copy to Clipboard
              </button>
            </div>

            {/* Copy Variations */}
            <div style={{ backgroundColor: 'white', border: '1px solid #d1d5db', padding: '24px', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>✍️ Generated Copy Variations</h4>
              <div style={{ display: 'grid', gap: '16px' }}>
                {generatedContent.copyVariations.map((copy, index) => (
                  <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{copy.type}</span>
                      <span style={{ fontSize: '12px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>
                        {copy.platform}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
                      {copy.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Suggestions */}
            <div style={{ backgroundColor: 'white', border: '1px solid #d1d5db', padding: '24px', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>🎨 Visual Content Suggestions</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {generatedContent.visualSuggestions.map((visual, index) => (
                  <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                      {visual.type}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                      Style: {visual.style}
                    </div>
                    <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.4' }}>
                      {visual.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign Strategy */}
            <div style={{ backgroundColor: '#fef7ed', border: '1px solid #fed7aa', padding: '24px', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>📈 Campaign Strategy</h4>
              <div style={{
                fontSize: '14px',
                color: '#4b5563',
                lineHeight: '1.6',
                whiteSpace: 'pre-line'
              }}>
                {generatedContent.campaignStrategy}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}