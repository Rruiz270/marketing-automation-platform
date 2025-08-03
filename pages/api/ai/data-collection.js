import dbConnect from '../../../lib/mongodb';
import CampaignMetrics from '../../../lib/models/CampaignMetrics';
import Campaign from '../../../lib/models/Campaign';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { action, platform, campaignIds } = req.body;
  
  // Log actual data being used
  console.log('🎯 data-collection.js called with data:', {
    hasCompanyData: !!companyData,
    hasProjectData: !!projectData,
    companyName: companyData?.companyName,
    projectName: projectData?.name,
    projectObjectives: projectData?.objectives,
    projectBudget: projectData?.budget,
    selectedPlatforms: projectData?.platforms
  });

    switch (action) {
      case 'collect_daily_data':
        const results = await collectDailyMetrics(platform, campaignIds);
        res.status(200).json({
          success: true,
          data: results,
          message: 'Daily metrics collected successfully'
        });
        break;

      case 'analyze_trends':
        const analysis = await analyzeTrends(campaignIds);
        res.status(200).json({
          success: true,
          data: analysis,
          message: 'Trend analysis completed'
        });
        break;

      case 'detect_anomalies':
        const anomalies = await detectAnomalies(campaignIds);
        res.status(200).json({
          success: true,
          data: anomalies,
          message: 'Anomaly detection completed'
        });
        break;

      default:
        res.status(400).json({
          success: false,
          message: 'Invalid action specified'
        });
    }
  } catch (error) {
    console.error('Data collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in data collection',
      error: error.message
    });
  }
}

async function collectDailyMetrics(platform, campaignIds) {
  const results = [];
  
  for (const campaignId of campaignIds) {
    try {
      // Simulate API calls to different platforms
      const platformData = await fetchPlatformData(platform, campaignId);
      
      // Store metrics in database
      const metrics = new CampaignMetrics({
        campaign_id: campaignId,
        platform: platform,
        date: new Date(),
        metrics: {
          impressions: platformData.impressions || 0,
          clicks: platformData.clicks || 0,
          conversions: platformData.conversions || 0,
          cost: platformData.cost || 0,
          revenue: platformData.revenue || 0,
          quality_score: platformData.quality_score || 0
        }
      });
      
      await metrics.save();
      results.push({
        campaignId,
        metrics: metrics.metrics,
        status: 'collected'
      });
      
    } catch (error) {
      results.push({
        campaignId,
        status: 'error',
        error: error.message
      });
    }
  }
  
  return results;
}

async function fetchPlatformData(platform, campaignId) {
  // Simulate different platform API responses
  const simulatedData = {
    google_ads: {
      impressions: Math.floor(Math.random() * 10000) + 1000,
      clicks: Math.floor(Math.random() * 500) + 50,
      conversions: Math.floor(Math.random() * 50) + 5,
      cost: Math.floor(Math.random() * 1000) + 100,
      revenue: Math.floor(Math.random() * 2000) + 200,
      quality_score: Math.floor(Math.random() * 10) + 1
    },
    facebook_ads: {
      impressions: Math.floor(Math.random() * 15000) + 2000,
      clicks: Math.floor(Math.random() * 800) + 100,
      conversions: Math.floor(Math.random() * 80) + 10,
      cost: Math.floor(Math.random() * 1500) + 150,
      revenue: Math.floor(Math.random() * 3000) + 300,
      quality_score: Math.floor(Math.random() * 10) + 1
    }
  };
  
  // In production, this would make actual API calls:
  // - Google Ads API: googleads.googleapis.com
  // - Facebook Marketing API: graph.facebook.com
  // - LinkedIn Marketing API: api.linkedin.com
  
  return simulatedData[platform] || simulatedData.google_ads;
}

async function analyzeTrends(campaignIds) {
  const trends = [];
  
  for (const campaignId of campaignIds) {
    // Get last 7 days of metrics
    const metrics = await CampaignMetrics.find({
      campaign_id: campaignId,
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).sort({ date: -1 });
    
    if (metrics.length < 2) continue;
    
    const latest = metrics[0];
    const previous = metrics[1];
    
    // Calculate trends
    const ctrChange = ((latest.metrics.ctr - previous.metrics.ctr) / previous.metrics.ctr) * 100;
    const costChange = ((latest.metrics.cost - previous.metrics.cost) / previous.metrics.cost) * 100;
    const conversionChange = ((latest.metrics.conversions - previous.metrics.conversions) / previous.metrics.conversions) * 100;
    
    // Determine trend direction
    const ctrTrend = Math.abs(ctrChange) < 5 ? 'stable' : (ctrChange > 0 ? 'up' : 'down');
    const costTrend = Math.abs(costChange) < 5 ? 'stable' : (costChange > 0 ? 'up' : 'down');
    const conversionTrend = Math.abs(conversionChange) < 5 ? 'stable' : (conversionChange > 0 ? 'up' : 'down');
    
    // Update trends in database
    await CampaignMetrics.findByIdAndUpdate(latest._id, {
      'trends.ctr_trend': ctrTrend,
      'trends.cost_trend': costTrend,
      'trends.conversion_trend': conversionTrend,
      'trends.confidence_score': Math.min(95, Math.max(60, 85 + Math.random() * 10))
    });
    
    trends.push({
      campaignId,
      trends: {
        ctr: { direction: ctrTrend, change: ctrChange.toFixed(2) },
        cost: { direction: costTrend, change: costChange.toFixed(2) },
        conversions: { direction: conversionTrend, change: conversionChange.toFixed(2) }
      }
    });
  }
  
  return trends;
}

async function detectAnomalies(campaignIds) {
  const anomalies = [];
  
  for (const campaignId of campaignIds) {
    // Get last 30 days for baseline
    const metrics = await CampaignMetrics.find({
      campaign_id: campaignId,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ date: -1 });
    
    if (metrics.length < 7) continue;
    
    const latest = metrics[0];
    const historical = metrics.slice(1, 15); // Use 14 days as baseline
    
    // Calculate statistical thresholds
    const avgCTR = historical.reduce((sum, m) => sum + m.metrics.ctr, 0) / historical.length;
    const avgCost = historical.reduce((sum, m) => sum + m.metrics.cost, 0) / historical.length;
    const avgConversions = historical.reduce((sum, m) => sum + m.metrics.conversions, 0) / historical.length;
    
    // Standard deviation calculation (simplified)
    const ctrStdDev = Math.sqrt(historical.reduce((sum, m) => sum + Math.pow(m.metrics.ctr - avgCTR, 2), 0) / historical.length);
    const costStdDev = Math.sqrt(historical.reduce((sum, m) => sum + Math.pow(m.metrics.cost - avgCost, 2), 0) / historical.length);
    
    // Detect anomalies (beyond 2 standard deviations)
    const anomalyDetected = 
      Math.abs(latest.metrics.ctr - avgCTR) > (2 * ctrStdDev) ||
      Math.abs(latest.metrics.cost - avgCost) > (2 * costStdDev) ||
      latest.metrics.conversions < (avgConversions * 0.5); // 50% drop in conversions
    
    if (anomalyDetected) {
      // Update anomaly flag
      await CampaignMetrics.findByIdAndUpdate(latest._id, {
        'trends.anomaly_detected': true,
        'ai_insights.risk_level': 'high',
        'ai_insights.recommended_actions': [
          'Review campaign settings',
          'Check for external factors',
          'Consider budget adjustment',
          'Analyze competitor activity'
        ]
      });
      
      anomalies.push({
        campaignId,
        anomalyType: 'performance_drop',
        severity: 'high',
        detectedMetrics: {
          ctr: latest.metrics.ctr,
          avgCTR,
          costIncrease: ((latest.metrics.cost - avgCost) / avgCost * 100).toFixed(2)
        },
        recommendedActions: [
          'Immediate review required',
          'Consider pausing underperforming ads',
          'Analyze recent changes'
        ]
      });
    }
  }
  
  return anomalies;
}