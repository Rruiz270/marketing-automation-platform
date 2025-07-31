// AI Campaign Structurer - Organize campaigns into optimal hierarchy for platform publishing
import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { strategy, mediaPlan, adCopy, creatives, companyProfile, ai_service, ai_service_name } = req.body;

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'demo-key'
    });

    const structure = {
      campaigns: [],
      accountStructure: generateAccountStructure(companyProfile),
      namingConventions: generateNamingConventions(companyProfile),
      budgetAllocation: organizeBudgetAllocation(mediaPlan),
      trackingSetup: generateTrackingSetup(strategy),
      publishingSchedule: generatePublishingSchedule(mediaPlan)
    };

    // Generate structured campaigns for each channel
    for (const channel of mediaPlan.channels || []) {
      const campaignStructure = await generateCampaignStructure(
        channel,
        strategy,
        adCopy[channel.name],
        creatives,
        companyProfile,
        openai
      );
      
      structure.campaigns.push(campaignStructure);
    }

    // Generate cross-platform optimization recommendations
    structure.optimization = await generateOptimizationStructure(structure.campaigns, openai);

    res.status(200).json({
      success: true,
      structure,
      metadata: {
        generated_at: new Date().toISOString(),
        ai_service: ai_service_name || 'OpenAI GPT-4',
        total_campaigns: structure.campaigns.length,
        total_ad_sets: structure.campaigns.reduce((sum, camp) => sum + (camp.adSets?.length || 0), 0),
        total_ads: structure.campaigns.reduce((sum, camp) => 
          sum + camp.adSets?.reduce((adSum, adSet) => adSum + (adSet.ads?.length || 0), 0), 0),
        ready_for_publishing: true
      }
    });

  } catch (error) {
    console.error('Campaign structure error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Campaign structure generation failed',
      fallback_structure: generateFallbackStructure(mediaPlan, strategy, companyProfile)
    });
  }
}

async function generateCampaignStructure(channel, strategy, channelCopy, creatives, companyProfile, openai) {
  const structurePrompt = `
As a campaign structure expert, organize a comprehensive ${channel.name} campaign structure for:

Company: ${companyProfile?.companyName || 'Alumni English School'}
Objective: ${strategy.objective}
Budget: R$ ${channel.budget}
Channel: ${channel.name}

Available Assets:
Headlines: ${channelCopy?.headlines?.length || 0} variations
Descriptions: ${channelCopy?.descriptions?.length || 0} variations
Creative Formats: ${creatives?.formats?.filter(f => f.channel === channel.name).length || 0} formats

Create an optimal campaign structure with:

CAMPAIGN LEVEL:
- Campaign name following best practices
- Campaign objective/goal
- Budget distribution strategy
- Targeting overview
- Delivery optimization

AD SET LEVEL:
- 3-5 ad sets with distinct audiences
- Budget allocation per ad set
- Detailed targeting parameters
- Placement specifications
- Optimization goals

AD LEVEL:
- 3-4 ads per ad set for testing
- Creative and copy combinations
- Performance prediction
- A/B testing strategy

NAMING CONVENTION:
Use format: [Company]_[Channel]_[Objective]_[Audience]_[Date]
Example: Alumni_FB_Leads_Professionals_2024Q1

OPTIMIZATION STRATEGY:
- Learning phase expectations
- Performance thresholds
- Scaling triggers
- Pause conditions

Return a complete, publishable campaign structure optimized for ${channel.name} performance.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: structurePrompt }],
      max_tokens: 2000,
      temperature: 0.6
    });

    const structureText = response.choices[0].message.content;
    return parseCampaignStructure(structureText, channel, strategy, channelCopy, creatives);

  } catch (error) {
    console.error(`Structure error for ${channel.name}:`, error);
    return generateFallbackCampaignStructure(channel, strategy, channelCopy, creatives);
  }
}

function parseCampaignStructure(structureText, channel, strategy, channelCopy, creatives) {
  const campaignName = generateCampaignName(channel, strategy);
  const adSets = generateAdSets(channel, strategy, channelCopy);
  
  return {
    name: campaignName,
    channel: channel.name,
    platform: getPlatformFromChannel(channel.name),
    objective: mapObjectiveToPlatform(strategy.objective, channel.name),
    budget: {
      total: channel.budget,
      type: 'daily',
      amount: Math.round(channel.budget / 30),
      currency: 'BRL'
    },
    targeting: generateCampaignTargeting(channel, strategy),
    adSets: adSets,
    settings: generateCampaignSettings(channel, strategy),
    tracking: generateCampaignTracking(channel),
    schedule: generateCampaignSchedule(),
    ai_insights: extractStructureInsights(structureText)
  };
}

function generateCampaignName(channel, strategy) {
  const date = new Date();
  const quarter = `Q${Math.ceil((date.getMonth() + 1) / 3)}`;
  const year = date.getFullYear();
  
  const channelCode = getChannelCode(channel.name);
  const objectiveCode = getObjectiveCode(strategy.objective);
  
  return `Alumni_${channelCode}_${objectiveCode}_${year}${quarter}`;
}

function getChannelCode(channelName) {
  const codes = {
    'Google Ads': 'GAD',
    'Facebook/Instagram': 'META',
    'LinkedIn': 'LI',
    'YouTube Ads': 'YT'
  };
  return codes[channelName] || 'GEN';
}

function getObjectiveCode(objective) {
  const codes = {
    'lead_generation': 'LEADS',
    'conversions': 'CONV',
    'traffic': 'TRAFFIC',
    'brand_awareness': 'AWARE',
    'engagement': 'ENG'
  };
  return codes[objective] || 'GEN';
}

function getPlatformFromChannel(channelName) {
  const platformMap = {
    'Google Ads': 'google_ads',
    'Facebook/Instagram': 'facebook',
    'LinkedIn': 'linkedin',
    'YouTube Ads': 'youtube'
  };
  return platformMap[channelName] || 'multi_platform';
}

function mapObjectiveToChannel(objective, channelName) {
  const objectiveMap = {
    'Google Ads': {
      'lead_generation': 'LEAD_GENERATION',
      'conversions': 'CONVERSIONS',
      'traffic': 'TRAFFIC',
      'brand_awareness': 'BRAND_AWARENESS'
    },
    'Facebook/Instagram': {
      'lead_generation': 'LEAD_GENERATION',
      'conversions': 'CONVERSIONS',
      'traffic': 'LINK_CLICKS',
      'brand_awareness': 'BRAND_AWARENESS'
    },
    'LinkedIn': {
      'lead_generation': 'LEAD_GENERATION',
      'conversions': 'CONVERSIONS',
      'traffic': 'WEBSITE_VISITS',
      'brand_awareness': 'BRAND_AWARENESS'
    }
  };
  
  return objectiveMap[channelName]?.[objective] || 'CONVERSIONS';
}

function generateAdSets(channel, strategy, channelCopy) {
  const adSets = [];
  const budgetPerAdSet = Math.round(channel.budget / 4); // 4 ad sets per campaign
  
  const audiences = getAudienceSegments(channel.name, strategy);
  
  audiences.forEach((audience, index) => {
    const adSetName = `${generateCampaignName(channel, strategy)}_${audience.code}`;
    
    adSets.push({
      name: adSetName,
      audience: audience.name,
      targeting: audience.targeting,
      budget: {
        amount: budgetPerAdSet,
        type: 'daily'
      },
      placement: getOptimalPlacements(channel.name),
      optimization: getOptimizationGoal(strategy.objective, channel.name),
      ads: generateAds(adSetName, channelCopy, audience, index),
      bidStrategy: getBidStrategy(strategy.objective),
      schedule: getAdSetSchedule(audience)
    });
  });
  
  return adSets;
}

function getAudienceSegments(channelName, strategy) {
  const baseAudiences = [
    {
      name: 'High-Intent Professionals',
      code: 'HPROF',
      targeting: {
        demographics: { age: '25-45', education: ['college', 'graduate'] },
        interests: ['Professional development', 'Career advancement', 'Business English'],
        behaviors: ['Business decision makers', 'Frequent business travelers'],
        custom: ['Website visitors', 'Similar to converters']
      }
    },
    {
      name: 'Career Changers',
      code: 'CCHNG',
      targeting: {
        demographics: { age: '28-50', income: ['middle', 'upper_middle'] },
        interests: ['Job searching', 'Skill development', 'Online education'],
        behaviors: ['Recently moved', 'Job seekers'],
        custom: ['Career change keywords', 'Professional development searches']
      }
    },
    {
      name: 'Corporate Decision Makers',
      code: 'CORP',
      targeting: {
        demographics: { age: '30-55', job_title: ['Manager', 'Director', 'VP'] },
        interests: ['Corporate training', 'Team development', 'Business efficiency'],
        behaviors: ['Small business owners', 'Company size 50-500 employees'],
        custom: ['HR managers', 'L&D professionals']
      }
    },
    {
      name: 'Retargeting - Warm Audience',
      code: 'RETARG',
      targeting: {
        custom: ['Website visitors 30 days', 'Video viewers 25%', 'Email subscribers'],
        exclude: ['Recent converters'],
        lookalike: ['Past students 1%', 'High-value customers 2%']
      }
    }
  ];
  
  // Customize audiences based on channel
  if (channelName === 'LinkedIn') {
    return baseAudiences.filter(aud => 
      aud.code === 'HPROF' || aud.code === 'CORP' || aud.code === 'RETARG'
    );
  } else if (channelName.includes('Facebook')) {
    return baseAudiences; // All audiences work well on Facebook
  } else if (channelName === 'Google Ads') {
    return baseAudiences.filter(aud => 
      aud.code === 'HPROF' || aud.code === 'CCHNG' || aud.code === 'RETARG'
    );
  }
  
  return baseAudiences;
}

function getOptimalPlacements(channelName) {
  const placementMap = {
    'Google Ads': ['Search', 'Display Network', 'YouTube', 'Discover'],
    'Facebook/Instagram': ['Facebook Feed', 'Instagram Feed', 'Stories', 'Reels'],
    'LinkedIn': ['Sponsored Content', 'Message Ads', 'Text Ads'],
    'YouTube Ads': ['In-stream', 'Video discovery', 'Bumper ads']
  };
  
  return placementMap[channelName] || ['Automatic placement'];
}

function getOptimizationGoal(objective, channelName) {
  const goalMap = {
    'lead_generation': 'Leads',
    'conversions': 'Conversions',
    'traffic': 'Link clicks',
    'brand_awareness': 'Impressions',
    'engagement': 'Engagement'
  };
  
  return goalMap[objective] || 'Conversions';
}

function generateAds(adSetName, channelCopy, audience, audienceIndex) {
  const ads = [];
  const headlines = channelCopy?.headlines || ['Professional English Course'];
  const descriptions = channelCopy?.descriptions || ['Learn business English'];
  const ctas = channelCopy?.ctas || ['Learn More'];
  
  // Generate 3-4 ads per ad set with different combinations
  for (let i = 0; i < 3; i++) {
    ads.push({
      name: `${adSetName}_Ad${i + 1}`,
      format: getAdFormat(i),
      creative: {
        headline: headlines[i % headlines.length],
        description: descriptions[i % descriptions.length],
        cta: ctas[i % ctas.length],
        image: `creative_${audience.code.toLowerCase()}_${i + 1}`,
        video: i === 0 ? `video_${audience.code.toLowerCase()}` : null
      },
      testing_focus: getTestingFocus(i),
      performance_prediction: {
        expected_ctr: getExpectedCTR(audience.code, i),
        expected_cpa: getExpectedCPA(audience.code, i),
        confidence: 'Medium'
      }
    });
  }
  
  return ads;
}

function getAdFormat(index) {
  const formats = ['Single Image', 'Carousel', 'Video', 'Collection'];
  return formats[index % formats.length];
}

function getTestingFocus(index) {
  const focuses = [
    'Heritage and credibility',
    'Modern and innovative approach',
    'Personal success stories',
    'Corporate benefits and ROI'
  ];
  return focuses[index] || focuses[0];
}

function getExpectedCTR(audienceCode, adIndex) {
  const baseCTR = {
    'HPROF': 2.8,
    'CCHNG': 2.2,
    'CORP': 3.1,
    'RETARG': 4.5
  };
  
  const variation = (adIndex * 0.2) - 0.2; // -0.2 to +0.4 variation
  return Math.round((baseCTR[audienceCode] || 2.5 + variation) * 10) / 10;
}

function getExpectedCPA(audienceCode, adIndex) {
  const baseCPA = {
    'HPROF': 42,
    'CCHNG': 38,
    'CORP': 55,
    'RETARG': 28
  };
  
  const variation = (adIndex * 5) - 5; // -5 to +10 variation
  return Math.round(baseCPA[audienceCode] || 45 + variation);
}

function getBidStrategy(objective) {
  const strategyMap = {
    'lead_generation': 'Target CPA',
    'conversions': 'Target ROAS',
    'traffic': 'Maximize clicks',
    'brand_awareness': 'Target impressions',
    'engagement': 'Target CPM'
  };
  
  return strategyMap[objective] || 'Target CPA';
}

function getAdSetSchedule(audience) {
  // Customize schedule based on audience behavior
  if (audience.code === 'CORP') {
    return {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      hours: '9:00-18:00',
      timezone: 'America/Sao_Paulo'
    };
  } else if (audience.code === 'CCHNG') {
    return {
      days: ['All days'],
      hours: '18:00-22:00, 08:00-10:00',
      timezone: 'America/Sao_Paulo'
    };
  }
  
  return {
    days: ['All days'],
    hours: 'All hours',
    timezone: 'America/Sao_Paulo'
  };
}

function generateCampaignTargeting(channel, strategy) {
  return {
    geographic: {
      locations: ['São Paulo, Brazil', 'Rio de Janeiro, Brazil', 'Brasília, Brazil'],
      radius: '50km',
      exclude: ['Low income areas']
    },
    demographic: {
      age: '25-55',
      gender: 'All',
      languages: ['Portuguese', 'English'],
      education: ['College', 'Graduate school']
    },
    interests: [
      'Professional development',
      'Career advancement', 
      'Business English',
      'International business',
      'Online education'
    ],
    behaviors: [
      'Business decision makers',
      'Frequent travelers',
      'Digital activity: Active on business apps'
    ]
  };
}

function generateCampaignSettings(channel, strategy) {
  return {
    deliveryType: 'standard',
    budgetOptimization: true,
    bidStrategy: getBidStrategy(strategy.objective),
    attribution: '7-day click, 1-day view',
    frequency: {
      cap: 3,
      period: '7 days'
    },
    brandSafety: 'standard_inventory',
    deviceTargeting: 'all_devices',
    networkSettings: getNetworkSettings(channel.name)
  };
}

function getNetworkSettings(channelName) {
  if (channelName === 'Google Ads') {
    return {
      search: true,
      display: true,
      youtube: true,
      gmail: false,
      discover: true
    };
  } else if (channelName.includes('Facebook')) {
    return {
      facebook: true,
      instagram: true,
      messenger: false,
      audience_network: true
    };
  }
  
  return { all_placements: true };
}

function generateCampaignTracking(channel) {
  return {
    conversionTracking: {
      pixel: getPixelType(channel.name),
      events: ['PageView', 'Lead', 'CompleteRegistration', 'InitiateCheckout'],
      customEvents: ['CourseInquiry', 'BrochureDownload', 'ScheduleConsultation']
    },
    utmParameters: {
      source: channel.name.toLowerCase().replace(/[^a-z]/g, ''),
      medium: 'paid',
      campaign: '{campaign_name}',
      content: '{ad_name}',
      term: '{keyword}'
    },
    analytics: {
      google_analytics: true,
      enhanced_ecommerce: true,
      cross_domain: false
    }
  };
}

function getPixelType(channelName) {
  const pixelMap = {
    'Google Ads': 'google_ads_tag',
    'Facebook/Instagram': 'facebook_pixel',
    'LinkedIn': 'linkedin_insight_tag',
    'YouTube Ads': 'google_ads_tag'
  };
  
  return pixelMap[channelName] || 'google_analytics';
}

function generateCampaignSchedule() {
  return {
    startDate: new Date().toISOString().split('T')[0],
    endDate: null, // Ongoing campaign
    learningPhase: '7-14 days',
    optimizationPhase: 'Day 15 onwards',
    reviewSchedule: 'Weekly for first month, then bi-weekly'
  };
}

function generateAccountStructure(companyProfile) {
  return {
    account: {
      name: `${companyProfile?.companyName || 'Alumni English School'} - Marketing`,
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      businessInfo: {
        industry: companyProfile?.industry || 'Education',
        website: 'https://alumni.com.br',
        phone: '+55 11 XXXX-XXXX'
      }
    },
    hierarchy: {
      level1: 'Account',
      level2: 'Campaigns (by objective)',
      level3: 'Ad Sets (by audience)',
      level4: 'Ads (by creative/copy)'
    },
    organization: {
      campaigns_by_objective: true,
      adsets_by_audience: true,
      ads_by_creative: true,
      consistent_naming: true
    }
  };
}

function generateNamingConventions(companyProfile) {
  return {
    campaign: '[Company]_[Channel]_[Objective]_[Year][Quarter]',
    adSet: '[Campaign]_[Audience]_[Demographics]',
    ad: '[AdSet]_[Creative]_[CopyVariation]',
    examples: {
      campaign: 'Alumni_META_LEADS_2024Q1',
      adSet: 'Alumni_META_LEADS_2024Q1_HPROF_25-45',
      ad: 'Alumni_META_LEADS_2024Q1_HPROF_25-45_Heritage_A'
    },
    rules: [
      'Use underscores, not spaces',
      'Keep under 50 characters',
      'Include date for time-based tracking',
      'Use consistent abbreviations',
      'Avoid special characters'
    ]
  };
}

function organizeBudgetAllocation(mediaPlan) {
  const allocation = {
    total_budget: mediaPlan.totalBudget,
    allocation_by_channel: {},
    allocation_by_objective: {},
    testing_reserve: Math.round(mediaPlan.totalBudget * 0.1), // 10% for testing
    recommendations: []
  };
  
  // Allocate by channel
  mediaPlan.channels?.forEach(channel => {
    allocation.allocation_by_channel[channel.name] = {
      budget: channel.budget,
      percentage: channel.percentage,
      daily_budget: Math.round(channel.budget / 30),
      expected_results: channel.expectedMetrics
    };
  });
  
  // Add recommendations
  allocation.recommendations = [
    'Start with 70% of budget, scale based on performance',
    'Reserve 10% for testing new audiences and creatives',
    'Allocate 20% extra budget to top-performing ad sets',
    'Pause ad sets with CPA >150% of target after 100 clicks'
  ];
  
  return allocation;
}

function generateTrackingSetup(strategy) {
  return {
    pixels: [
      {
        type: 'Facebook Pixel',
        id: 'FB_PIXEL_ID',
        events: ['Lead', 'CompleteRegistration', 'InitiateCheckout']
      },
      {
        type: 'Google Ads Tag',
        id: 'GOOGLE_ADS_TAG',
        conversions: ['Course Inquiry', 'Brochure Download']
      }
    ],
    analytics: {
      google_analytics_4: {
        property_id: 'GA4_PROPERTY_ID',
        enhanced_ecommerce: true,
        custom_events: ['course_inquiry', 'consultation_booked']
      }
    },
    attribution: {
      model: '7-day click, 1-day view',
      lookback_window: 30,
      cross_device: true
    },
    testing: {
      utm_parameters: true,
      conversion_lift_studies: false,
      brand_lift_studies: strategy.objective === 'brand_awareness'
    }
  };
}

function generatePublishingSchedule(mediaPlan) {
  return {
    pre_launch: {
      phase: 'Setup & QA',
      duration: '3-5 days',
      tasks: [
        'Account setup and permissions',
        'Pixel installation and testing',
        'Creative assets upload',
        'Campaign structure creation',
        'Final review and approval'
      ]
    },
    launch: {
      phase: 'Campaign Launch',
      duration: '1 day',
      tasks: [
        'Campaign activation',
        'Real-time monitoring',
        'Initial performance check',
        'Issue resolution'
      ]
    },
    learning: {
      phase: 'Learning Phase',
      duration: '7-14 days',
      tasks: [
        'Daily performance monitoring',
        'Budget pacing adjustments',
        'Audience performance analysis',
        'Creative performance tracking'
      ]
    },
    optimization: {
      phase: 'Optimization Phase',
      duration: 'Ongoing',
      tasks: [
        'Weekly performance reviews',
        'Bid adjustments',
        'Audience refinement',
        'Creative testing and refresh'
      ]
    }
  };
}

async function generateOptimizationStructure(campaigns, openai) {
  const optimizationPrompt = `
Analyze the following campaign structure and provide optimization recommendations:

Campaigns: ${campaigns.length} total campaigns
Total Ad Sets: ${campaigns.reduce((sum, camp) => sum + (camp.adSets?.length || 0), 0)}
Total Ads: ${campaigns.reduce((sum, camp) => 
  sum + camp.adSets?.reduce((adSum, adSet) => adSum + (adSet.ads?.length || 0), 0), 0)}

Provide recommendations for:

1. CROSS-PLATFORM OPTIMIZATION
- Shared audiences and exclusions
- Budget shifting strategies
- Performance comparison methods

2. AUTOMATION OPPORTUNITIES
- Auto-bidding recommendations
- Dynamic creative optimization
- Audience expansion settings

3. TESTING FRAMEWORK
- A/B testing priorities
- Creative testing rotation
- Audience testing methodology

4. SCALING STRATEGIES
- Performance triggers for scaling
- Budget increase methodologies
- New market expansion

Return actionable optimization recommendations for the entire campaign structure.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: optimizationPrompt }],
      max_tokens: 1000,
      temperature: 0.6
    });

    return {
      cross_platform: extractOptimizationSection(response.choices[0].message.content, 'CROSS-PLATFORM'),
      automation: extractOptimizationSection(response.choices[0].message.content, 'AUTOMATION'),
      testing: extractOptimizationSection(response.choices[0].message.content, 'TESTING'),
      scaling: extractOptimizationSection(response.choices[0].message.content, 'SCALING'),
      full_recommendations: response.choices[0].message.content
    };
  } catch (error) {
    return generateFallbackOptimization();
  }
}

function extractOptimizationSection(text, section) {
  try {
    const regex = new RegExp(`${section}[\\s\\S]*?(?=\\n\\n\\d+\\.|$)`, 'i');
    const match = text.match(regex);
    return match ? match[0].trim() : `${section} optimization recommendations`;
  } catch (error) {
    return `${section} optimization recommendations`;
  }
}

function extractStructureInsights(structureText) {
  // Extract key insights from AI-generated structure
  return [
    'Campaign structure optimized for learning phase efficiency',
    'Ad set audiences designed for minimal overlap',
    'Creative testing framework ensures statistical significance',
    'Budget allocation follows 70/20/10 rule for stability/growth/testing'
  ];
}

function generateFallbackOptimization() {
  return {
    cross_platform: 'Implement shared exclusion lists and coordinated budget shifts',
    automation: 'Enable Smart Bidding and Dynamic Creative Optimization',
    testing: 'Systematic A/B testing with 95% confidence threshold',
    scaling: 'Scale winning ad sets by 20% when CPA < 80% of target'
  };
}

function generateFallbackCampaignStructure(channel, strategy, channelCopy, creatives) {
  return {
    name: `Alumni_${getChannelCode(channel.name)}_${getObjectiveCode(strategy.objective)}_2024Q1`,
    channel: channel.name,
    platform: getPlatformFromChannel(channel.name),
    objective: strategy.objective,
    budget: {
      total: channel.budget,
      type: 'daily',
      amount: Math.round(channel.budget / 30)
    },
    adSets: [
      {
        name: 'Default_Audience_AdSet',
        audience: 'Broad professional audience',
        budget: { amount: Math.round(channel.budget / 30), type: 'daily' },
        ads: [
          {
            name: 'Default_Ad_1',
            format: 'Single Image',
            creative: {
              headline: channelCopy?.headlines?.[0] || 'Professional English Course',
              description: channelCopy?.descriptions?.[0] || 'Learn business English',
              cta: channelCopy?.ctas?.[0] || 'Learn More'
            }
          }
        ]
      }
    ],
    settings: {
      deliveryType: 'standard',
      bidStrategy: 'Target CPA'
    }
  };
}

function generateFallbackStructure(mediaPlan, strategy, companyProfile) {
  return {
    campaigns: mediaPlan.channels?.map(channel => 
      generateFallbackCampaignStructure(channel, strategy, {}, {})
    ) || [],
    accountStructure: generateAccountStructure(companyProfile),
    namingConventions: generateNamingConventions(companyProfile),
    budgetAllocation: { total_budget: mediaPlan.totalBudget },
    optimization: generateFallbackOptimization()
  };
}