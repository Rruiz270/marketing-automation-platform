import { FacebookAdsApi, AdAccount, Campaign, AdSet, Ad } from 'facebook-nodejs-business-sdk';

class FacebookAdsIntegration {
  constructor() {
    this.api = null;
    this.adAccountId = null;
    this.accessToken = null;
  }

  async initialize(credentials) {
    try {
      this.accessToken = credentials.access_token;
      this.adAccountId = credentials.ad_account_id;

      // Initialize Facebook Ads API
      FacebookAdsApi.init(this.accessToken);
      this.api = FacebookAdsApi.getDefaultApi();

      // Test the connection
      const account = new AdAccount(this.adAccountId);
      await account.read(['name', 'account_status']);

      return { success: true, message: 'Facebook Ads API initialized successfully' };
    } catch (error) {
      console.error('Facebook Ads API initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  async getCampaigns() {
    if (!this.api || !this.adAccountId) {
      throw new Error('Facebook Ads API not initialized');
    }

    try {
      const account = new AdAccount(this.adAccountId);
      
      const campaigns = await account.getCampaigns([
        'id',
        'name',
        'status',
        'objective',
        'created_time',
        'start_time',
        'stop_time',
        'daily_budget',
        'lifetime_budget',
        'budget_remaining'
      ], {
        time_range: {
          since: this.getDateDaysAgo(30),
          until: this.getDateDaysAgo(0)
        }
      });

      // Get insights for each campaign
      const campaignsWithInsights = await Promise.all(
        campaigns.map(async (campaign) => {
          try {
            const insights = await campaign.getInsights([
              'impressions',
              'clicks',
              'spend',
              'actions',
              'action_values',
              'ctr',
              'cpc',
              'cpp',
              'cpm'
            ], {
              time_range: {
                since: this.getDateDaysAgo(30),
                until: this.getDateDaysAgo(0)
              }
            });

            const insight = insights[0] || {};
            const conversions = this.extractConversions(insight.actions);
            const revenue = this.extractRevenue(insight.action_values);

            return {
              id: campaign.id,
              name: campaign.name,
              status: this.mapCampaignStatus(campaign.status),
              type: 'facebook_ads',
              platform: 'Facebook Ads',
              objective: campaign.objective,
              budget: {
                daily: campaign.daily_budget ? 
                  (parseInt(campaign.daily_budget) / 100) : 0,
                lifetime: campaign.lifetime_budget ? 
                  (parseInt(campaign.lifetime_budget) / 100) : 0,
                remaining: campaign.budget_remaining ? 
                  (parseInt(campaign.budget_remaining) / 100) : 0
              },
              performance: {
                impressions: parseInt(insight.impressions || 0),
                clicks: parseInt(insight.clicks || 0),
                conversions: conversions,
                cost: parseFloat(insight.spend || 0),
                revenue: revenue,
                ctr: parseFloat(insight.ctr || 0),
                cpc: parseFloat(insight.cpc || 0),
                cpm: parseFloat(insight.cpm || 0)
              },
              dates: {
                created_time: campaign.created_time,
                start_time: campaign.start_time,
                stop_time: campaign.stop_time
              }
            };
          } catch (insightError) {
            console.warn(`Could not fetch insights for campaign ${campaign.id}:`, insightError.message);
            return {
              id: campaign.id,
              name: campaign.name,
              status: this.mapCampaignStatus(campaign.status),
              type: 'facebook_ads',
              platform: 'Facebook Ads',
              objective: campaign.objective,
              budget: {
                daily: campaign.daily_budget ? (parseInt(campaign.daily_budget) / 100) : 0
              },
              performance: {
                impressions: 0,
                clicks: 0,
                conversions: 0,
                cost: 0,
                revenue: 0,
                ctr: 0,
                cpc: 0
              }
            };
          }
        })
      );

      return campaignsWithInsights;
    } catch (error) {
      console.error('Error fetching Facebook campaigns:', error);
      throw new Error(`Failed to fetch campaigns: ${error.message}`);
    }
  }

  async getAdSets(campaignId) {
    if (!this.api) {
      throw new Error('Facebook Ads API not initialized');
    }

    try {
      const campaign = new Campaign(campaignId);
      
      const adSets = await campaign.getAdSets([
        'id',
        'name',
        'status',
        'daily_budget',
        'lifetime_budget',
        'targeting',
        'optimization_goal',
        'billing_event'
      ]);

      return adSets.map(adSet => ({
        id: adSet.id,
        name: adSet.name,
        status: this.mapAdSetStatus(adSet.status),
        campaign_id: campaignId,
        budget: {
          daily: adSet.daily_budget ? (parseInt(adSet.daily_budget) / 100) : 0,
          lifetime: adSet.lifetime_budget ? (parseInt(adSet.lifetime_budget) / 100) : 0
        },
        targeting: adSet.targeting,
        optimization_goal: adSet.optimization_goal,
        billing_event: adSet.billing_event
      }));
    } catch (error) {
      console.error('Error fetching ad sets:', error);
      throw new Error(`Failed to fetch ad sets: ${error.message}`);
    }
  }

  async updateCampaignBudget(campaignId, newBudgetAmount) {
    if (!this.api) {
      throw new Error('Facebook Ads API not initialized');
    }

    try {
      const campaign = new Campaign(campaignId);
      
      // Update daily budget (convert to cents)
      const result = await campaign.update({
        daily_budget: Math.round(newBudgetAmount * 100)
      });

      return {
        success: true,
        campaign_id: campaignId,
        new_budget: newBudgetAmount,
        result: result
      };
    } catch (error) {
      console.error('Error updating Facebook campaign budget:', error);
      throw new Error(`Failed to update budget: ${error.message}`);
    }
  }

  async pauseCampaign(campaignId) {
    if (!this.api) {
      throw new Error('Facebook Ads API not initialized');
    }

    try {
      const campaign = new Campaign(campaignId);
      
      const result = await campaign.update({
        status: 'PAUSED'
      });

      return {
        success: true,
        campaign_id: campaignId,
        status: 'paused',
        result: result
      };
    } catch (error) {
      console.error('Error pausing Facebook campaign:', error);
      throw new Error(`Failed to pause campaign: ${error.message}`);
    }
  }

  async createTextAd(adSetId, creative) {
    if (!this.api) {
      throw new Error('Facebook Ads API not initialized');
    }

    try {
      // Create ad creative first
      const account = new AdAccount(this.adAccountId);
      
      const adCreative = await account.createAdCreative({
        object_story_spec: {
          page_id: creative.page_id,
          link_data: {
            link: creative.link_url,
            message: creative.message,
            name: creative.headline,
            description: creative.description,
            call_to_action: {
              type: creative.call_to_action || 'LEARN_MORE'
            }
          }
        }
      });

      // Create the ad
      const adSet = new AdSet(adSetId);
      const ad = await adSet.createAd({
        name: creative.name,
        creative: {
          creative_id: adCreative.id
        },
        status: 'PAUSED' // Start paused for review
      });

      return {
        success: true,
        ad_id: ad.id,
        creative_id: adCreative.id,
        ad_set_id: adSetId
      };
    } catch (error) {
      console.error('Error creating Facebook ad:', error);
      throw new Error(`Failed to create ad: ${error.message}`);
    }
  }

  async getAudienceInsights(targetingSpec) {
    if (!this.api) {
      throw new Error('Facebook Ads API not initialized');
    }

    try {
      const account = new AdAccount(this.adAccountId);
      
      const insights = await account.getInsights([], {
        targeting: targetingSpec,
        time_range: {
          since: this.getDateDaysAgo(30),
          until: this.getDateDaysAgo(0)
        }
      });

      return {
        potential_reach: insights.length > 0 ? insights[0].reach : 0,
        audience_size: 'Available with proper permissions',
        demographics: 'Available with proper permissions'
      };
    } catch (error) {
      console.warn('Audience insights not available:', error.message);
      return {
        potential_reach: 0,
        note: 'Audience insights require additional permissions'
      };
    }
  }

  // Helper methods
  extractConversions(actions) {
    if (!actions) return 0;
    
    const conversionActions = actions.filter(action => 
      ['purchase', 'lead', 'complete_registration', 'add_to_cart'].includes(action.action_type)
    );
    
    return conversionActions.reduce((total, action) => 
      total + parseInt(action.value || 0), 0
    );
  }

  extractRevenue(actionValues) {
    if (!actionValues) return 0;
    
    const revenueActions = actionValues.filter(action => 
      ['purchase', 'add_to_cart'].includes(action.action_type)
    );
    
    return revenueActions.reduce((total, action) => 
      total + parseFloat(action.value || 0), 0
    );
  }

  mapCampaignStatus(status) {
    const statusMap = {
      'ACTIVE': 'active',
      'PAUSED': 'paused',
      'DELETED': 'removed',
      'ARCHIVED': 'archived'
    };
    return statusMap[status] || 'unknown';
  }

  mapAdSetStatus(status) {
    const statusMap = {
      'ACTIVE': 'active',
      'PAUSED': 'paused',
      'DELETED': 'removed',
      'ARCHIVED': 'archived'
    };
    return statusMap[status] || 'unknown';
  }

  getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  // OAuth URL generation
  generateAuthUrl() {
    const scopes = [
      'ads_management',
      'ads_read',
      'business_management'
    ].join(',');

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${process.env.FACEBOOK_APP_ID}&` +
      `redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&` +
      `scope=${scopes}&` +
      `response_type=code`;
    
    return authUrl;
  }

  async exchangeCodeForToken(authCode) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${process.env.FACEBOOK_APP_ID}&` +
        `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
        `redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&` +
        `code=${authCode}`
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || data.error);
      }

      // Get long-lived token
      const longLivedResponse = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${process.env.FACEBOOK_APP_ID}&` +
        `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
        `fb_exchange_token=${data.access_token}`
      );

      const longLivedData = await longLivedResponse.json();

      return {
        access_token: longLivedData.access_token || data.access_token,
        token_type: longLivedData.token_type || 'bearer',
        expires_in: longLivedData.expires_in || data.expires_in
      };
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error(`Token exchange failed: ${error.message}`);
    }
  }
}

export default FacebookAdsIntegration;