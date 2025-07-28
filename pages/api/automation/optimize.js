import dbConnect from '../../../lib/mongodb';
import Campaign from '../../../lib/models/Campaign';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { campaignId, optimizationType } = req.body;
    
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    let optimizationResult = {};

    switch (optimizationType) {
      case 'bid_optimization':
        optimizationResult = await optimizeBids(campaign);
        break;
      case 'budget_optimization':
        optimizationResult = await optimizeBudget(campaign);
        break;
      case 'keyword_optimization':
        optimizationResult = await optimizeKeywords(campaign);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid optimization type'
        });
    }

    // Update campaign with optimization changes
    await Campaign.findByIdAndUpdate(campaignId, optimizationResult.updates);

    res.status(200).json({
      success: true,
      data: optimizationResult,
      message: `${optimizationType} completed successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during optimization',
      error: error.message
    });
  }
}

async function optimizeBids(campaign) {
  const currentRoas = campaign.roas || 0;
  const targetRoas = campaign.bidding.target_roas || 3;
  const currentBid = campaign.bidding.amount || 1;
  
  let newBid = currentBid;
  let action = 'maintained';
  
  if (currentRoas > targetRoas * 1.2) {
    // ROAS is 20% above target, increase bids by 15%
    newBid = currentBid * 1.15;
    action = 'increased';
  } else if (currentRoas < targetRoas * 0.8) {
    // ROAS is 20% below target, decrease bids by 10%
    newBid = currentBid * 0.9;
    action = 'decreased';
  }
  
  return {
    updates: {
      'bidding.amount': newBid
    },
    changes: {
      previousBid: currentBid,
      newBid: newBid,
      action: action,
      reason: `ROAS (${currentRoas.toFixed(2)}) vs Target (${targetRoas})`
    }
  };
}

async function optimizeBudget(campaign) {
  const dailyBudget = campaign.budget.daily;
  const currentSpend = campaign.budget.spent;
  const performance = campaign.performance || {};
  
  // Calculate spend rate and performance metrics
  const spendRate = currentSpend / dailyBudget;
  const ctr = performance.clicks / performance.impressions * 100 || 0;
  
  let budgetAdjustment = 0;
  let action = 'maintained';
  
  if (ctr > 3 && campaign.roas > 3) {
    // High performance, increase budget by 20%
    budgetAdjustment = 0.2;
    action = 'increased';
  } else if (ctr < 1 || campaign.roas < 1) {
    // Poor performance, decrease budget by 15%
    budgetAdjustment = -0.15;
    action = 'decreased';
  }
  
  const newBudget = dailyBudget * (1 + budgetAdjustment);
  
  return {
    updates: {
      'budget.daily': newBudget
    },
    changes: {
      previousBudget: dailyBudget,
      newBudget: newBudget,
      action: action,
      reason: `CTR: ${ctr.toFixed(2)}%, ROAS: ${campaign.roas?.toFixed(2) || 0}`
    }
  };
}

async function optimizeKeywords(campaign) {
  // Simulate keyword optimization
  const keywords = campaign.targeting?.keywords || [];
  const optimizedKeywords = keywords.map(keyword => {
    // Add match type optimization logic here
    return {
      original: keyword,
      optimized: keyword,
      recommendation: 'Consider phrase match for better targeting'
    };
  });
  
  return {
    updates: {},
    changes: {
      keywordOptimizations: optimizedKeywords,
      action: 'analyzed',
      reason: 'Keyword performance analysis completed'
    }
  };
}