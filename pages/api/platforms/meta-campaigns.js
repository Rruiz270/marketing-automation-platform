// Meta Campaign Management API
import { connectToDatabase } from '../../../lib/mongodb';
const bizSdk = require('facebook-nodejs-business-sdk');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, userId = 'default_user' } = req.body;

  try {
    // Get user's Meta connection
    const { db } = await connectToDatabase();
    const connection = await db.collection('platform_connections').findOne({
      userId,
      platform: 'meta',
      status: 'active'
    });

    if (!connection) {
      return res.status(400).json({ 
        error: 'Meta account not connected',
        action: 'Please connect your Meta account first'
      });
    }

    // Initialize Meta Business SDK
    const accessToken = connection.accessToken;
    const api = bizSdk.FacebookAdsApi.init(accessToken);

    switch (action) {
      case 'create_campaign':
        return createCampaign(req, res, api, connection);
      
      case 'create_adset':
        return createAdSet(req, res, api);
      
      case 'create_ad':
        return createAd(req, res, api);
      
      case 'get_campaigns':
        return getCampaigns(req, res, api, connection);
      
      case 'get_targeting_options':
        return getTargetingOptions(req, res, api);
        
      case 'get_performance':
        return getPerformance(req, res, api);
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Meta API error:', error);
    return res.status(500).json({ 
      error: 'Meta API request failed',
      details: error.message
    });
  }
}

async function createCampaign(req, res, api, connection) {
  const { campaignData } = req.body;
  
  try {
    // Use the first ad account
    const adAccountId = connection.adAccounts[0]?.id;
    if (!adAccountId) {
      throw new Error('No ad account found');
    }

    const AdAccount = bizSdk.AdAccount;
    const Campaign = bizSdk.Campaign;
    
    const account = new AdAccount(adAccountId);
    
    // Map our campaign objectives to Meta objectives
    const objectiveMap = {
      'awareness': Campaign.Objective.brand_awareness,
      'traffic': Campaign.Objective.link_clicks,
      'engagement': Campaign.Objective.engagement,
      'leads': Campaign.Objective.lead_generation,
      'conversions': Campaign.Objective.conversions,
      'sales': Campaign.Objective.catalog_sales
    };

    const campaign = await account.createCampaign(
      [],
      {
        [Campaign.Fields.name]: campaignData.name || 'Alumni Campaign',
        [Campaign.Fields.objective]: objectiveMap[campaignData.objective] || Campaign.Objective.conversions,
        [Campaign.Fields.status]: Campaign.Status.paused, // Start paused for safety
        [Campaign.Fields.special_ad_categories]: [], // Education doesn't require special categories
        [Campaign.Fields.buying_type]: 'AUCTION'
      }
    );

    // Save campaign to our database
    const { db } = await connectToDatabase();
    await db.collection('campaigns').insertOne({
      userId: req.body.userId,
      platform: 'meta',
      platformCampaignId: campaign.id,
      name: campaignData.name,
      objective: campaignData.objective,
      status: 'paused',
      createdAt: new Date(),
      campaignData: campaign._data
    });

    return res.status(200).json({
      success: true,
      campaignId: campaign.id,
      message: 'Campaign created successfully',
      campaign: campaign._data
    });

  } catch (error) {
    console.error('Campaign creation error:', error);
    return res.status(500).json({ 
      error: 'Failed to create campaign',
      details: error.message,
      errorData: error.response?.error
    });
  }
}

async function createAdSet(req, res, api) {
  const { campaignId, adSetData } = req.body;
  
  try {
    const AdSet = bizSdk.AdSet;
    const Campaign = bizSdk.Campaign;
    
    const campaign = new Campaign(campaignId);
    
    // Alumni-specific targeting for Brazil
    const targeting = {
      geo_locations: {
        countries: ['BR'],
        cities: adSetData.cities || [
          { key: '1043851', name: 'São Paulo' },
          { key: '1047379', name: 'Rio de Janeiro' }
        ]
      },
      age_min: adSetData.ageMin || 25,
      age_max: adSetData.ageMax || 55,
      genders: adSetData.genders || [1, 2], // All genders
      interests: [
        { id: '6003139266461', name: 'Higher education' },
        { id: '6003013522372', name: 'Online education' },
        { id: '6003397425735', name: 'Language learning' },
        { id: '6002884511422', name: 'Business English' }
      ],
      behaviors: [
        { id: '6002714895372', name: 'Small business owners' },
        { id: '6002714898572', name: 'Business decision makers' }
      ],
      education_statuses: [3, 4, 5, 6, 7, 8, 9], // College and above
      life_events: [
        { id: '6002714398172', name: 'Recently moved' },
        { id: '6015559470583', name: 'New job' }
      ]
    };

    const adSet = await campaign.createAdSet(
      [],
      {
        [AdSet.Fields.name]: adSetData.name || 'Alumni - Professionals 25-55',
        [AdSet.Fields.optimization_goal]: AdSet.OptimizationGoal.lead_generation,
        [AdSet.Fields.billing_event]: AdSet.BillingEvent.impressions,
        [AdSet.Fields.bid_amount]: adSetData.bidAmount || 1000, // In cents
        [AdSet.Fields.daily_budget]: adSetData.dailyBudget || 5000, // R$50 daily
        [AdSet.Fields.campaign_id]: campaignId,
        [AdSet.Fields.targeting]: targeting,
        [AdSet.Fields.status]: AdSet.Status.paused,
        [AdSet.Fields.promoted_object]: {
          page_id: adSetData.pageId // Facebook Page ID required
        }
      }
    );

    return res.status(200).json({
      success: true,
      adSetId: adSet.id,
      message: 'Ad set created successfully',
      adSet: adSet._data
    });

  } catch (error) {
    console.error('Ad set creation error:', error);
    return res.status(500).json({ 
      error: 'Failed to create ad set',
      details: error.message
    });
  }
}

async function createAd(req, res, api) {
  const { adSetId, adData, creativeData } = req.body;
  
  try {
    const AdCreative = bizSdk.AdCreative;
    const Ad = bizSdk.Ad;
    const AdSet = bizSdk.AdSet;
    
    const adSet = new AdSet(adSetId);
    
    // Create ad creative first
    const creative = await adSet.createAdCreative(
      [],
      {
        [AdCreative.Fields.name]: creativeData.name || 'Alumni Creative',
        [AdCreative.Fields.object_story_spec]: {
          page_id: creativeData.pageId,
          link_data: {
            link: creativeData.link || 'https://alumni.com.br',
            message: creativeData.message || 'Transform your career with professional English courses',
            name: creativeData.headline || 'Alumni English School - 60+ Years of Excellence',
            description: creativeData.description || 'Join thousands of professionals who advanced their careers with our certified English programs',
            call_to_action: {
              type: 'LEARN_MORE',
              value: { link: creativeData.link }
            },
            image_hash: creativeData.imageHash // Need to upload image first
          }
        }
      }
    );

    // Create the ad
    const ad = await adSet.createAd(
      [],
      {
        [Ad.Fields.name]: adData.name || 'Alumni Ad',
        [Ad.Fields.adset_id]: adSetId,
        [Ad.Fields.creative]: { creative_id: creative.id },
        [Ad.Fields.status]: Ad.Status.paused
      }
    );

    return res.status(200).json({
      success: true,
      adId: ad.id,
      creativeId: creative.id,
      message: 'Ad created successfully',
      ad: ad._data
    });

  } catch (error) {
    console.error('Ad creation error:', error);
    return res.status(500).json({ 
      error: 'Failed to create ad',
      details: error.message
    });
  }
}

async function getCampaigns(req, res, api, connection) {
  try {
    const adAccountId = connection.adAccounts[0]?.id;
    const AdAccount = bizSdk.AdAccount;
    const Campaign = bizSdk.Campaign;
    
    const account = new AdAccount(adAccountId);
    const campaigns = await account.getCampaigns(
      [
        Campaign.Fields.id,
        Campaign.Fields.name,
        Campaign.Fields.status,
        Campaign.Fields.objective,
        Campaign.Fields.created_time,
        Campaign.Fields.updated_time
      ],
      { limit: 50 }
    );

    return res.status(200).json({
      success: true,
      campaigns: campaigns.map(c => c._data),
      count: campaigns.length
    });

  } catch (error) {
    console.error('Get campaigns error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch campaigns',
      details: error.message
    });
  }
}

async function getTargetingOptions(req, res, api) {
  // Return Alumni-specific targeting suggestions for Brazil education market
  const suggestions = {
    interests: [
      { id: '6003139266461', name: 'Higher education', audience_size: 450000000 },
      { id: '6003013522372', name: 'Online education', audience_size: 280000000 },
      { id: '6003397425735', name: 'Language learning', audience_size: 120000000 },
      { id: '6002884511422', name: 'Business English', audience_size: 85000000 },
      { id: '6003248973172', name: 'Professional development', audience_size: 320000000 },
      { id: '6003476182657', name: 'Career advancement', audience_size: 210000000 }
    ],
    behaviors: [
      { id: '6002714895372', name: 'Small business owners', audience_size: 92000000 },
      { id: '6002714898572', name: 'Business decision makers', audience_size: 67000000 },
      { id: '6004386044572', name: 'Frequent international travelers', audience_size: 45000000 },
      { id: '6015235495383', name: 'Job seekers', audience_size: 180000000 }
    ],
    demographics: {
      education: [
        { id: 3, name: 'High school graduate' },
        { id: 4, name: 'Some college' },
        { id: 5, name: 'Associate degree' },
        { id: 6, name: 'Bachelor\'s degree' },
        { id: 7, name: 'Master\'s degree' },
        { id: 8, name: 'Professional degree' },
        { id: 9, name: 'Doctorate degree' }
      ],
      income_levels: [
        { id: 4, name: 'R$2,500 - R$5,000/month' },
        { id: 5, name: 'R$5,000 - R$10,000/month' },
        { id: 6, name: 'R$10,000 - R$20,000/month' },
        { id: 7, name: 'R$20,000+/month' }
      ]
    },
    brazil_specific: {
      cities: [
        { key: '1043851', name: 'São Paulo', population: 12000000 },
        { key: '1047379', name: 'Rio de Janeiro', population: 6700000 },
        { key: '1049991', name: 'Brasília', population: 3000000 },
        { key: '1043854', name: 'Belo Horizonte', population: 2500000 },
        { key: '1048859', name: 'Curitiba', population: 1900000 }
      ],
      regions: [
        { name: 'Southeast', states: ['SP', 'RJ', 'MG', 'ES'] },
        { name: 'South', states: ['PR', 'SC', 'RS'] }
      ]
    }
  };

  return res.status(200).json({
    success: true,
    targetingOptions: suggestions
  });
}

async function getPerformance(req, res, api) {
  const { campaignId, dateRange = 'last_30d' } = req.body;
  
  try {
    const Campaign = bizSdk.Campaign;
    const campaign = new Campaign(campaignId);
    
    const insights = await campaign.getInsights(
      [
        'impressions',
        'reach',
        'clicks',
        'ctr',
        'cpc',
        'cpm',
        'conversions',
        'conversion_rate',
        'cost_per_conversion',
        'spend'
      ],
      {
        date_preset: dateRange,
        breakdowns: ['age', 'gender', 'device_platform']
      }
    );

    return res.status(200).json({
      success: true,
      performance: insights[0]?._data || {},
      message: 'Performance data retrieved'
    });

  } catch (error) {
    console.error('Get performance error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch performance data',
      details: error.message
    });
  }
}