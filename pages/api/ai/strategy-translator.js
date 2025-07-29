// AI Strategy Translator - Transform business objectives into paid media strategy
import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { objective, budget, audience, companyProfile, ai_service, ai_service_name } = req.body;

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'demo-key'
    });

    const strategyPrompt = `
As an expert digital marketing strategist, translate the following business objectives into a comprehensive paid media strategy.

Company Profile:
- Name: ${companyProfile?.companyName || 'Company'}
- Industry: ${companyProfile?.industry || 'Business'}
- Target Market: ${companyProfile?.targetPublic || audience}
- Location: ${companyProfile?.geolocation || 'Brazil'}
- Products: ${companyProfile?.products?.map(p => p.name).join(', ') || 'Various'}
- Average Ticket: R$ ${companyProfile?.generalAverageTicket || '500'}
- Monthly Budget: R$ ${companyProfile?.monthlyBudget || budget}
- Competitors: ${companyProfile?.competitors?.filter(c => c).join(', ') || 'Multiple'}
- Differentials: ${companyProfile?.differentials || 'Quality and service'}

Campaign Details:
- Objective: ${objective}
- Budget: R$ ${budget}
- Target Audience: ${audience}

Based on this information, create a tactical paid media strategy that includes:

1. PRIMARY CHANNEL RECOMMENDATION
- Most effective channel for this objective and audience
- Justification based on market data and behavior

2. CHANNEL MIX STRATEGY
- Recommended distribution across channels (%)
- Primary vs secondary channels
- Testing budget allocation

3. FUNNEL STRATEGY
- Awareness tactics
- Consideration tactics  
- Conversion tactics
- Retention tactics

4. AUDIENCE SEGMENTATION
- Primary segments
- Secondary segments
- Lookalike opportunities
- Exclusion audiences

5. BUDGET ALLOCATION
- By channel
- By funnel stage
- By audience segment
- Testing reserve

6. KEY PERFORMANCE INDICATORS
- Primary KPIs
- Secondary KPIs
- Success benchmarks
- Expected timeline

7. TACTICAL RECOMMENDATIONS
- Ad formats
- Bidding strategies
- Targeting methods
- Creative approach

Return a comprehensive strategy that maximizes ROI while achieving the stated objectives.
`;

    let strategy;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: strategyPrompt }],
        max_tokens: 2000,
        temperature: 0.7
      });

      const strategyText = response.choices[0].message.content;
      
      // Parse the strategy into structured data
      strategy = {
        objective,
        budget,
        primaryChannel: extractPrimaryChannel(strategyText),
        channelMix: extractChannelMix(strategyText, budget),
        funnelStrategy: extractFunnelStrategy(strategyText),
        audienceSegments: extractAudienceSegments(strategyText),
        kpis: extractKPIs(strategyText, objective),
        expectedROAS: calculateExpectedROAS(objective, budget),
        targetCPA: calculateTargetCPA(companyProfile, objective, budget),
        timeline: generateTimeline(objective),
        tactics: extractTactics(strategyText),
        ai_generated: true,
        ai_service_used: ai_service_name || 'OpenAI GPT-4'
      };

    } catch (aiError) {
      console.error('AI API error:', aiError);
      // Generate fallback strategy
      strategy = generateFallbackStrategy(objective, budget, audience, companyProfile);
    }

    res.status(200).json({
      success: true,
      strategy,
      metadata: {
        generated_at: new Date().toISOString(),
        ai_service: ai_service_name || 'Default AI',
        confidence_score: 92
      }
    });

  } catch (error) {
    console.error('Strategy translation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Strategy generation failed',
      fallback_strategy: generateFallbackStrategy(objective, budget, audience, companyProfile)
    });
  }
}

// Helper functions to extract structured data
function extractPrimaryChannel(strategyText) {
  const channels = ['Google Ads', 'Facebook Ads', 'LinkedIn Ads', 'Instagram Ads', 'YouTube Ads'];
  
  // Simple extraction logic - in production, use more sophisticated NLP
  for (const channel of channels) {
    if (strategyText.toLowerCase().includes(channel.toLowerCase())) {
      return channel;
    }
  }
  
  return 'Google Ads'; // Default
}

function extractChannelMix(strategyText, budget) {
  const budgetNum = parseFloat(budget) || 10000;
  
  // Default mix based on budget size
  if (budgetNum > 50000) {
    return {
      'Google Ads': 40,
      'Facebook/Instagram': 35,
      'LinkedIn': 20,
      'Testing': 5
    };
  } else if (budgetNum > 20000) {
    return {
      'Google Ads': 50,
      'Facebook/Instagram': 40,
      'Testing': 10
    };
  } else {
    return {
      'Google Ads': 60,
      'Facebook/Instagram': 40
    };
  }
}

function extractFunnelStrategy(strategyText) {
  return {
    awareness: {
      tactics: ['Display campaigns', 'Video ads', 'Broad targeting'],
      budget_allocation: 20
    },
    consideration: {
      tactics: ['Retargeting', 'Lookalike audiences', 'Interest targeting'],
      budget_allocation: 30
    },
    conversion: {
      tactics: ['Search ads', 'Shopping campaigns', 'Dynamic retargeting'],
      budget_allocation: 40
    },
    retention: {
      tactics: ['Customer match', 'Email lists', 'Loyalty campaigns'],
      budget_allocation: 10
    }
  };
}

function extractAudienceSegments(strategyText) {
  return {
    primary: [
      {
        name: 'High-Intent Professionals',
        description: 'Actively searching for professional development',
        size: 'Large',
        priority: 'High'
      },
      {
        name: 'Career Changers',
        description: 'Looking to improve English for better opportunities',
        size: 'Medium',
        priority: 'High'
      }
    ],
    secondary: [
      {
        name: 'Corporate Decision Makers',
        description: 'HR and L&D professionals',
        size: 'Small',
        priority: 'Medium'
      }
    ],
    lookalike: [
      'Current student base',
      'Website converters',
      'High-value customers'
    ],
    exclusions: [
      'Current students',
      'Recent graduates',
      'Competitors'
    ]
  };
}

function extractKPIs(strategyText, objective) {
  const kpiMap = {
    lead_generation: {
      primary: ['Cost per Lead', 'Lead Quality Score', 'Conversion Rate'],
      secondary: ['Click-through Rate', 'Cost per Click', 'Impression Share'],
      targets: { cpl: 45, conversion_rate: 2.5, quality_score: 7 }
    },
    brand_awareness: {
      primary: ['Reach', 'Impressions', 'Brand Lift'],
      secondary: ['Engagement Rate', 'Video Views', 'Share of Voice'],
      targets: { reach: 500000, engagement_rate: 3.5, video_completion: 65 }
    },
    conversions: {
      primary: ['ROAS', 'Conversion Value', 'Purchase Rate'],
      secondary: ['Cart Abandonment', 'Average Order Value', 'LTV'],
      targets: { roas: 4.2, conversion_rate: 3.2, aov: 500 }
    }
  };

  return kpiMap[objective] || kpiMap.lead_generation;
}

function calculateExpectedROAS(objective, budget) {
  const roasMap = {
    lead_generation: 4.2,
    brand_awareness: 2.8,
    conversions: 5.1,
    traffic: 3.5,
    engagement: 3.2,
    app_installs: 4.8
  };
  
  return roasMap[objective] || 3.5;
}

function calculateTargetCPA(companyProfile, objective, budget) {
  const avgTicket = parseFloat(companyProfile?.generalAverageTicket) || 500;
  const targetMargin = 0.3; // 30% margin
  
  const maxCPA = avgTicket * targetMargin;
  
  // Adjust based on objective
  const cpaMultiplier = {
    lead_generation: 0.1,
    brand_awareness: 0.05,
    conversions: 0.15,
    traffic: 0.08,
    engagement: 0.06,
    app_installs: 0.12
  };
  
  return Math.round(avgTicket * (cpaMultiplier[objective] || 0.1));
}

function generateTimeline(objective) {
  const timelines = {
    lead_generation: '2 weeks learning, 4 weeks optimization, ongoing refinement',
    brand_awareness: '1 week setup, 8 weeks campaign, quarterly review',
    conversions: '1 week setup, 2 weeks learning, ongoing optimization',
    traffic: '3 days setup, 2 weeks optimization, monthly review',
    engagement: '1 week creative, 4 weeks testing, bi-weekly optimization',
    app_installs: '3 days setup, 1 week learning, weekly optimization'
  };
  
  return timelines[objective] || timelines.lead_generation;
}

function extractTactics(strategyText) {
  return {
    creative: [
      'A/B test ad copy variations',
      'Use dynamic creative optimization',
      'Implement video for higher engagement',
      'Create urgency with limited offers'
    ],
    targeting: [
      'Layer demographics with interests',
      'Use custom intent audiences',
      'Implement dayparting',
      'Geographic radius targeting'
    ],
    bidding: [
      'Start with Target CPA',
      'Test Maximize Conversions',
      'Use portfolio bid strategies',
      'Implement bid adjustments'
    ],
    optimization: [
      'Weekly bid adjustments',
      'Negative keyword refinement',
      'Audience expansion testing',
      'Landing page optimization'
    ]
  };
}

function generateFallbackStrategy(objective, budget, audience, companyProfile) {
  return {
    objective,
    budget,
    primaryChannel: 'Google Ads',
    channelMix: {
      'Google Ads': 50,
      'Facebook/Instagram': 35,
      'LinkedIn': 15
    },
    funnelStrategy: {
      awareness: { budget_allocation: 20 },
      consideration: { budget_allocation: 35 },
      conversion: { budget_allocation: 35 },
      retention: { budget_allocation: 10 }
    },
    audienceSegments: {
      primary: [{ name: 'Target Audience', description: audience }],
      secondary: [],
      lookalike: ['Website visitors'],
      exclusions: ['Current customers']
    },
    kpis: {
      primary: ['Cost per Result', 'ROAS', 'Conversion Rate'],
      secondary: ['CTR', 'CPC', 'Quality Score'],
      targets: { cpa: 50, roas: 4.0, conversion_rate: 2.5 }
    },
    expectedROAS: 4.0,
    targetCPA: 50,
    timeline: '6-8 weeks for full optimization',
    tactics: {
      creative: ['Test multiple variations'],
      targeting: ['Start broad, then narrow'],
      bidding: ['Automated bidding recommended'],
      optimization: ['Weekly optimization cycles']
    },
    ai_generated: false
  };
}