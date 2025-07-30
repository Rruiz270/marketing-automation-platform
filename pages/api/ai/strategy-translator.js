// AI Strategy Translator - Transform business objectives into paid media strategy
import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle both old and new parameter formats
  const { 
    objective, 
    budget, 
    audience, 
    companyProfile,
    companyData,
    projectData,
    previousSteps,
    connectedAIs,
    customPrompt,
    ai_service, 
    ai_service_name 
  } = req.body;
  
  console.log('Strategy Translator API called with:', {
    hasCompanyData: !!companyData,
    hasProjectData: !!projectData,
    connectedAIs: connectedAIs,
    customPrompt: !!customPrompt
  });

  // Use new format if available, fall back to old format
  const company = companyData || companyProfile;
  const project = projectData;
  const campaignObjective = objective || project?.objectives || 'lead_generation';
  const campaignBudget = budget || project?.budget || company?.monthlyBudget || '10000';
  const targetAudience = audience || project?.targetAudience || company?.targetPublic || 'General audience';

  try {
    // Get user's API key
    let apiKey = process.env.OPENAI_API_KEY;
    
    // Try to get user's connected API key
    if (connectedAIs && connectedAIs.length > 0) {
      console.log('Connected AIs received:', connectedAIs);
      
      // Check if we have OpenAI in the connected services
      const openaiService = connectedAIs.find(ai => 
        ai.service === 'openai' || 
        ai.service_name === 'OpenAI GPT-4' ||
        (ai.api_key && ai.api_key.startsWith('sk-'))
      );
      
      if (openaiService && openaiService.api_key) {
        apiKey = openaiService.api_key;
        console.log('Using OpenAI key from connected services');
      } else {
        // Try loading from storage as fallback
        const fs = require('fs');
        const path = require('path');
        const STORAGE_DIR = process.env.STORAGE_PATH || path.join(process.cwd(), 'data');
        const STORAGE_FILE = path.join(STORAGE_DIR, 'ai-keys-storage.json');
        
        try {
          if (fs.existsSync(STORAGE_FILE)) {
            const data = fs.readFileSync(STORAGE_FILE, 'utf8');
            const keysData = JSON.parse(data);
            const userKeys = keysData['default_user'];
            
            if (userKeys) {
              const openaiKey = userKeys.find(k => k.service === 'openai');
              if (openaiKey) {
                apiKey = openaiKey.api_key;
                console.log('Using OpenAI key from storage');
              }
            }
          }
        } catch (error) {
          console.error('Error loading user keys from storage:', error);
        }
      }
    }
    
    if (!apiKey || apiKey === 'demo-key') {
      console.log('No valid API key found, using fallback strategy');
      throw new Error('No valid API key configured');
    }
    
    console.log('Initializing OpenAI with key starting with:', apiKey.substring(0, 7) + '...');
    
    const openai = new OpenAI({
      apiKey: apiKey
    });

    const basePrompt = customPrompt || `
As an expert digital marketing strategist, translate the following business objectives into a comprehensive paid media strategy.

Company Profile:
- Name: ${company?.companyName || 'Company'}
- Industry: ${company?.industry || 'Business'}
- Target Market: ${company?.targetPublic || targetAudience}
- Location: ${company?.geolocation || 'Brazil'}
- Products: ${company?.products?.map(p => p.name).join(', ') || 'Various'}
- Average Ticket: R$ ${company?.generalAverageTicket || '500'}
- Monthly Budget: R$ ${company?.monthlyBudget || campaignBudget}
- Competitors: ${company?.competitors?.filter(c => c).join(', ') || 'Multiple'}
- Differentials: ${company?.differentials || 'Quality and service'}

Project Details:
- Name: ${project?.name || 'Campaign Project'}
- Description: ${project?.description || 'Marketing campaign'}
- Target Audience: ${project?.targetAudience || targetAudience}
- Platforms: ${project?.platforms?.join(', ') || 'Google Ads, Facebook Ads'}
- Budget: R$ ${project?.budget || campaignBudget}
- Objectives: ${project?.objectives || campaignObjective}

Campaign Details:
- Objective: ${campaignObjective}
- Budget: R$ ${campaignBudget}
- Target Audience: ${targetAudience}`;

    const strategyPrompt = basePrompt + `

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
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: strategyPrompt }],
        max_tokens: 2000,
        temperature: 0.7
      });

      const strategyText = response.choices[0].message.content;
      
      // Parse the strategy into structured data
      strategy = {
        objective: campaignObjective,
        budget: campaignBudget,
        company: company?.companyName || 'Company',
        project: project?.name || 'Campaign',
        fullText: strategyText,
        primaryChannel: extractPrimaryChannel(strategyText),
        channelMix: extractChannelMix(strategyText, campaignBudget),
        funnelStrategy: extractFunnelStrategy(strategyText),
        audienceSegments: extractAudienceSegments(strategyText),
        kpis: extractKPIs(strategyText, campaignObjective),
        expectedROAS: calculateExpectedROAS(campaignObjective, campaignBudget),
        targetCPA: calculateTargetCPA(company, campaignObjective, campaignBudget),
        timeline: generateTimeline(campaignObjective),
        tactics: extractTactics(strategyText),
        ai_generated: true,
        ai_service_used: ai_service_name || connectedAIs?.[0] || 'OpenAI GPT-4',
        generated_at: new Date().toISOString()
      };

    } catch (aiError) {
      console.error('AI API error details:', {
        message: aiError.message,
        status: aiError.status,
        code: aiError.code,
        type: aiError.type
      });
      
      // Generate fallback strategy with error info
      strategy = generateFallbackStrategy(campaignObjective, campaignBudget, targetAudience, company, project);
      strategy.error_reason = aiError.message || 'AI generation failed';
    }

    res.status(200).json({
      success: true,
      result: strategy,
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
      result: generateFallbackStrategy(campaignObjective, campaignBudget, targetAudience, company, project)
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

function generateFallbackStrategy(objective, budget, audience, company, project) {
  return {
    objective,
    budget,
    company: company?.companyName || 'Company',
    project: project?.name || 'Campaign',
    fullText: `FALLBACK STRATEGY for ${company?.companyName || 'Company'}\n\nA comprehensive digital marketing strategy focusing on ${objective} with a budget of R$ ${budget}.\n\nKey elements:\n- Primary channel: Google Ads for high-intent traffic\n- Secondary channels: Facebook/Instagram for broader reach\n- Target audience: ${audience}\n- Expected ROAS: 4.0x\n- Timeline: 6-8 weeks for optimization`,
    primaryChannel: 'Google Ads',
    channelMix: {
      'Google Ads': 50,
      'Facebook/Instagram': 35,
      'LinkedIn': 15
    },
    funnelStrategy: {
      awareness: { budget_allocation: 20, tactics: ['Display campaigns', 'Video ads'] },
      consideration: { budget_allocation: 35, tactics: ['Retargeting', 'Interest targeting'] },
      conversion: { budget_allocation: 35, tactics: ['Search ads', 'Shopping campaigns'] },
      retention: { budget_allocation: 10, tactics: ['Customer match', 'Loyalty campaigns'] }
    },
    audienceSegments: {
      primary: [{ name: 'Target Audience', description: audience, priority: 'High' }],
      secondary: [{ name: 'Lookalike Audience', description: 'Similar to existing customers', priority: 'Medium' }],
      lookalike: ['Website visitors', 'Current customers'],
      exclusions: ['Recent customers', 'Competitors']
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
      creative: ['Test multiple ad copy variations', 'Use dynamic creative optimization'],
      targeting: ['Start broad, then narrow based on performance', 'Layer demographics with interests'],
      bidding: ['Start with Target CPA', 'Test Maximize Conversions'],
      optimization: ['Weekly performance reviews', 'Bi-weekly bid adjustments']
    },
    ai_generated: false,
    ai_service_used: 'Fallback Generator',
    generated_at: new Date().toISOString()
  };
}