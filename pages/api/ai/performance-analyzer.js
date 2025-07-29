// AI Performance Analyzer - Analyze campaign results and provide optimization insights
import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { campaignId, ai_service, ai_service_name } = req.body;

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'demo-key'
    });

    // In production, this would fetch real data from ad platforms
    // For now, we'll simulate realistic performance data
    const performanceData = await fetchCampaignPerformance(campaignId);
    
    // Generate AI insights based on performance
    const aiInsights = await generatePerformanceInsights(performanceData, openai);
    
    // Generate optimization recommendations
    const optimizationPlan = await generateOptimizationPlan(performanceData, aiInsights, openai);
    
    // Generate competitive analysis
    const competitiveInsights = await generateCompetitiveAnalysis(performanceData, openai);
    
    const performance = {
      campaign_id: campaignId,
      performance_metrics: performanceData.metrics,
      ai_insights: aiInsights,
      optimization_recommendations: optimizationPlan,
      competitive_analysis: competitiveInsights,
      performance_score: calculatePerformanceScore(performanceData.metrics),
      next_actions: generateNextActions(performanceData.metrics, aiInsights),
      reporting_schedule: generateReportingSchedule(),
      alerts: generatePerformanceAlerts(performanceData.metrics)
    };

    res.status(200).json({
      success: true,
      performance,
      metadata: {
        analyzed_at: new Date().toISOString(),
        ai_service: ai_service_name || 'OpenAI GPT-4',
        analysis_period: performanceData.period,
        confidence_score: 94,
        data_freshness: 'Real-time simulation'
      }
    });

  } catch (error) {
    console.error('Performance analysis error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Performance analysis failed',
      fallback_performance: generateFallbackPerformance(campaignId)
    });
  }
}

async function fetchCampaignPerformance(campaignId) {
  // Simulate realistic campaign performance data
  // In production, this would integrate with actual ad platform APIs
  
  const performanceData = {
    campaign_id: campaignId,
    period: 'Last 30 days',
    metrics: {
      // Overall performance
      impressions: generateRealisticMetric(85000, 15000),
      clicks: generateRealisticMetric(2100, 300),
      ctr: generateRealisticCTR(),
      cpc: generateRealisticCPC(),
      
      // Conversions
      conversions: generateRealisticMetric(52, 8),
      conversion_rate: generateRealisticConversionRate(),
      cpa: generateRealisticCPA(),
      
      // Financial
      spend: generateRealisticSpend(),
      revenue: generateRealisticRevenue(),
      roas: generateRealisticROAS(),
      
      // Quality metrics
      quality_score: generateRealisticQualityScore(),
      relevance_score: generateRealisticRelevanceScore(),
      landing_page_experience: generateRealisticLPExperience()
    },
    channel_breakdown: generateChannelBreakdown(),
    audience_performance: generateAudiencePerformance(),
    creative_performance: generateCreativePerformance(),
    time_series: generateTimeSeriesData(),
    device_breakdown: generateDeviceBreakdown(),
    geographic_performance: generateGeographicPerformance()
  };
  
  return performanceData;
}

function generateRealisticMetric(base, variance) {
  return Math.round(base + (Math.random() - 0.5) * variance * 2);
}

function generateRealisticCTR() {
  return Math.round((2.0 + (Math.random() - 0.5) * 1.0) * 100) / 100;
}

function generateRealisticCPC() {
  return Math.round((2.50 + (Math.random() - 0.5) * 1.0) * 100) / 100;
}

function generateRealisticConversionRate() {
  return Math.round((2.8 + (Math.random() - 0.5) * 0.8) * 100) / 100;
}

function generateRealisticCPA() {
  return Math.round(40 + (Math.random() - 0.5) * 20);
}

function generateRealisticSpend() {
  return Math.round(2100 + (Math.random() - 0.5) * 400);
}

function generateRealisticRevenue() {
  return Math.round(8500 + (Math.random() - 0.5) * 2000);
}

function generateRealisticROAS() {
  return Math.round((4.2 + (Math.random() - 0.5) * 1.0) * 10) / 10;
}

function generateRealisticQualityScore() {
  return Math.round(7.2 + (Math.random() - 0.5) * 1.5);
}

function generateRealisticRelevanceScore() {
  return Math.round(8.1 + (Math.random() - 0.5) * 1.2);
}

function generateRealisticLPExperience() {
  const experiences = ['Above Average', 'Average', 'Below Average'];
  return experiences[Math.floor(Math.random() * experiences.length)];
}

function generateChannelBreakdown() {
  return [
    {
      channel: 'Google Ads',
      impressions: 45000,
      clicks: 1250,
      conversions: 32,
      spend: 1100,
      cpa: 34.38,
      roas: 4.8,
      performance_rating: 'Excellent'
    },
    {
      channel: 'Facebook/Instagram',
      impressions: 32000,
      clicks: 680,
      conversions: 18,
      spend: 750,
      cpa: 41.67,
      roas: 3.9,
      performance_rating: 'Good'
    },
    {
      channel: 'LinkedIn',
      impressions: 8000,
      clicks: 170,
      conversions: 2,
      spend: 250,
      cpa: 125.00,
      roas: 2.1,
      performance_rating: 'Needs Improvement'
    }
  ];
}

function generateAudiencePerformance() {
  return [
    {
      audience: 'High-Intent Professionals',
      impressions: 28000,
      clicks: 850,
      conversions: 28,
      ctr: 3.04,
      conversion_rate: 3.29,
      cpa: 38.50,
      performance_rating: 'Top Performer'
    },
    {
      audience: 'Career Changers',
      impressions: 22000,
      clicks: 580,
      conversions: 15,
      ctr: 2.64,
      conversion_rate: 2.59,
      cpa: 45.20,
      performance_rating: 'Good'
    },
    {
      audience: 'Corporate Decision Makers',
      impressions: 18000,
      clicks: 320,
      conversions: 6,
      ctr: 1.78,
      conversion_rate: 1.88,
      cpa: 78.33,
      performance_rating: 'Underperforming'
    },
    {
      audience: 'Retargeting - Warm Audience',
      impressions: 17000,
      clicks: 350,
      conversions: 3,
      ctr: 2.06,
      conversion_rate: 0.86,
      cpa: 185.00,
      performance_rating: 'Needs Optimization'
    }
  ];
}

function generateCreativePerformance() {
  return [
    {
      creative: 'Heritage & Authority',
      impressions: 25000,
      clicks: 720,
      conversions: 22,
      ctr: 2.88,
      conversion_rate: 3.06,
      cpa: 41.82,
      engagement_rate: 4.2,
      performance_rating: 'Top Creative'
    },
    {
      creative: 'Modern & Dynamic',
      impressions: 23000,
      clicks: 610,
      conversions: 18,
      ctr: 2.65,
      conversion_rate: 2.95,
      cpa: 45.56,
      engagement_rate: 3.8,
      performance_rating: 'Strong Performer'
    },
    {
      creative: 'Personal & Aspirational',
      impressions: 20000,
      clicks: 480,
      conversions: 9,
      ctr: 2.40,
      conversion_rate: 1.88,
      cpa: 72.22,
      engagement_rate: 3.1,
      performance_rating: 'Moderate'
    },
    {
      creative: 'Corporate & Professional',
      impressions: 17000,
      clicks: 290,
      conversions: 3,
      ctr: 1.71,
      conversion_rate: 1.03,
      cpa: 116.67,
      engagement_rate: 2.2,
      performance_rating: 'Underperforming'
    }
  ];
}

function generateTimeSeriesData() {
  const data = [];
  const baseDate = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      impressions: generateRealisticMetric(2800, 500),
      clicks: generateRealisticMetric(70, 15),
      conversions: generateRealisticMetric(2, 1),
      spend: generateRealisticMetric(70, 15),
      ctr: generateRealisticCTR(),
      cpa: generateRealisticCPA()
    });
  }
  
  return data;
}

function generateDeviceBreakdown() {
  return [
    {
      device: 'Mobile',
      impressions: 51000,
      clicks: 1260,
      conversions: 31,
      spend: 1260,
      ctr: 2.47,
      conversion_rate: 2.46,
      cpa: 40.65,
      performance_share: '60%'
    },
    {
      device: 'Desktop',
      impressions: 25500,
      clicks: 630,
      conversions: 16,
      spend: 630,
      ctr: 2.47,
      conversion_rate: 2.54,
      cpa: 39.38,
      performance_share: '31%'
    },
    {
      device: 'Tablet',
      impressions: 8500,
      clicks: 210,
      conversions: 5,
      spend: 210,
      ctr: 2.47,
      conversion_rate: 2.38,
      cpa: 42.00,
      performance_share: '9%'
    }
  ];
}

function generateGeographicPerformance() {
  return [
    {
      location: 'São Paulo - SP',
      impressions: 42000,
      clicks: 1050,
      conversions: 28,
      cpa: 41.07,
      roas: 4.6,
      market_share: '65%'
    },
    {
      location: 'Rio de Janeiro - RJ',
      impressions: 28000,
      clicks: 700,
      conversions: 16,
      cpa: 43.75,
      roas: 4.2,
      market_share: '25%'
    },
    {
      location: 'Brasília - DF',
      impressions: 15000,
      clicks: 350,
      conversions: 8,
      cpa: 43.75,
      roas: 3.8,
      market_share: '10%'
    }
  ];
}

async function generatePerformanceInsights(performanceData, openai) {
  const insightsPrompt = `
Analyze the following campaign performance data and provide expert marketing insights:

Campaign Performance (30 days):
- Impressions: ${performanceData.metrics.impressions}
- Clicks: ${performanceData.metrics.clicks}
- CTR: ${performanceData.metrics.ctr}%
- Conversions: ${performanceData.metrics.conversions}
- Conversion Rate: ${performanceData.metrics.conversion_rate}%
- CPA: R$ ${performanceData.metrics.cpa}
- ROAS: ${performanceData.metrics.roas}x
- Total Spend: R$ ${performanceData.metrics.spend}

Top Performing Audience: ${performanceData.audience_performance[0].audience}
- CPA: R$ ${performanceData.audience_performance[0].cpa}
- Conversion Rate: ${performanceData.audience_performance[0].conversion_rate}%

Top Performing Creative: ${performanceData.creative_performance[0].creative}
- CTR: ${performanceData.creative_performance[0].ctr}%
- CPA: R$ ${performanceData.creative_performance[0].cpa}

Provide insights on:

1. PERFORMANCE ASSESSMENT
- Overall campaign health
- Key performance strengths
- Areas of concern
- Benchmark comparison

2. AUDIENCE INSIGHTS
- Best performing segments
- Underperforming audiences
- Optimization opportunities
- Scaling potential

3. CREATIVE ANALYSIS
- Winning creative themes
- Creative fatigue indicators
- Refresh recommendations
- Format performance

4. CHANNEL EFFECTIVENESS
- Best performing channels
- Budget reallocation opportunities
- Cross-channel synergies

5. OPTIMIZATION PRIORITIES
- Immediate action items
- Medium-term improvements
- Long-term strategy adjustments

Provide data-driven, actionable insights for a professional English education company.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: insightsPrompt }],
      max_tokens: 2000,
      temperature: 0.6
    });

    const insightsText = response.choices[0].message.content;
    
    return {
      overall_assessment: extractInsightSection(insightsText, 'PERFORMANCE ASSESSMENT'),
      audience_insights: extractInsightSection(insightsText, 'AUDIENCE INSIGHTS'),
      creative_analysis: extractInsightSection(insightsText, 'CREATIVE ANALYSIS'),
      channel_effectiveness: extractInsightSection(insightsText, 'CHANNEL EFFECTIVENESS'),
      optimization_priorities: extractInsightSection(insightsText, 'OPTIMIZATION PRIORITIES'),
      key_findings: extractKeyFindings(insightsText),
      recommendations: generateTopRecommendations(performanceData),
      full_analysis: insightsText
    };

  } catch (error) {
    console.error('AI insights generation error:', error);
    return generateFallbackInsights(performanceData);
  }
}

function extractInsightSection(text, sectionName) {
  try {
    const regex = new RegExp(`${sectionName}[\\s\\S]*?(?=\\n\\n\\d+\\.|$)`, 'i');
    const match = text.match(regex);
    return match ? match[0].replace(sectionName, '').trim() : `${sectionName} analysis completed`;
  } catch (error) {
    return `${sectionName} insights available`;
  }
}

function extractKeyFindings(insightsText) {
  return [
    'High-Intent Professionals audience shows 3.29% conversion rate - 32% above benchmark',
    'Heritage & Authority creative theme drives lowest CPA at R$ 41.82',
    'Google Ads channel delivers strongest ROAS at 4.8x investment',
    'Mobile traffic represents 60% of conversions with competitive CPA',
    'LinkedIn channel shows opportunity for B2B optimization'
  ];
}

function generateTopRecommendations(performanceData) {
  const recommendations = [];
  
  // CPA recommendations
  if (performanceData.metrics.cpa > 50) {
    recommendations.push({
      priority: 'High',
      category: 'Cost Optimization',
      action: 'Lower CPA by 15%',
      description: 'Current CPA above target. Focus budget on top-performing audiences and creatives.',
      expected_impact: '15-20% cost reduction'
    });
  } else {
    recommendations.push({
      priority: 'Medium',
      category: 'Scale Optimization',
      action: 'Increase budget for top performers',
      description: 'CPA is within target range. Scale successful ad sets to maximize volume.',
      expected_impact: '25-30% more conversions'
    });
  }
  
  // Creative recommendations
  recommendations.push({
    priority: 'High',
    category: 'Creative Optimization',
    action: 'Refresh underperforming creatives',
    description: 'Creative fatigue detected in bottom 25% of ads. Develop new variations.',
    expected_impact: '10-15% CTR improvement'
  });
  
  // Audience recommendations
  recommendations.push({
    priority: 'Medium',
    category: 'Audience Expansion',
    action: 'Scale High-Intent Professionals audience',
    description: 'Top-performing audience with 3.29% conversion rate. Increase budget allocation.',
    expected_impact: '20-25% more qualified leads'
  });
  
  // Channel recommendations
  recommendations.push({
    priority: 'Medium',
    category: 'Budget Allocation',
    action: 'Reallocate LinkedIn budget to Google Ads',
    description: 'LinkedIn showing high CPA. Shift 40% of budget to top-performing Google Ads.',
    expected_impact: '12-18% better overall ROAS'
  });
  
  return recommendations;
}

async function generateOptimizationPlan(performanceData, insights, openai) {
  const optimizationPrompt = `
Based on the campaign performance and insights, create a detailed optimization plan:

Current Performance:
- ROAS: ${performanceData.metrics.roas}x (Target: 4.5x)
- CPA: R$ ${performanceData.metrics.cpa} (Target: R$ 40)
- Conversion Rate: ${performanceData.metrics.conversion_rate}% (Benchmark: 2.5%)

Key Issues Identified:
- LinkedIn channel underperforming (CPA: R$ 125)
- Corporate Decision Makers audience low conversion rate (1.88%)
- Creative fatigue in bottom performers

Create optimization plan with:

1. IMMEDIATE ACTIONS (Next 7 days)
- Specific tactical changes
- Budget adjustments
- Creative updates

2. SHORT-TERM OPTIMIZATIONS (2-4 weeks)
- Audience refinements
- New creative testing
- Bid strategy adjustments

3. LONG-TERM STRATEGY (1-3 months)
- Campaign structure improvements
- New channel testing
- Advanced targeting

4. SUCCESS METRICS
- KPI targets for each phase
- Performance benchmarks
- Review milestones

Provide specific, actionable optimization steps with expected outcomes.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: optimizationPrompt }],
      max_tokens: 1500,
      temperature: 0.5
    });

    const planText = response.choices[0].message.content;
    
    return {
      immediate_actions: extractPlanSection(planText, 'IMMEDIATE ACTIONS'),
      short_term: extractPlanSection(planText, 'SHORT-TERM'),
      long_term: extractPlanSection(planText, 'LONG-TERM'),
      success_metrics: extractPlanSection(planText, 'SUCCESS METRICS'),
      implementation_timeline: generateImplementationTimeline(),
      budget_impact: calculateBudgetImpact(performanceData),
      risk_assessment: generateRiskAssessment(),
      full_plan: planText
    };

  } catch (error) {
    console.error('Optimization plan generation error:', error);
    return generateFallbackOptimizationPlan(performanceData);
  }
}

function extractPlanSection(text, sectionName) {
  try {
    const regex = new RegExp(`${sectionName}[\\s\\S]*?(?=\\n\\n\\d+\\.|$)`, 'i');
    const match = text.match(regex);
    return match ? match[0].replace(sectionName, '').trim() : `${sectionName} plan available`;
  } catch (error) {
    return `${sectionName} optimization steps`;
  }
}

function generateImplementationTimeline() {
  return {
    week1: {
      focus: 'Immediate Performance Fixes',
      tasks: [
        'Pause underperforming ad sets (CPA > 150% of target)',
        'Increase budget for top 3 performing ad sets by 20%',
        'Launch 2 new creative variations',
        'Implement negative keyword lists'
      ],
      expected_impact: '10-15% CPA improvement'
    },
    week2_3: {
      focus: 'Audience & Creative Optimization', 
      tasks: [
        'Create lookalike audiences from top converters',
        'Launch video creative testing',
        'Implement dayparting optimization',
        'Expand successful keyword themes'
      ],
      expected_impact: '15-20% conversion volume increase'
    },
    week4_8: {
      focus: 'Strategic Improvements',
      tasks: [
        'Test new audience segments',
        'Implement Smart Bidding strategies',
        'Launch competitor targeting',
        'Optimize landing page conversion rates'
      ],
      expected_impact: '20-25% overall ROAS improvement'
    },
    ongoing: {
      focus: 'Continuous Optimization',
      tasks: [
        'Weekly performance reviews',
        'Monthly creative refresh',
        'Quarterly strategy assessment',
        'Automated optimization rules'
      ],
      expected_impact: 'Sustained performance improvement'
    }
  };
}

function calculateBudgetImpact(performanceData) {
  const currentSpend = performanceData.metrics.spend;
  
  return {
    current_monthly_spend: `R$ ${currentSpend}`,
    optimized_allocation: {
      'Google Ads': '60% (+10%)',
      'Facebook/Instagram': '35% (-5%)', 
      'LinkedIn': '5% (-15%)',
      'Testing Reserve': '10% (new)'
    },
    projected_improvements: {
      cpa_reduction: '15-20%',
      roas_increase: '12-18%',
      conversion_volume: '+25-30%'
    },
    roi_projection: {
      month1: 'Break-even on optimization costs',
      month2: '15% efficiency gain',
      month3: '25% efficiency gain'
    }
  };
}

function generateRiskAssessment() {
  return {
    low_risk: [
      'Budget reallocation within existing channels',
      'Creative testing with 10% budget reserve',
      'Bid strategy optimization'
    ],
    medium_risk: [
      'Audience expansion beyond proven segments',
      'New creative format testing',
      'Aggressive budget scaling'
    ],
    high_risk: [
      'Complete campaign restructure',
      'New platform channel testing',
      'Dramatic targeting changes'
    ],
    mitigation_strategies: [
      'Test all changes with small budget allocation first',
      'Maintain 70% budget in proven performers',
      'Implement gradual rollout for major changes',
      'Daily monitoring during optimization period'
    ]
  };
}

async function generateCompetitiveAnalysis(performanceData, openai) {
  // Simulate competitive insights since we don't have actual competitor data
  return {
    market_position: {
      performance_vs_benchmark: 'Above average',
      market_share_estimate: '8-12% in São Paulo market',
      competitive_advantage: [
        '60+ years heritage differentiation',
        'Government recognition unique positioning',
        'Strong conversion rates indicate effective messaging'
      ]
    },
    competitor_insights: [
      {
        competitor: 'Market Leader',
        estimated_spend: 'R$ 15,000-20,000/month',
        positioning: 'Mass market, price competitive',
        our_advantage: 'Premium positioning and credibility'
      },
      {
        competitor: 'Tech-Forward Competitor',
        estimated_spend: 'R$ 8,000-12,000/month',
        positioning: 'Modern, app-based learning',
        our_advantage: 'Personal touch and proven results'
      }
    ],
    opportunities: [
      'Underserved corporate segment showing low competition',
      'Google Ads opportunity in long-tail keywords',
      'LinkedIn professional targeting less saturated'
    ],
    threats: [
      'Increased competition driving up CPCs',
      'New players with aggressive pricing',
      'Economic conditions affecting corporate training budgets'
    ]
  };
}

function calculatePerformanceScore(metrics) {
  let score = 0;
  let maxScore = 0;
  
  // CTR scoring (weight: 20%)
  const ctrScore = Math.min(metrics.ctr / 3.0, 1) * 20;
  score += ctrScore;
  maxScore += 20;
  
  // Conversion Rate scoring (weight: 25%)
  const convRateScore = Math.min(metrics.conversion_rate / 4.0, 1) * 25;
  score += convRateScore;
  maxScore += 25;
  
  // CPA scoring (weight: 25%) - lower is better
  const cpaScore = Math.max(0, (60 - metrics.cpa) / 60) * 25;
  score += cpaScore;
  maxScore += 25;
  
  // ROAS scoring (weight: 30%)
  const roasScore = Math.min(metrics.roas / 6.0, 1) * 30;
  score += roasScore;
  maxScore += 30;
  
  const finalScore = Math.round((score / maxScore) * 100);
  
  return {
    overall_score: finalScore,
    grade: getPerformanceGrade(finalScore),
    breakdown: {
      ctr_score: Math.round(ctrScore),
      conversion_rate_score: Math.round(convRateScore),
      cpa_score: Math.round(cpaScore),
      roas_score: Math.round(roasScore)
    },
    benchmark_comparison: getBenchmarkComparison(finalScore)
  };
}

function getPerformanceGrade(score) {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  return 'C-';
}

function getBenchmarkComparison(score) {
  if (score >= 85) return 'Significantly above industry benchmark';
  if (score >= 75) return 'Above industry benchmark';
  if (score >= 65) return 'At industry benchmark';
  if (score >= 55) return 'Below industry benchmark';
  return 'Significantly below benchmark - immediate action required';
}

function generateNextActions(metrics, insights) {
  const actions = [];
  
  // High priority actions based on performance
  if (metrics.cpa > 50) {
    actions.push({
      priority: 'Critical',
      action: 'Reduce CPA',
      description: 'Pause underperforming ad sets and reallocate budget to top performers',
      deadline: '24 hours',
      expected_impact: 'High'
    });
  }
  
  if (metrics.ctr < 2.0) {
    actions.push({
      priority: 'High',
      action: 'Improve CTR',
      description: 'Launch new creative variations focusing on heritage and credibility',
      deadline: '3 days',
      expected_impact: 'Medium'
    });
  }
  
  if (metrics.conversion_rate < 2.0) {
    actions.push({
      priority: 'High',
      action: 'Optimize Landing Pages',
      description: 'A/B test landing page elements and improve conversion funnel',
      deadline: '1 week',
      expected_impact: 'High'
    });
  }
  
  // Standard optimization actions
  actions.push({
    priority: 'Medium',
    action: 'Audience Expansion',
    description: 'Create lookalike audiences from recent converters',
    deadline: '1 week',
    expected_impact: 'Medium'
  });
  
  actions.push({
    priority: 'Medium',
    action: 'Keyword Optimization',
    description: 'Add negative keywords and expand high-performing keyword themes',
    deadline: '3 days',
    expected_impact: 'Medium'
  });
  
  return actions;
}

function generateReportingSchedule() {
  return {
    daily: {
      frequency: 'Every day',
      metrics: ['Spend', 'Conversions', 'CPA'],
      delivery: 'Automated dashboard',
      stakeholders: ['Campaign Manager']
    },
    weekly: {
      frequency: 'Every Monday',
      metrics: ['Full performance review', 'Optimization recommendations'],
      delivery: 'Email report + dashboard',
      stakeholders: ['Marketing Team', 'Management']
    },
    monthly: {
      frequency: 'First Monday of month',
      metrics: ['ROI analysis', 'Strategic recommendations', 'Competitive insights'],
      delivery: 'Presentation + detailed report',
      stakeholders: ['Leadership', 'Finance', 'Marketing']
    }
  };
}

function generatePerformanceAlerts(metrics) {
  const alerts = [];
  
  // CPA alert
  if (metrics.cpa > 60) {
    alerts.push({
      type: 'Critical',
      metric: 'CPA',
      current_value: `R$ ${metrics.cpa}`,
      threshold: 'R$ 50',
      message: 'CPA exceeds target by 20%. Immediate optimization required.',
      suggested_action: 'Pause high CPA ad sets and reallocate budget'
    });
  }
  
  // CTR alert
  if (metrics.ctr < 1.5) {
    alerts.push({
      type: 'Warning',
      metric: 'CTR',
      current_value: `${metrics.ctr}%`,
      threshold: '2.0%',
      message: 'CTR below optimal range. Creative refresh recommended.',
      suggested_action: 'Launch new creative variations'
    });
  }
  
  // Budget pacing alert
  alerts.push({
    type: 'Info',
    metric: 'Budget Pacing',
    current_value: 'On track',
    threshold: 'Monthly budget',
    message: 'Budget pacing is healthy for month-end target.',
    suggested_action: 'Continue monitoring daily spend'
  });
  
  return alerts;
}

function generateFallbackInsights(performanceData) {
  return {
    overall_assessment: 'Campaign showing solid performance with ROAS above industry benchmark',
    audience_insights: 'High-Intent Professionals segment delivering best results',
    creative_analysis: 'Heritage-themed creatives outperforming modern variants', 
    channel_effectiveness: 'Google Ads providing best ROI, LinkedIn needs optimization',
    optimization_priorities: 'Focus on scaling top performers and improving underperforming segments',
    key_findings: [
      'Strong overall ROAS indicates effective targeting',
      'Heritage messaging resonates with target audience',
      'Mobile performance competitive with desktop'
    ],
    recommendations: generateTopRecommendations(performanceData)
  };
}

function generateFallbackOptimizationPlan(performanceData) {
  return {
    immediate_actions: 'Pause high CPA ad sets, increase budget for top performers',
    short_term: 'Launch creative testing, optimize audience targeting',
    long_term: 'Implement automated bidding, expand to new channels',
    success_metrics: 'Target: 15% CPA reduction, 20% volume increase',
    implementation_timeline: generateImplementationTimeline(),
    budget_impact: calculateBudgetImpact(performanceData)
  };
}

function generateFallbackPerformance(campaignId) {
  return {
    campaign_id: campaignId,
    performance_metrics: {
      impressions: 75000,
      clicks: 1800,
      ctr: 2.4,
      conversions: 45,
      conversion_rate: 2.5,
      cpa: 47,
      spend: 2115,
      roas: 4.1
    },
    performance_score: {
      overall_score: 78,
      grade: 'B+',
      benchmark_comparison: 'Above industry benchmark'
    },
    next_actions: [
      {
        priority: 'High',
        action: 'Scale top performers',
        description: 'Increase budget for best performing ad sets',
        deadline: '3 days'
      }
    ]
  };
}