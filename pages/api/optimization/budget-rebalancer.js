// Intelligent Cross-Platform Budget Rebalancer
import dbConnect from '../../../lib/mongodb';
import Campaign from '../../../lib/models/Campaign';

// Budget optimization rules for Alumni campaigns
const BUDGET_RULES = {
  // Platform-specific settings
  platforms: {
    google_ads: {
      minDailyBudget: 50,
      maxDailyBudget: 2000,
      incrementStep: 25,
      priority: 1 // Highest priority for Alumni
    },
    facebook_ads: {
      minDailyBudget: 30,
      maxDailyBudget: 1500,
      incrementStep: 20,
      priority: 2
    },
    linkedin_ads: {
      minDailyBudget: 40,
      maxDailyBudget: 1000,
      incrementStep: 20,
      priority: 3
    },
    tiktok_ads: {
      minDailyBudget: 20,
      maxDailyBudget: 800,
      incrementStep: 15,
      priority: 4
    }
  },
  
  // Rebalancing thresholds
  rebalancing: {
    minROASDifference: 0.5,      // 50% ROAS difference triggers rebalancing
    maxBudgetShift: 0.3,         // Max 30% budget shift per rebalance
    cooldownPeriod: 3600000,     // 1 hour between major rebalances
    emergencyROAS: 1.5,          // Emergency pause if ROAS < 1.5
    targetROAS: 4.0              // Target ROAS for Alumni campaigns
  },
  
  // Safety limits
  safety: {
    maxDailySpend: 5000,         // Maximum total daily spend
    minReserve: 100,             // Always keep $100 in reserve
    requireApproval: 1000        // Changes over $1000 need approval
  }
};

// Store for rebalancing history
const rebalanceHistory = new Map();

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { action, campaignId, params } = req.body;

    switch (action) {
      case 'analyze-budget-allocation':
        return analyzeBudgetAllocation(campaignId, res);
        
      case 'execute-rebalance':
        return executeRebalance(campaignId, params, res);
        
      case 'simulate-rebalance':
        return simulateRebalance(campaignId, res);
        
      case 'get-budget-history':
        return getBudgetHistory(campaignId, res);
        
      case 'set-budget-rules':
        return setBudgetRules(campaignId, params, res);
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}

// Analyze current budget allocation and recommend changes
async function analyzeBudgetAllocation(campaignId, res) {
  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get platform performance data
    const platformMetrics = await calculatePlatformMetrics(campaign);
    
    // Calculate optimal allocation
    const optimalAllocation = calculateOptimalAllocation(platformMetrics, campaign.budget);
    
    // Generate recommendations
    const recommendations = generateBudgetRecommendations(
      platformMetrics,
      optimalAllocation,
      campaign.budget
    );
    
    // Calculate expected impact
    const expectedImpact = calculateExpectedImpact(recommendations, platformMetrics);
    
    res.status(200).json({
      success: true,
      analysis: {
        current: {
          totalBudget: campaign.budget.daily,
          allocation: platformMetrics.map(p => ({
            platform: p.platform,
            budget: p.currentBudget,
            percentage: (p.currentBudget / campaign.budget.daily * 100).toFixed(1) + '%',
            roas: p.roas.toFixed(2),
            performance: p.performanceScore
          }))
        },
        optimal: {
          allocation: optimalAllocation,
          reasoning: generateAllocationReasoning(platformMetrics, optimalAllocation)
        },
        recommendations,
        expectedImpact,
        confidence: calculateConfidenceScore(platformMetrics)
      }
    });
  } catch (error) {
    console.error('Budget analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze budget allocation' });
  }
}

// Calculate platform-specific metrics
async function calculatePlatformMetrics(campaign) {
  const metrics = [];
  
  // Aggregate performance by platform
  const platformData = {};
  
  // Group campaigns by type (platform)
  if (campaign.type) {
    platformData[campaign.type] = campaign.performance;
  }
  
  // Calculate metrics for each platform
  for (const [platform, performance] of Object.entries(platformData)) {
    const roas = performance.revenue / performance.cost || 0;
    const ctr = performance.clicks / performance.impressions || 0;
    const conversionRate = performance.conversions / performance.clicks || 0;
    const cpa = performance.cost / performance.conversions || 0;
    
    // Calculate performance score (0-100)
    const performanceScore = calculatePerformanceScore({
      roas,
      ctr,
      conversionRate,
      cpa
    });
    
    metrics.push({
      platform,
      currentBudget: campaign.budget.daily || 0,
      spend: performance.cost,
      revenue: performance.revenue,
      roas,
      ctr,
      conversionRate,
      cpa,
      performanceScore,
      impressions: performance.impressions,
      clicks: performance.clicks,
      conversions: performance.conversions
    });
  }
  
  return metrics;
}

// Calculate optimal budget allocation based on performance
function calculateOptimalAllocation(platformMetrics, budget) {
  const totalDailyBudget = budget.daily || 500;
  const allocation = [];
  
  // Sort platforms by performance score and ROAS
  const sortedPlatforms = [...platformMetrics].sort((a, b) => {
    const scoreA = a.performanceScore * a.roas;
    const scoreB = b.performanceScore * b.roas;
    return scoreB - scoreA;
  });
  
  // Calculate weighted allocation based on performance
  let totalWeight = 0;
  const weights = sortedPlatforms.map(platform => {
    // Higher weight for better performers
    const weight = Math.pow(platform.performanceScore / 100, 2) * 
                  Math.log(Math.max(1, platform.roas));
    totalWeight += weight;
    return { platform: platform.platform, weight };
  });
  
  // Allocate budget proportionally with platform limits
  weights.forEach(({ platform, weight }) => {
    const rules = BUDGET_RULES.platforms[platform] || BUDGET_RULES.platforms.google_ads;
    const proportionalBudget = (weight / totalWeight) * totalDailyBudget;
    
    // Apply platform-specific limits
    const allocatedBudget = Math.min(
      Math.max(proportionalBudget, rules.minDailyBudget),
      rules.maxDailyBudget
    );
    
    allocation.push({
      platform,
      budget: Math.round(allocatedBudget / rules.incrementStep) * rules.incrementStep,
      percentage: (allocatedBudget / totalDailyBudget * 100).toFixed(1) + '%',
      reasoning: weight > 0.3 ? 'High performer' : weight > 0.1 ? 'Moderate performer' : 'Testing phase'
    });
  });
  
  // Ensure total doesn't exceed daily budget
  const totalAllocated = allocation.reduce((sum, a) => sum + a.budget, 0);
  if (totalAllocated > totalDailyBudget) {
    const scale = totalDailyBudget / totalAllocated;
    allocation.forEach(a => {
      a.budget = Math.round(a.budget * scale);
    });
  }
  
  return allocation;
}

// Generate specific budget recommendations
function generateBudgetRecommendations(platformMetrics, optimalAllocation, currentBudget) {
  const recommendations = [];
  
  platformMetrics.forEach(platform => {
    const optimal = optimalAllocation.find(a => a.platform === platform.platform);
    if (!optimal) return;
    
    const currentBudget = platform.currentBudget;
    const optimalBudget = optimal.budget;
    const difference = optimalBudget - currentBudget;
    const percentChange = (difference / currentBudget * 100).toFixed(1);
    
    if (Math.abs(difference) > 10) { // Only recommend changes > $10
      // Check if platform is underperforming
      if (platform.roas < BUDGET_RULES.rebalancing.emergencyROAS) {
        recommendations.push({
          platform: platform.platform,
          action: 'pause',
          currentBudget,
          recommendedBudget: 0,
          reason: `ROAS (${platform.roas.toFixed(2)}) below emergency threshold`,
          priority: 'critical',
          expectedROAS: 0
        });
      } else if (difference > 0) {
        recommendations.push({
          platform: platform.platform,
          action: 'increase',
          currentBudget,
          recommendedBudget: optimalBudget,
          change: `+$${difference} (+${percentChange}%)`,
          reason: `High performance (ROAS: ${platform.roas.toFixed(2)})`,
          priority: difference > 100 ? 'high' : 'medium',
          expectedROAS: platform.roas * 1.1 // Conservative 10% improvement
        });
      } else {
        recommendations.push({
          platform: platform.platform,
          action: 'decrease',
          currentBudget,
          recommendedBudget: optimalBudget,
          change: `$${difference} (${percentChange}%)`,
          reason: `Reallocate to better performers`,
          priority: Math.abs(difference) > 100 ? 'high' : 'medium',
          expectedROAS: platform.roas
        });
      }
    }
  });
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// Execute budget rebalancing
async function executeRebalance(campaignId, params = {}, res) {
  try {
    // Check cooldown period
    const lastRebalance = rebalanceHistory.get(campaignId);
    if (lastRebalance && Date.now() - lastRebalance < BUDGET_RULES.rebalancing.cooldownPeriod) {
      return res.status(429).json({
        error: 'Cooldown period active',
        nextAvailable: new Date(lastRebalance + BUDGET_RULES.rebalancing.cooldownPeriod)
      });
    }
    
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Get recommendations
    const platformMetrics = await calculatePlatformMetrics(campaign);
    const optimalAllocation = calculateOptimalAllocation(platformMetrics, campaign.budget);
    const recommendations = generateBudgetRecommendations(
      platformMetrics,
      optimalAllocation,
      campaign.budget
    );
    
    // Filter by approval requirements
    const autoApproved = recommendations.filter(r => 
      Math.abs(r.recommendedBudget - r.currentBudget) < BUDGET_RULES.safety.requireApproval
    );
    
    const executed = [];
    const pending = [];
    
    // Execute approved changes
    for (const recommendation of autoApproved) {
      if (params.dryRun) {
        pending.push(recommendation);
      } else {
        try {
          // Update campaign budget
          await updatePlatformBudget(campaign, recommendation);
          executed.push({
            ...recommendation,
            executedAt: new Date(),
            status: 'success'
          });
        } catch (error) {
          executed.push({
            ...recommendation,
            executedAt: new Date(),
            status: 'failed',
            error: error.message
          });
        }
      }
    }
    
    // Mark large changes as pending approval
    recommendations.filter(r => !autoApproved.includes(r)).forEach(r => {
      pending.push({
        ...r,
        requiresApproval: true,
        approvalThreshold: BUDGET_RULES.safety.requireApproval
      });
    });
    
    // Update rebalance history
    if (!params.dryRun && executed.length > 0) {
      rebalanceHistory.set(campaignId, Date.now());
      
      // Save campaign changes
      await campaign.save();
    }
    
    res.status(200).json({
      success: true,
      campaignId,
      rebalancing: {
        executed,
        pending,
        totalBudgetBefore: campaign.budget.daily,
        totalBudgetAfter: campaign.budget.daily, // Same total, just redistributed
        expectedImpact: calculateExpectedImpact(executed, platformMetrics)
      }
    });
    
  } catch (error) {
    console.error('Rebalance execution error:', error);
    res.status(500).json({ error: 'Failed to execute rebalancing' });
  }
}

// Update platform-specific budget
async function updatePlatformBudget(campaign, recommendation) {
  // In a real implementation, this would call platform APIs
  // For now, update the campaign model
  
  if (recommendation.action === 'pause') {
    campaign.status = 'paused';
  } else {
    // Update budget allocation
    campaign.budget.daily = recommendation.recommendedBudget;
  }
  
  // Log the change
  if (!campaign.budgetHistory) {
    campaign.budgetHistory = [];
  }
  
  campaign.budgetHistory.push({
    timestamp: new Date(),
    platform: recommendation.platform,
    previousBudget: recommendation.currentBudget,
    newBudget: recommendation.recommendedBudget,
    reason: recommendation.reason,
    action: recommendation.action
  });
  
  return campaign;
}

// Calculate expected impact of budget changes
function calculateExpectedImpact(recommendations, platformMetrics) {
  let totalCurrentRevenue = 0;
  let totalExpectedRevenue = 0;
  let totalCurrentSpend = 0;
  let totalExpectedSpend = 0;
  
  recommendations.forEach(rec => {
    const platform = platformMetrics.find(p => p.platform === rec.platform);
    if (!platform) return;
    
    // Current state
    totalCurrentRevenue += platform.revenue;
    totalCurrentSpend += platform.spend;
    
    // Expected state after rebalancing
    const budgetRatio = rec.recommendedBudget / rec.currentBudget;
    const expectedSpend = platform.spend * budgetRatio;
    const expectedRevenue = expectedSpend * (rec.expectedROAS || platform.roas);
    
    totalExpectedSpend += expectedSpend;
    totalExpectedRevenue += expectedRevenue;
  });
  
  const currentROAS = totalCurrentRevenue / totalCurrentSpend;
  const expectedROAS = totalExpectedRevenue / totalExpectedSpend;
  
  return {
    currentROAS: currentROAS.toFixed(2),
    expectedROAS: expectedROAS.toFixed(2),
    roasImprovement: ((expectedROAS - currentROAS) / currentROAS * 100).toFixed(1) + '%',
    revenueIncrease: (totalExpectedRevenue - totalCurrentRevenue).toFixed(2),
    efficiencyGain: ((expectedROAS / currentROAS - 1) * 100).toFixed(1) + '%'
  };
}

// Calculate performance score for a platform
function calculatePerformanceScore(metrics) {
  let score = 50; // Base score
  
  // ROAS impact (40% weight)
  if (metrics.roas > BUDGET_RULES.rebalancing.targetROAS) {
    score += 40 * (metrics.roas / BUDGET_RULES.rebalancing.targetROAS);
  } else {
    score += 40 * (metrics.roas / BUDGET_RULES.rebalancing.targetROAS) * 0.5;
  }
  
  // CTR impact (20% weight) - Alumni typical CTR is 2.5%
  const targetCTR = 0.025;
  score += 20 * Math.min(1, metrics.ctr / targetCTR);
  
  // Conversion rate impact (20% weight) - Alumni target is 3%
  const targetCR = 0.03;
  score += 20 * Math.min(1, metrics.conversionRate / targetCR);
  
  // CPA impact (20% weight) - Alumni target is $45
  const targetCPA = 45;
  if (metrics.cpa > 0 && metrics.cpa < targetCPA * 2) {
    score += 20 * (1 - metrics.cpa / (targetCPA * 2));
  }
  
  return Math.min(100, Math.max(0, score));
}

// Generate reasoning for allocation decisions
function generateAllocationReasoning(platformMetrics, optimalAllocation) {
  const reasoning = [];
  
  optimalAllocation.forEach(allocation => {
    const platform = platformMetrics.find(p => p.platform === allocation.platform);
    if (!platform) return;
    
    let reason = `${allocation.platform}: `;
    
    if (platform.roas > BUDGET_RULES.rebalancing.targetROAS) {
      reason += `Exceeding target ROAS (${platform.roas.toFixed(2)} vs ${BUDGET_RULES.rebalancing.targetROAS}). `;
    }
    
    if (platform.performanceScore > 80) {
      reason += 'High performance score. ';
    } else if (platform.performanceScore < 50) {
      reason += 'Low performance - limited budget allocation. ';
    }
    
    reasoning.push(reason);
  });
  
  return reasoning;
}

// Calculate confidence score for recommendations
function calculateConfidenceScore(platformMetrics) {
  let confidence = 85; // Base confidence
  
  // Adjust based on data volume
  const totalImpressions = platformMetrics.reduce((sum, p) => sum + p.impressions, 0);
  if (totalImpressions < 10000) confidence -= 20;
  if (totalImpressions < 5000) confidence -= 30;
  
  // Adjust based on conversion volume
  const totalConversions = platformMetrics.reduce((sum, p) => sum + p.conversions, 0);
  if (totalConversions < 50) confidence -= 15;
  if (totalConversions < 20) confidence -= 25;
  
  // Adjust based on platform diversity
  if (platformMetrics.length === 1) confidence -= 10;
  
  return Math.max(0, Math.min(100, confidence));
}

// Simulate rebalancing without executing
async function simulateRebalance(campaignId, res) {
  try {
    // Run analysis without execution
    const analysisResponse = await analyzeBudgetAllocation(campaignId, { 
      ...res, 
      status: () => ({ json: (data) => data }) 
    });
    
    res.status(200).json({
      success: true,
      simulation: analysisResponse,
      disclaimer: 'This is a simulation. Use execute-rebalance to apply changes.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Simulation failed' });
  }
}

// Get budget history
async function getBudgetHistory(campaignId, res) {
  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.status(200).json({
      success: true,
      campaignId,
      history: campaign.budgetHistory || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get budget history' });
  }
}

// Set custom budget rules
async function setBudgetRules(campaignId, rules, res) {
  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Store custom rules
    campaign.customBudgetRules = {
      ...BUDGET_RULES,
      ...rules
    };
    
    await campaign.save();
    
    res.status(200).json({
      success: true,
      campaignId,
      rules: campaign.customBudgetRules
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set budget rules' });
  }
}