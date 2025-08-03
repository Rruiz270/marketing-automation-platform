import dbConnect from '../../../lib/mongodb';
import Campaign from '../../../lib/models/Campaign';
import CampaignMetrics from '../../../lib/models/CampaignMetrics';
import AutomationRule from '../../../lib/models/AutomationRule';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { action, campaignId, adjustmentData, safeMode = true } = req.body;
  
  // Log actual data being used
  console.log('🎯 budget-automation.js called with data:', {
    hasCompanyData: !!companyData,
    hasProjectData: !!projectData,
    companyName: companyData?.companyName,
    projectName: projectData?.name,
    projectObjectives: projectData?.objectives,
    projectBudget: projectData?.budget,
    selectedPlatforms: projectData?.platforms
  });

    switch (action) {
      case 'analyze_budget_performance':
        const analysis = await analyzeBudgetPerformance(campaignId);
        res.status(200).json({
          success: true,
          data: analysis,
          message: 'Budget performance analyzed'
        });
        break;

      case 'recommend_adjustments':
        const recommendations = await generateBudgetRecommendations(campaignId);
        res.status(200).json({
          success: true,
          data: recommendations,
          message: 'Budget recommendations generated'
        });
        break;

      case 'execute_adjustment':
        const result = await executeBudgetAdjustment(campaignId, adjustmentData, safeMode);
        res.status(200).json({
          success: true,
          data: result,
          message: safeMode ? 'Adjustment pending approval' : 'Adjustment executed'
        });
        break;

      case 'approve_adjustment':
        const approval = await approveAdjustment(req.body.adjustmentId, req.body.approved);
        res.status(200).json({
          success: true,
          data: approval,
          message: 'Adjustment approval processed'
        });
        break;

      default:
        res.status(400).json({
          success: false,
          message: 'Invalid action specified'
        });
    }
  } catch (error) {
    console.error('Budget automation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in budget automation',
      error: error.message
    });
  }
}

async function analyzeBudgetPerformance(campaignId) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error('Campaign not found');

  // Get last 7 days of metrics
  const metrics = await CampaignMetrics.find({
    campaign_id: campaignId,
    date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  }).sort({ date: -1 });

  if (metrics.length === 0) {
    return {
      status: 'insufficient_data',
      message: 'Not enough data for analysis'
    };
  }

  // Calculate performance indicators
  const totalSpent = metrics.reduce((sum, m) => sum + m.metrics.cost, 0);
  const totalRevenue = metrics.reduce((sum, m) => sum + m.metrics.revenue, 0);
  const avgDailyCost = totalSpent / metrics.length;
  const avgROAS = totalRevenue / totalSpent;
  
  // Budget utilization
  const dailyBudget = campaign.budget.daily;
  const budgetUtilization = (avgDailyCost / dailyBudget) * 100;
  
  // Performance score calculation
  const performanceScore = calculatePerformanceScore(metrics, campaign);
  
  // AI-powered insights
  const insights = generatePerformanceInsights(performanceScore, budgetUtilization, avgROAS);

  return {
    campaign_id: campaignId,
    current_performance: {
      daily_spend: avgDailyCost.toFixed(2),
      daily_budget: dailyBudget,
      utilization_rate: budgetUtilization.toFixed(2),
      roas: avgROAS.toFixed(2),
      performance_score: performanceScore
    },
    ai_insights: insights,
    recommendations: insights.recommended_actions
  };
}

async function generateBudgetRecommendations(campaignId) {
  const analysis = await analyzeBudgetPerformance(campaignId);
  
  if (analysis.status === 'insufficient_data') {
    return analysis;
  }

  const { current_performance } = analysis;
  const recommendations = [];

  // AI-driven recommendation logic
  if (current_performance.performance_score > 8 && current_performance.utilization_rate < 90) {
    recommendations.push({
      type: 'increase_budget',
      confidence: 92,
      suggested_change: '+25%',
      reasoning: 'High performance with budget headroom available',
      projected_impact: {
        cost_increase: '25%',
        revenue_increase: '30-40%',
        roi_impact: '+15%'
      },
      risk_level: 'low'
    });
  }

  if (current_performance.roas < 2.0 && current_performance.utilization_rate > 95) {
    recommendations.push({
      type: 'decrease_budget',
      confidence: 88,
      suggested_change: '-20%',
      reasoning: 'Low ROAS with high budget utilization',
      projected_impact: {
        cost_decrease: '20%',
        revenue_impact: '-10%',
        roi_improvement: '+25%'
      },
      risk_level: 'medium'
    });
  }

  if (current_performance.performance_score < 4) {
    recommendations.push({
      type: 'pause_and_optimize',
      confidence: 95,
      suggested_change: 'pause',
      reasoning: 'Poor performance requiring immediate attention',
      projected_impact: {
        immediate_savings: current_performance.daily_spend,
        optimization_time: '2-3 days',
        expected_improvement: '40-60%'
      },
      risk_level: 'high'
    });
  }

  return {
    campaign_id: campaignId,
    total_recommendations: recommendations.length,
    recommendations,
    next_review_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    confidence_threshold: 85
  };
}

async function executeBudgetAdjustment(campaignId, adjustmentData, safeMode) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error('Campaign not found');

  const adjustment = {
    campaign_id: campaignId,
    type: adjustmentData.type,
    previous_budget: campaign.budget.daily,
    suggested_budget: adjustmentData.new_budget,
    confidence_score: adjustmentData.confidence || 85,
    reasoning: adjustmentData.reasoning,
    timestamp: new Date(),
    status: safeMode ? 'pending_approval' : 'executed',
    safe_mode: safeMode
  };

  if (safeMode) {
    // Store adjustment for manual approval
    const automationRule = new AutomationRule({
      name: `Budget Adjustment - ${campaign.name}`,
      description: `AI-recommended budget change: ${adjustmentData.reasoning}`,
      campaign_ids: [campaignId],
      trigger_conditions: {
        metric: 'roas',
        operator: adjustmentData.type === 'increase_budget' ? 'greater_than' : 'less_than',
        threshold_value: adjustmentData.trigger_value || 2.0
      },
      actions: [{
        type: 'adjust_budget',
        parameters: {
          budget_change_percentage: ((adjustmentData.new_budget - campaign.budget.daily) / campaign.budget.daily) * 100
        },
        requires_approval: true
      }],
      ai_settings: {
        confidence_threshold: 85,
        safe_mode: true
      },
      status: adjustment.confidence_score >= 85 ? 'active' : 'paused'
    });

    await automationRule.save();

    return {
      ...adjustment,
      approval_required: true,
      rule_id: automationRule._id,
      message: 'Adjustment created and waiting for approval'
    };
  } else {
    // Execute immediately (only if confidence is very high)
    if (adjustmentData.confidence < 90) {
      throw new Error('Automatic execution requires confidence >= 90%');
    }

    // Update campaign budget
    await Campaign.findByIdAndUpdate(campaignId, {
      'budget.daily': adjustmentData.new_budget
    });

    // Log the execution
    const executionLog = {
      executed_at: new Date(),
      trigger_data: adjustmentData,
      actions_taken: [`Budget changed from $${campaign.budget.daily} to $${adjustmentData.new_budget}`],
      confidence_score: adjustmentData.confidence,
      human_approved: false
    };

    return {
      ...adjustment,
      status: 'executed',
      execution_log: executionLog,
      message: 'Budget adjustment executed automatically'
    };
  }
}

async function approveAdjustment(ruleId, approved) {
  const rule = await AutomationRule.findById(ruleId);
  if (!rule) throw new Error('Automation rule not found');

  if (approved) {
    // Execute the approved adjustment
    const campaignId = rule.campaign_ids[0];
    const campaign = await Campaign.findById(campaignId);
    
    const budgetChangePercentage = rule.actions[0].parameters.budget_change_percentage;
    const newBudget = campaign.budget.daily * (1 + budgetChangePercentage / 100);

    await Campaign.findByIdAndUpdate(campaignId, {
      'budget.daily': newBudget
    });

    // Update rule execution history
    rule.execution_history.push({
      executed_at: new Date(),
      trigger_data: { approved_by_human: true },
      actions_taken: [`Budget adjusted by ${budgetChangePercentage.toFixed(2)}%`],
      confidence_score: rule.ai_settings.confidence_threshold,
      human_approved: true,
      results: {
        success: true,
        metrics_change: { new_budget: newBudget, previous_budget: campaign.budget.daily }
      }
    });

    rule.total_executions += 1;
    rule.status = 'active';
    await rule.save();

    return {
      status: 'approved_and_executed',
      new_budget: newBudget,
      campaign_id: campaignId,
      execution_time: new Date()
    };
  } else {
    // Mark as rejected
    rule.status = 'disabled';
    await rule.save();

    return {
      status: 'rejected',
      rule_id: ruleId,
      message: 'Adjustment rejected by human reviewer'
    };
  }
}

function calculatePerformanceScore(metrics, campaign) {
  if (metrics.length === 0) return 0;

  const latest = metrics[0];
  const avgMetrics = {
    ctr: metrics.reduce((sum, m) => sum + m.metrics.ctr, 0) / metrics.length,
    roas: metrics.reduce((sum, m) => sum + m.metrics.roas, 0) / metrics.length,
    quality_score: metrics.reduce((sum, m) => sum + m.metrics.quality_score, 0) / metrics.length
  };

  // Weighted performance score (0-10)
  const ctrScore = Math.min(10, avgMetrics.ctr * 2); // CTR weight
  const roasScore = Math.min(10, avgMetrics.roas * 2); // ROAS weight
  const qualityScore = avgMetrics.quality_score; // Quality score (already 1-10)

  return ((ctrScore * 0.3) + (roasScore * 0.5) + (qualityScore * 0.2));
}

function generatePerformanceInsights(performanceScore, budgetUtilization, avgROAS) {
  const insights = {
    overall_health: performanceScore > 7 ? 'excellent' : performanceScore > 5 ? 'good' : performanceScore > 3 ? 'fair' : 'poor',
    risk_level: performanceScore < 3 ? 'high' : performanceScore < 5 ? 'medium' : 'low',
    recommended_actions: [],
    confidence_level: Math.min(95, Math.max(60, 70 + (performanceScore * 2)))
  };

  if (performanceScore > 8) {
    insights.recommended_actions.push('Scale budget to maximize high performance');
    insights.recommended_actions.push('Consider expanding to similar audiences');
  } else if (performanceScore < 4) {
    insights.recommended_actions.push('Immediate optimization required');
    insights.recommended_actions.push('Review targeting and creatives');
    insights.recommended_actions.push('Consider pausing until improvements made');
  }

  if (budgetUtilization < 70) {
    insights.recommended_actions.push('Budget underutilized - consider increasing bids');
  } else if (budgetUtilization > 95) {
    insights.recommended_actions.push('Budget fully utilized - evaluate performance before increasing');
  }

  return insights;
}