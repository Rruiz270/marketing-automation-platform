import dbConnect from '../../../lib/mongodb';
import ApiCredentials from '../../../lib/models/ApiCredentials';
import Campaign from '../../../lib/models/Campaign';
import CampaignMetrics from '../../../lib/models/CampaignMetrics';
import GoogleAdsIntegration from '../../../lib/integrations/google-ads';
import FacebookAdsIntegration from '../../../lib/integrations/facebook-ads';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { action, user_id, platform, campaign_ids } = req.body;

    switch (action) {
      case 'sync_campaigns':
        const syncResult = await syncCampaignsFromPlatform(user_id, platform);
        res.status(200).json({
          success: true,
          data: syncResult,
          message: 'Campaigns synchronized successfully'
        });
        break;

      case 'sync_all_platforms':
        const allSyncResults = await syncAllPlatforms(user_id);
        res.status(200).json({
          success: true,
          data: allSyncResults,
          message: 'All platforms synchronized'
        });
        break;

      case 'sync_metrics':
        const metricsResult = await syncCampaignMetrics(user_id, platform, campaign_ids);
        res.status(200).json({
          success: true,
          data: metricsResult,
          message: 'Metrics synchronized successfully'
        });
        break;

      case 'get_sync_status':
        const status = await getSyncStatus(user_id);
        res.status(200).json({
          success: true,
          data: status
        });
        break;

      default:
        res.status(400).json({
          success: false,
          message: 'Invalid action specified'
        });
    }
  } catch (error) {
    console.error('Data sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Error synchronizing data',
      error: error.message
    });
  }
}

async function syncCampaignsFromPlatform(userId, platform) {
  const credentials = await ApiCredentials.findActiveCredentials(userId, platform);
  
  if (!credentials) {
    throw new Error(`No active credentials found for ${platform}`);
  }

  const decryptedCreds = credentials.getDecryptedCredentials();
  let integration;
  let campaigns = [];

  try {
    // Initialize the appropriate integration
    switch (platform) {
      case 'google_ads':
        integration = new GoogleAdsIntegration();
        await integration.initialize({
          refresh_token: decryptedCreds.refresh_token,
          customer_id: decryptedCreds.customer_id
        });
        campaigns = await integration.getCampaigns();
        break;

      case 'facebook_ads':
        integration = new FacebookAdsIntegration();
        await integration.initialize({
          access_token: decryptedCreds.access_token_fb,
          ad_account_id: decryptedCreds.ad_account_id
        });
        campaigns = await integration.getCampaigns();
        break;

      default:
        throw new Error(`Platform ${platform} not supported`);
    }

    // Save or update campaigns in database
    const syncResults = {
      platform: platform,
      campaigns_found: campaigns.length,
      campaigns_updated: 0,
      campaigns_created: 0,
      errors: []
    };

    for (const campaignData of campaigns) {
      try {
        // Check if campaign already exists
        const existingCampaign = await Campaign.findOne({
          external_id: campaignData.id,
          platform: platform,
          user_id: userId
        });

        if (existingCampaign) {
          // Update existing campaign
          Object.assign(existingCampaign, {
            name: campaignData.name,
            status: campaignData.status,
            budget: campaignData.budget,
            performance: campaignData.performance,
            last_synced: new Date(),
            sync_metadata: {
              platform_data: campaignData,
              last_update_source: 'api_sync'
            }
          });
          
          await existingCampaign.save();
          syncResults.campaigns_updated++;
        } else {
          // Create new campaign
          const newCampaign = new Campaign({
            user_id: userId,
            external_id: campaignData.id,
            name: campaignData.name,
            type: campaignData.type,
            platform: platform,
            status: campaignData.status,
            objective: campaignData.objective || 'conversions',
            budget: campaignData.budget,
            performance: campaignData.performance,
            targeting: campaignData.targeting || {},
            created_date: campaignData.dates?.created_time || new Date(),
            last_synced: new Date(),
            sync_metadata: {
              platform_data: campaignData,
              sync_source: 'api_sync'
            }
          });
          
          await newCampaign.save();
          syncResults.campaigns_created++;
        }

        // Also sync recent metrics for this campaign
        await syncCampaignMetricsForCampaign(
          userId, 
          platform, 
          campaignData.id, 
          campaignData.performance
        );

      } catch (campaignError) {
        console.error(`Error syncing campaign ${campaignData.id}:`, campaignError);
        syncResults.errors.push({
          campaign_id: campaignData.id,
          campaign_name: campaignData.name,
          error: campaignError.message
        });
      }
    }

    // Update credentials sync time
    await credentials.updateLastSync();

    return syncResults;

  } catch (error) {
    // Log error in credentials
    await credentials.logError(error.message, 'CAMPAIGN_SYNC_FAILED');
    throw error;
  }
}

async function syncAllPlatforms(userId) {
  const allCredentials = await ApiCredentials.find({
    user_id: userId,
    status: 'active'
  });

  const results = [];
  
  for (const credentials of allCredentials) {
    try {
      const syncResult = await syncCampaignsFromPlatform(userId, credentials.platform);
      results.push({
        platform: credentials.platform,
        success: true,
        ...syncResult
      });
    } catch (error) {
      results.push({
        platform: credentials.platform,
        success: false,
        error: error.message
      });
    }
  }

  return {
    platforms_synced: results.length,
    successful_syncs: results.filter(r => r.success).length,
    failed_syncs: results.filter(r => !r.success).length,
    results: results,
    sync_timestamp: new Date()
  };
}

async function syncCampaignMetrics(userId, platform, campaignIds) {
  const credentials = await ApiCredentials.findActiveCredentials(userId, platform);
  
  if (!credentials) {
    throw new Error(`No active credentials found for ${platform}`);
  }

  const decryptedCreds = credentials.getDecryptedCredentials();
  let integration;

  // Initialize integration
  switch (platform) {
    case 'google_ads':
      integration = new GoogleAdsIntegration();
      await integration.initialize({
        refresh_token: decryptedCreds.refresh_token,
        customer_id: decryptedCreds.customer_id
      });
      break;

    case 'facebook_ads':
      integration = new FacebookAdsIntegration();
      await integration.initialize({
        access_token: decryptedCreds.access_token_fb,
        ad_account_id: decryptedCreds.ad_account_id
      });
      break;

    default:
      throw new Error(`Platform ${platform} not supported`);
  }

  const metricsResults = {
    platform: platform,
    campaigns_processed: 0,
    metrics_created: 0,
    errors: []
  };

  // If no specific campaign IDs provided, get all campaigns for this user and platform
  let targetCampaignIds = campaignIds;
  if (!targetCampaignIds || targetCampaignIds.length === 0) {
    const campaigns = await Campaign.find({
      user_id: userId,
      platform: platform,
      status: { $in: ['active', 'paused'] }
    }).select('external_id');
    
    targetCampaignIds = campaigns.map(c => c.external_id);
  }

  // Sync metrics for each campaign
  for (const campaignId of targetCampaignIds) {
    try {
      // Get fresh campaign data
      const campaigns = await integration.getCampaigns();
      const campaignData = campaigns.find(c => c.id === campaignId);
      
      if (campaignData) {
        await syncCampaignMetricsForCampaign(
          userId, 
          platform, 
          campaignId, 
          campaignData.performance
        );
        
        metricsResults.campaigns_processed++;
        metricsResults.metrics_created++;
      }
    } catch (error) {
      metricsResults.errors.push({
        campaign_id: campaignId,
        error: error.message
      });
    }
  }

  return metricsResults;
}

async function syncCampaignMetricsForCampaign(userId, platform, externalCampaignId, performanceData) {
  // Find the internal campaign
  const campaign = await Campaign.findOne({
    user_id: userId,
    external_id: externalCampaignId,
    platform: platform
  });

  if (!campaign) {
    throw new Error(`Campaign ${externalCampaignId} not found in database`);
  }

  // Check if we already have metrics for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingMetrics = await CampaignMetrics.findOne({
    campaign_id: campaign._id,
    platform: platform,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    }
  });

  const metricsData = {
    campaign_id: campaign._id,
    platform: platform,
    date: new Date(),
    metrics: {
      impressions: performanceData.impressions || 0,
      clicks: performanceData.clicks || 0,
      conversions: performanceData.conversions || 0,
      cost: performanceData.cost || 0,
      revenue: performanceData.revenue || 0,
      ctr: performanceData.ctr || 0,
      cpc: performanceData.cpc || 0,
      quality_score: performanceData.quality_score || 0
    }
  };

  if (existingMetrics) {
    // Update existing metrics
    Object.assign(existingMetrics, metricsData);
    await existingMetrics.save();
  } else {
    // Create new metrics record
    const newMetrics = new CampaignMetrics(metricsData);
    await newMetrics.save();
  }

  // Also update the campaign's current performance
  campaign.performance = metricsData.metrics;
  campaign.last_synced = new Date();
  await campaign.save();
}

async function getSyncStatus(userId) {
  const credentials = await ApiCredentials.find({
    user_id: userId
  }).select('platform status last_sync error_log account_info');

  const campaigns = await Campaign.find({
    user_id: userId
  }).select('platform last_synced status');

  const status = {
    connected_platforms: credentials.length,
    active_platforms: credentials.filter(c => c.status === 'active').length,
    total_campaigns: campaigns.length,
    platforms: credentials.map(cred => ({
      platform: cred.platform,
      status: cred.status,
      account_name: cred.account_info.account_name,
      last_sync: cred.last_sync,
      campaigns_count: campaigns.filter(c => c.platform === cred.platform).length,
      has_errors: cred.error_log.some(error => !error.resolved),
      recent_errors: cred.error_log
        .filter(error => !error.resolved)
        .slice(-3)
        .map(error => ({
          message: error.error_message,
          occurred_at: error.occurred_at
        }))
    })),
    last_global_sync: credentials.reduce((latest, cred) => {
      return (!latest || (cred.last_sync && cred.last_sync > latest)) ? cred.last_sync : latest;
    }, null)
  };

  return status;
}