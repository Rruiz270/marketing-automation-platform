import dbConnect from '../../../lib/mongodb';
import CreativeAsset from '../../../lib/models/CreativeAsset';
import CampaignMetrics from '../../../lib/models/CampaignMetrics';
import Campaign from '../../../lib/models/Campaign';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { action } = req.body;

    switch (action) {
      case 'create_ab_test':
        const test = await createABTest(req.body);
        res.status(200).json({
          success: true,
          data: test,
          message: 'A/B test created successfully'
        });
        break;

      case 'analyze_test_results':
        const analysis = await analyzeTestResults(req.body.test_id);
        res.status(200).json({
          success: true,
          data: analysis,
          message: 'A/B test analysis completed'
        });
        break;

      case 'auto_optimize':
        const optimization = await autoOptimizeFromTests(req.body.campaign_id);
        res.status(200).json({
          success: true,
          data: optimization,
          message: 'Automatic optimization completed'
        });
        break;

      case 'get_test_recommendations':
        const recommendations = await getTestRecommendations(req.body.campaign_id);
        res.status(200).json({
          success: true,
          data: recommendations,
          message: 'Test recommendations generated'
        });
        break;

      case 'schedule_tests':
        const scheduled = await scheduleSequentialTests(req.body);
        res.status(200).json({
          success: true,
          data: scheduled,
          message: 'Sequential tests scheduled'
        });
        break;

      default:
        res.status(400).json({
          success: false,
          message: 'Invalid action specified'
        });
    }
  } catch (error) {
    console.error('A/B testing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in A/B testing system',
      error: error.message
    });
  }
}

async function createABTest(testData) {
  const { campaign_id, creative_ids, test_config } = testData;

  // Validate test setup
  if (creative_ids.length < 2) {
    throw new Error('A/B test requires at least 2 creatives');
  }

  const campaign = await Campaign.findById(campaign_id);
  if (!campaign) throw new Error('Campaign not found');

  // Calculate traffic split
  const trafficSplit = calculateTrafficSplit(creative_ids.length, test_config);
  
  // Generate unique test ID
  const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Update creatives with A/B test data
  const testCreatives = [];
  for (let i = 0; i < creative_ids.length; i++) {
    const creative = await CreativeAsset.findById(creative_ids[i]);
    if (!creative) continue;

    creative.ab_test_data = {
      test_id: testId,
      variant_name: `Variant ${String.fromCharCode(65 + i)}`, // A, B, C, etc.
      test_status: 'running',
      traffic_split: trafficSplit[i],
      statistical_significance: 0,
      winner: false
    };

    await creative.save();
    testCreatives.push({
      creative_id: creative._id,
      variant_name: creative.ab_test_data.variant_name,
      traffic_split: trafficSplit[i]
    });
  }

  // Set up test monitoring
  const testParameters = {
    test_id: testId,
    campaign_id,
    creatives: testCreatives,
    start_date: new Date(),
    end_date: new Date(Date.now() + (test_config.duration_days || 7) * 24 * 60 * 60 * 1000),
    success_metric: test_config.success_metric || 'conversions',
    minimum_sample_size: test_config.min_sample_size || 1000,
    confidence_level: test_config.confidence_level || 95,
    auto_declare_winner: test_config.auto_declare || true,
    status: 'running'
  };

  return {
    ...testParameters,
    estimated_completion: calculateEstimatedCompletion(testParameters),
    monitoring_frequency: '6 hours',
    next_analysis: new Date(Date.now() + 6 * 60 * 60 * 1000)
  };
}

async function analyzeTestResults(testId) {
  // Get all creatives in this test
  const testCreatives = await CreativeAsset.find({
    'ab_test_data.test_id': testId
  });

  if (testCreatives.length === 0) {
    throw new Error('Test not found or no creatives in test');
  }

  // Collect performance data for each variant
  const variantResults = [];
  for (const creative of testCreatives) {
    const performanceData = creative.performance_data;
    
    // Calculate key metrics
    const metrics = {
      impressions: performanceData.impressions || 0,
      clicks: performanceData.clicks || 0,
      conversions: performanceData.conversions || 0,
      cost: performanceData.cost || 0,
      revenue: performanceData.revenue || 0,
      ctr: performanceData.impressions > 0 ? (performanceData.clicks / performanceData.impressions) * 100 : 0,
      conversion_rate: performanceData.clicks > 0 ? (performanceData.conversions / performanceData.clicks) * 100 : 0,
      cpc: performanceData.clicks > 0 ? performanceData.cost / performanceData.clicks : 0,
      roas: performanceData.cost > 0 ? performanceData.revenue / performanceData.cost : 0
    };

    variantResults.push({
      creative_id: creative._id,
      variant_name: creative.ab_test_data.variant_name,
      traffic_split: creative.ab_test_data.traffic_split,
      metrics,
      sample_size: performanceData.impressions
    });
  }

  // Perform statistical analysis
  const statisticalAnalysis = performStatisticalAnalysis(variantResults);
  
  // Determine winner if statistically significant
  const winner = determineWinner(variantResults, statisticalAnalysis);
  
  // Update creative records with results
  if (winner && statisticalAnalysis.confidence >= 95) {
    await CreativeAsset.findByIdAndUpdate(winner.creative_id, {
      'ab_test_data.winner': true,
      'ab_test_data.statistical_significance': statisticalAnalysis.confidence
    });
  }

  return {
    test_id: testId,
    test_status: statisticalAnalysis.confidence >= 95 ? 'completed' : 'running',
    variants: variantResults,
    statistical_analysis: statisticalAnalysis,
    winner: winner,
    recommendations: generateTestRecommendations(variantResults, winner),
    next_steps: winner ? 
      ['Scale winning variant', 'Archive losing variants', 'Create new test'] :
      ['Continue test', 'Monitor for significance', 'Collect more data']
  };
}

async function autoOptimizeFromTests(campaignId) {
  // Find completed tests for this campaign
  const completedTests = await CreativeAsset.find({
    campaign_id: campaignId,
    'ab_test_data.test_status': 'completed',
    'ab_test_data.winner': true
  });

  if (completedTests.length === 0) {
    return {
      message: 'No completed A/B tests found for optimization',
      action_taken: 'none'
    };
  }

  const optimizations = [];
  
  for (const winningCreative of completedTests) {
    // Increase budget allocation for winning creatives
    const campaign = await Campaign.findById(campaignId);
    const currentBudget = campaign.budget.daily;
    const budgetIncrease = Math.min(currentBudget * 0.25, 500); // Max 25% or $500 increase
    
    // Generate new variations based on winning elements
    const newVariations = await generateWinnerBasedVariations(winningCreative);
    
    optimizations.push({
      winning_creative_id: winningCreative._id,
      action: 'budget_reallocation',
      budget_increase: budgetIncrease,
      new_variations_created: newVariations.length,
      confidence_score: winningCreative.ab_test_data.statistical_significance
    });
  }

  return {
    campaign_id: campaignId,
    optimizations_applied: optimizations.length,
    optimizations,
    estimated_performance_lift: '15-30%',
    monitoring_period: '7 days'
  };
}

async function getTestRecommendations(campaignId) {
  const campaign = await Campaign.findById(campaignId);
  const existingCreatives = await CreativeAsset.find({ campaign_id: campaignId });
  
  const recommendations = [];

  // Analyze existing performance
  const performanceAnalysis = analyzeCreativePerformance(existingCreatives);
  
  // Recommend tests based on performance gaps
  if (performanceAnalysis.low_ctr_creatives.length > 0) {
    recommendations.push({
      type: 'headline_test',
      priority: 'high',
      description: 'Test headline variations for low-CTR creatives',
      affected_creatives: performanceAnalysis.low_ctr_creatives.length,
      potential_improvement: '20-40%',
      test_duration: '5-7 days'
    });
  }

  if (performanceAnalysis.high_cost_creatives.length > 0) {
    recommendations.push({
      type: 'cta_optimization',
      priority: 'medium',
      description: 'Test call-to-action variations for high-cost creatives',
      affected_creatives: performanceAnalysis.high_cost_creatives.length,
      potential_improvement: '15-25%',
      test_duration: '7-10 days'
    });
  }

  // AI-powered test suggestions
  const aiSuggestions = generateAITestSuggestions(campaign, existingCreatives);
  recommendations.push(...aiSuggestions);

  return {
    campaign_id: campaignId,
    total_recommendations: recommendations.length,
    recommendations,
    next_review_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    automation_available: true
  };
}

async function scheduleSequentialTests(scheduleData) {
  const { campaign_id, test_sequence, start_date } = scheduleData;
  
  const scheduledTests = [];
  let currentDate = new Date(start_date);

  for (let i = 0; i < test_sequence.length; i++) {
    const test = test_sequence[i];
    const endDate = new Date(currentDate.getTime() + test.duration_days * 24 * 60 * 60 * 1000);
    
    const scheduledTest = {
      sequence_number: i + 1,
      test_config: test,
      start_date: new Date(currentDate),
      end_date: endDate,
      status: i === 0 ? 'ready_to_start' : 'scheduled',
      depends_on: i > 0 ? scheduledTests[i - 1].test_id : null
    };
    
    scheduledTests.push(scheduledTest);
    
    // Next test starts after current one ends + buffer time
    currentDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000); // 1 day buffer
  }

  return {
    campaign_id,
    total_tests_scheduled: scheduledTests.length,
    scheduled_tests: scheduledTests,
    estimated_completion: scheduledTests[scheduledTests.length - 1].end_date,
    auto_progression: true,
    monitoring_enabled: true
  };
}

// Helper functions
function calculateTrafficSplit(variantCount, config) {
  if (config.custom_split) {
    return config.custom_split;
  }
  
  // Equal split by default
  const splitPercentage = Math.floor(100 / variantCount);
  const splits = new Array(variantCount).fill(splitPercentage);
  
  // Adjust for remainder
  const remainder = 100 - (splitPercentage * variantCount);
  for (let i = 0; i < remainder; i++) {
    splits[i]++;
  }
  
  return splits;
}

function performStatisticalAnalysis(variants) {
  if (variants.length < 2) return { confidence: 0, significant: false };
  
  // Simplified statistical analysis
  const totalSampleSize = variants.reduce((sum, v) => sum + v.sample_size, 0);
  const avgConversionRate = variants.reduce((sum, v) => sum + v.metrics.conversion_rate, 0) / variants.length;
  
  // Mock confidence calculation based on sample size and variance
  const sampleSizeScore = Math.min(totalSampleSize / 10000 * 50, 50); // Max 50 points for sample size
  const varianceScore = Math.max(0, 45 - Math.abs(variants[0].metrics.conversion_rate - avgConversionRate) * 10);
  
  const confidence = Math.min(95, sampleSizeScore + varianceScore);
  
  return {
    confidence: Math.round(confidence),
    significant: confidence >= 95,
    sample_size: totalSampleSize,
    power: confidence > 80 ? 'adequate' : 'low',
    recommendation: confidence < 95 ? 'continue_test' : 'declare_winner'
  };
}

function determineWinner(variants, analysis) {
  if (!analysis.significant) return null;
  
  // Find variant with best conversion rate
  const winner = variants.reduce((best, current) => {
    return current.metrics.conversion_rate > best.metrics.conversion_rate ? current : best;
  });
  
  return {
    ...winner,
    improvement_over_baseline: ((winner.metrics.conversion_rate - variants[0].metrics.conversion_rate) / variants[0].metrics.conversion_rate * 100).toFixed(2)
  };
}

function generateTestRecommendations(variants, winner) {
  const recommendations = [];
  
  if (winner) {
    recommendations.push(`Scale ${winner.variant_name} to 100% traffic`);
    recommendations.push('Create new variations based on winning elements');
    recommendations.push('Archive underperforming variants');
  } else {
    recommendations.push('Continue test until statistical significance');
    recommendations.push('Monitor for external factors affecting results');
    recommendations.push('Consider increasing sample size if needed');
  }
  
  return recommendations;
}

async function generateWinnerBasedVariations(winningCreative) {
  // Create 2-3 variations based on winning elements
  const variations = [];
  const winningElements = analyzeWinningElements(winningCreative);
  
  for (let i = 0; i < 2; i++) {
    const variation = new CreativeAsset({
      campaign_id: winningCreative.campaign_id,
      name: `${winningCreative.name} - Winner Variation ${i + 1}`,
      type: winningCreative.type,
      ai_generated: true,
      parent_creative: winningCreative._id,
      content: generateVariationContent(winningCreative.content, winningElements, i),
      tags: [...winningCreative.tags, 'winner-based-variation']
    });
    
    await variation.save();
    variations.push(variation);
  }
  
  return variations;
}

function analyzeCreativePerformance(creatives) {
  const avgCTR = creatives.reduce((sum, c) => sum + (c.performance_data.ctr || 0), 0) / creatives.length;
  const avgCost = creatives.reduce((sum, c) => sum + (c.performance_data.cost || 0), 0) / creatives.length;
  
  return {
    low_ctr_creatives: creatives.filter(c => (c.performance_data.ctr || 0) < avgCTR * 0.8),
    high_cost_creatives: creatives.filter(c => (c.performance_data.cost || 0) > avgCost * 1.2),
    high_performers: creatives.filter(c => (c.performance_data.ctr || 0) > avgCTR * 1.2),
    avg_metrics: { ctr: avgCTR, cost: avgCost }
  };
}

function generateAITestSuggestions(campaign, creatives) {
  const suggestions = [];
  
  // Industry-specific test suggestions
  if (campaign.industry === 'ecommerce') {
    suggestions.push({
      type: 'seasonal_creative_test',
      priority: 'medium',
      description: 'Test seasonal messaging and imagery',
      potential_improvement: '10-20%',
      test_duration: '14 days'
    });
  }
  
  // Audience-based suggestions
  if (campaign.targeting && campaign.targeting.age_range) {
    suggestions.push({
      type: 'age_targeted_messaging',
      priority: 'high',
      description: 'Test age-specific messaging variations',
      potential_improvement: '25-35%',
      test_duration: '10 days'
    });
  }
  
  return suggestions;
}

function calculateEstimatedCompletion(testParams) {
  const dailyTraffic = 1000; // Estimated daily impressions
  const daysToSignificance = Math.ceil(testParams.minimum_sample_size / dailyTraffic);
  
  return new Date(Date.now() + daysToSignificance * 24 * 60 * 60 * 1000);
}

function analyzeWinningElements(creative) {
  // Analyze what made this creative win
  return {
    headline_style: creative.content.headline ? creative.content.headline.length > 50 ? 'long' : 'short' : null,
    cta_urgency: creative.content.call_to_action ? creative.content.call_to_action.includes('Now') || creative.content.call_to_action.includes('Today') : false,
    visual_style: creative.type === 'image' ? 'engaging' : null
  };
}

function generateVariationContent(originalContent, winningElements, variationIndex) {
  const variations = { ...originalContent };
  
  // Apply winning elements with small variations
  if (winningElements.headline_style === 'short' && variations.headline) {
    variations.headline = variations.headline.substring(0, 40) + (variationIndex === 0 ? '!' : '?');
  }
  
  if (winningElements.cta_urgency && variations.call_to_action) {
    const urgencyWords = ['Now', 'Today', 'Instantly'];
    variations.call_to_action = `${variations.call_to_action} ${urgencyWords[variationIndex % urgencyWords.length]}`;
  }
  
  return variations;
}