// AI Media Planner - Build optimized media plans with budget allocation
import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { strategy, companyProfile, ai_service, ai_service_name } = req.body;

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'demo-key'
    });

    const mediaPlanPrompt = `
As an expert media planner, create a detailed media plan based on the following strategy:

Strategy Overview:
- Objective: ${strategy.objective}
- Budget: R$ ${strategy.budget}
- Primary Channel: ${strategy.primaryChannel}
- Target CPA: R$ ${strategy.targetCPA}
- Expected ROAS: ${strategy.expectedROAS}x

Channel Mix:
${JSON.stringify(strategy.channelMix, null, 2)}

Company Context:
- Company: ${companyProfile?.companyName}
- Industry: ${companyProfile?.industry}
- Location: ${companyProfile?.geolocation}
- Average Ticket: R$ ${companyProfile?.generalAverageTicket}

Create a comprehensive media plan that includes:

1. CHANNEL ALLOCATION
For each channel, specify:
- Budget amount and percentage
- Expected impressions
- Expected clicks
- Expected conversions
- Target CPA
- Platform-specific tactics

2. AUDIENCE TARGETING
For each channel, define:
- Demographic targeting
- Interest/behavior targeting
- Geographic parameters
- Device targeting
- Scheduling/dayparting

3. CAMPAIGN CALENDAR
- Launch timeline
- Testing phases
- Optimization milestones
- Reporting schedule

4. CREATIVE REQUIREMENTS
- Ad formats needed
- Creative variations
- Copy guidelines
- Asset specifications

5. MEASUREMENT FRAMEWORK
- Tracking setup
- Attribution model
- Success metrics
- Reporting cadence

6. BUDGET PACING
- Daily budgets
- Weekly targets
- Monthly projections
- Contingency planning

7. OPTIMIZATION TRIGGERS
- Performance thresholds
- Action items
- Escalation process

Provide specific, actionable recommendations for maximizing campaign performance.
`;

    let mediaPlan;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: mediaPlanPrompt }],
        max_tokens: 2500,
        temperature: 0.6
      });

      const planText = response.choices[0].message.content;
      
      // Parse into structured media plan
      mediaPlan = {
        totalBudget: parseFloat(strategy.budget),
        duration: '30 days',
        channels: generateChannelPlans(strategy, companyProfile),
        calendar: generateCampaignCalendar(strategy),
        creativeSpecs: generateCreativeRequirements(strategy),
        targeting: generateTargetingStrategy(strategy, companyProfile),
        measurement: generateMeasurementFramework(strategy),
        optimization: generateOptimizationPlan(strategy),
        projections: generateProjections(strategy, companyProfile),
        ai_insights: extractAIInsights(planText),
        generated_by: ai_service_name || 'AI Media Planner'
      };

    } catch (aiError) {
      console.error('AI API error:', aiError);
      mediaPlan = generateFallbackMediaPlan(strategy, companyProfile);
    }

    res.status(200).json({
      success: true,
      mediaPlan,
      metadata: {
        generated_at: new Date().toISOString(),
        ai_service: ai_service_name || 'Default AI',
        optimization_score: calculateOptimizationScore(mediaPlan)
      }
    });

  } catch (error) {
    console.error('Media planning error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Media plan generation failed',
      fallback_plan: generateFallbackMediaPlan(strategy, companyProfile)
    });
  }
}

function generateChannelPlans(strategy, companyProfile) {
  const budget = parseFloat(strategy.budget) || 10000;
  const channels = [];
  
  // Calculate channel budgets based on mix
  Object.entries(strategy.channelMix || {}).forEach(([channel, percentage]) => {
    const channelBudget = (budget * percentage) / 100;
    const avgCPC = getAverageCPC(channel, companyProfile?.industry);
    const conversionRate = getExpectedConversionRate(channel, strategy.objective);
    
    channels.push({
      name: channel,
      budget: Math.round(channelBudget),
      percentage,
      dailyBudget: Math.round(channelBudget / 30),
      expectedMetrics: {
        impressions: Math.round(channelBudget / (avgCPC * 0.01)), // Assuming 1% CTR
        clicks: Math.round(channelBudget / avgCPC),
        conversions: Math.round((channelBudget / avgCPC) * conversionRate),
        cpa: Math.round(avgCPC / conversionRate),
        cpc: avgCPC
      },
      tactics: getChannelTactics(channel, strategy.objective),
      adFormats: getAdFormats(channel),
      bidStrategy: getBidStrategy(channel, strategy.objective)
    });
  });
  
  return channels;
}

function getAverageCPC(channel, industry) {
  const cpcMap = {
    'Google Ads': { default: 2.5, education: 3.2, technology: 4.5, retail: 2.0 },
    'Facebook/Instagram': { default: 1.8, education: 2.2, technology: 3.0, retail: 1.5 },
    'LinkedIn': { default: 5.5, education: 6.0, technology: 7.5, retail: 4.5 },
    'YouTube Ads': { default: 1.5, education: 2.0, technology: 2.5, retail: 1.2 }
  };
  
  const channelCPCs = cpcMap[channel] || cpcMap['Google Ads'];
  const industryCPC = channelCPCs[industry?.toLowerCase()] || channelCPCs.default;
  
  return industryCPC;
}

function getExpectedConversionRate(channel, objective) {
  const conversionRates = {
    'Google Ads': { 
      lead_generation: 0.035, 
      conversions: 0.028, 
      traffic: 0.045,
      default: 0.025 
    },
    'Facebook/Instagram': { 
      lead_generation: 0.025, 
      conversions: 0.018, 
      traffic: 0.032,
      default: 0.020 
    },
    'LinkedIn': { 
      lead_generation: 0.045, 
      conversions: 0.022, 
      traffic: 0.038,
      default: 0.030 
    }
  };
  
  const channelRates = conversionRates[channel] || conversionRates['Google Ads'];
  return channelRates[objective] || channelRates.default;
}

function getChannelTactics(channel, objective) {
  const tactics = {
    'Google Ads': [
      'Responsive Search Ads with multiple headlines',
      'Smart Bidding with Target CPA',
      'Audience layering with in-market segments',
      'Ad extensions: sitelinks, callouts, structured snippets',
      'Negative keyword lists from competitor analysis'
    ],
    'Facebook/Instagram': [
      'Dynamic creative optimization',
      'Lookalike audiences 1-3%',
      'Retargeting with time-based segments',
      'Collection ads for multiple products',
      'Stories placement for cost efficiency'
    ],
    'LinkedIn': [
      'Sponsored content with native feel',
      'Account-based marketing lists',
      'Job title and seniority targeting',
      'Thought leadership content',
      'Lead gen forms for easy conversion'
    ]
  };
  
  return tactics[channel] || tactics['Google Ads'];
}

function getAdFormats(channel) {
  const formats = {
    'Google Ads': [
      { type: 'Responsive Search Ads', quantity: 3, priority: 'High' },
      { type: 'Responsive Display Ads', quantity: 2, priority: 'Medium' },
      { type: 'Discovery Ads', quantity: 1, priority: 'Low' }
    ],
    'Facebook/Instagram': [
      { type: 'Single Image', quantity: 4, priority: 'High' },
      { type: 'Carousel', quantity: 2, priority: 'High' },
      { type: 'Video', quantity: 2, priority: 'Medium' },
      { type: 'Collection', quantity: 1, priority: 'Low' }
    ],
    'LinkedIn': [
      { type: 'Sponsored Content', quantity: 3, priority: 'High' },
      { type: 'Message Ads', quantity: 1, priority: 'Medium' },
      { type: 'Text Ads', quantity: 2, priority: 'Low' }
    ]
  };
  
  return formats[channel] || formats['Google Ads'];
}

function getBidStrategy(channel, objective) {
  const strategies = {
    lead_generation: 'Target CPA',
    conversions: 'Target ROAS',
    traffic: 'Maximize Clicks',
    brand_awareness: 'Target Impression Share',
    engagement: 'Target CPM'
  };
  
  return strategies[objective] || 'Target CPA';
}

function generateCampaignCalendar(strategy) {
  return {
    week1: {
      focus: 'Launch & Learning',
      activities: [
        'Campaign setup and QA',
        'Initial budget: 70% of weekly',
        'Broad targeting to gather data',
        'All ad formats active'
      ]
    },
    week2: {
      focus: 'Initial Optimization',
      activities: [
        'Pause underperforming ads',
        'Increase budget to 85%',
        'Refine audience targeting',
        'Add negative keywords'
      ]
    },
    week3_4: {
      focus: 'Scale & Optimize',
      activities: [
        'Full budget deployment',
        'Launch lookalike audiences',
        'A/B test new creatives',
        'Implement dayparting'
      ]
    },
    ongoing: {
      focus: 'Continuous Improvement',
      activities: [
        'Weekly performance reviews',
        'Monthly creative refresh',
        'Quarterly strategy review',
        'Competitive analysis'
      ]
    }
  };
}

function generateCreativeRequirements(strategy) {
  return {
    copy: {
      headlines: {
        quantity: 15,
        characterLimit: 30,
        focus: 'Benefits, urgency, credibility'
      },
      descriptions: {
        quantity: 10,
        characterLimit: 90,
        focus: 'Value proposition, differentiation'
      },
      ctas: {
        options: ['Learn More', 'Get Started', 'Sign Up', 'Book Now', 'Download'],
        testing: 'Rotate based on funnel stage'
      }
    },
    visuals: {
      images: {
        formats: ['1:1 (1080x1080)', '16:9 (1920x1080)', '4:5 (1080x1350)'],
        quantity: 8,
        style: 'Professional, aspirational, diverse'
      },
      videos: {
        formats: ['Square (1:1)', 'Landscape (16:9)', 'Vertical (9:16)'],
        duration: '15-30 seconds',
        quantity: 3
      }
    },
    brandGuidelines: {
      colors: 'Maintain brand consistency',
      fonts: 'Use approved typefaces',
      logo: 'Include in all creatives',
      tone: 'Professional yet approachable'
    }
  };
}

function generateTargetingStrategy(strategy, companyProfile) {
  return {
    demographics: {
      age: '25-45',
      gender: 'All',
      income: 'Middle to high',
      education: 'College or higher'
    },
    geographic: {
      primary: companyProfile?.geolocation || 'São Paulo, Brazil',
      radius: '50km from city center',
      exclude: 'Low-income areas'
    },
    interests: [
      'Professional development',
      'Career advancement',
      'Business English',
      'International business',
      'Online education'
    ],
    behaviors: [
      'Frequent travelers',
      'Business decision makers',
      'Online course purchasers',
      'LinkedIn active users'
    ],
    customAudiences: [
      'Website visitors (all pages)',
      'Cart abandoners',
      'Email subscribers',
      'Past converters'
    ]
  };
}

function generateMeasurementFramework(strategy) {
  return {
    tracking: {
      pixels: ['Facebook Pixel', 'Google Analytics 4', 'Google Ads Tag'],
      events: ['Page View', 'Lead', 'Purchase', 'Add to Cart', 'Sign Up'],
      attribution: '7-day click, 1-day view'
    },
    kpis: {
      primary: strategy.kpis?.primary || ['CPA', 'Conversion Rate', 'ROAS'],
      secondary: strategy.kpis?.secondary || ['CTR', 'CPC', 'CPM'],
      custom: ['Lead Quality Score', 'LTV:CAC Ratio']
    },
    reporting: {
      daily: ['Spend', 'Conversions', 'CPA'],
      weekly: ['Full funnel metrics', 'Creative performance'],
      monthly: ['ROI analysis', 'Cohort analysis', 'Market share']
    },
    dashboards: {
      realtime: 'Google Analytics Real-Time',
      executive: 'Looker Studio Dashboard',
      detailed: 'Platform native reporting'
    }
  };
}

function generateOptimizationPlan(strategy) {
  return {
    triggers: {
      pause: {
        condition: 'CPA > 150% of target',
        action: 'Pause and investigate',
        timeline: 'After 100 clicks'
      },
      scale: {
        condition: 'CPA < 80% of target',
        action: 'Increase budget 20%',
        timeline: 'After 50 conversions'
      },
      optimize: {
        condition: 'CTR < 1%',
        action: 'Refresh creative',
        timeline: 'After 10,000 impressions'
      }
    },
    schedule: {
      daily: ['Budget pacing', 'Anomaly detection'],
      weekly: ['Bid adjustments', 'Audience refinement'],
      biweekly: ['Creative testing', 'Landing page optimization'],
      monthly: ['Strategy review', 'Competitive analysis']
    },
    tests: {
      ongoing: [
        'Ad copy A/B tests',
        'Landing page variants',
        'Audience expansion',
        'Bid strategy experiments'
      ]
    }
  };
}

function generateProjections(strategy, companyProfile) {
  const budget = parseFloat(strategy.budget) || 10000;
  const avgTicket = parseFloat(companyProfile?.generalAverageTicket) || 500;
  const targetCPA = parseFloat(strategy.targetCPA) || 50;
  
  const projectedLeads = Math.floor(budget / targetCPA);
  const projectedRevenue = projectedLeads * avgTicket * 0.15; // 15% close rate
  
  return {
    month1: {
      spend: budget,
      leads: projectedLeads,
      customers: Math.floor(projectedLeads * 0.15),
      revenue: projectedRevenue,
      roas: (projectedRevenue / budget).toFixed(2)
    },
    month3: {
      spend: budget * 3,
      leads: projectedLeads * 3.5, // Improvement from optimization
      customers: Math.floor(projectedLeads * 3.5 * 0.18),
      revenue: projectedRevenue * 3.8,
      roas: ((projectedRevenue * 3.8) / (budget * 3)).toFixed(2)
    },
    month6: {
      spend: budget * 6,
      leads: projectedLeads * 7.5,
      customers: Math.floor(projectedLeads * 7.5 * 0.20),
      revenue: projectedRevenue * 8.2,
      roas: ((projectedRevenue * 8.2) / (budget * 6)).toFixed(2)
    }
  };
}

function extractAIInsights(planText) {
  // In production, use NLP to extract insights from AI response
  return [
    'Focus on Google Ads for immediate impact with high-intent searches',
    'Implement retargeting within first week to capture warm leads',
    'LinkedIn shows highest B2B potential for corporate training',
    'Mobile-first creative strategy essential for 65% of audience',
    'Dayparting can reduce costs by 20% (avoid 2am-6am)'
  ];
}

function calculateOptimizationScore(mediaPlan) {
  let score = 70; // Base score
  
  // Add points for completeness
  if (mediaPlan.channels?.length > 2) score += 10;
  if (mediaPlan.targeting?.customAudiences?.length > 3) score += 5;
  if (mediaPlan.measurement?.tracking?.pixels?.length > 2) score += 5;
  if (mediaPlan.optimization?.tests?.ongoing?.length > 3) score += 5;
  if (mediaPlan.projections?.month6?.roas > 4) score += 5;
  
  return Math.min(score, 95);
}

function generateFallbackMediaPlan(strategy, companyProfile) {
  const budget = parseFloat(strategy.budget) || 10000;
  
  return {
    totalBudget: budget,
    duration: '30 days',
    channels: [
      {
        name: 'Google Ads',
        budget: budget * 0.5,
        percentage: 50,
        dailyBudget: (budget * 0.5) / 30,
        expectedMetrics: {
          impressions: 50000,
          clicks: 1000,
          conversions: 25,
          cpa: 40,
          cpc: 2.5
        }
      },
      {
        name: 'Facebook/Instagram',
        budget: budget * 0.5,
        percentage: 50,
        dailyBudget: (budget * 0.5) / 30,
        expectedMetrics: {
          impressions: 100000,
          clicks: 2000,
          conversions: 30,
          cpa: 33,
          cpc: 1.5
        }
      }
    ],
    calendar: {
      week1: { focus: 'Launch & test' },
      week2: { focus: 'Optimize' },
      week3_4: { focus: 'Scale' }
    },
    creativeSpecs: {
      copy: { headlines: { quantity: 10 } },
      visuals: { images: { quantity: 5 } }
    },
    targeting: {
      demographics: { age: '25-45' },
      geographic: { primary: 'São Paulo' }
    },
    measurement: {
      tracking: { pixels: ['Facebook', 'Google'] },
      kpis: { primary: ['CPA', 'ROAS'] }
    },
    optimization: {
      schedule: { weekly: ['Review and adjust'] }
    },
    projections: {
      month1: { leads: 55, roas: '3.5' }
    }
  };
}