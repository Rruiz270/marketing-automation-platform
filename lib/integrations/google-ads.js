import { GoogleAdsApi, enums } from 'google-ads-api';

class GoogleAdsIntegration {
  constructor() {
    this.client = null;
    this.customerId = null;
  }

  async initialize(credentials) {
    try {
      this.client = new GoogleAdsApi({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
        developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      });

      // Use refresh token to get access token if provided
      if (credentials.refresh_token) {
        this.customer = this.client.Customer({
          customer_id: credentials.customer_id,
          refresh_token: credentials.refresh_token,
        });
      }

      this.customerId = credentials.customer_id;
      return { success: true, message: 'Google Ads API initialized successfully' };
    } catch (error) {
      console.error('Google Ads API initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  async getCampaigns() {
    if (!this.customer) {
      throw new Error('Google Ads API not initialized');
    }

    try {
      const campaigns = await this.customer.query(`
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign.campaign_budget,
          campaign.start_date,
          campaign.end_date,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.cost_micros,
          metrics.conversion_value
        FROM campaign 
        WHERE campaign.status != 'REMOVED'
        AND segments.date DURING LAST_30_DAYS
      `);

      return campaigns.map(campaign => ({
        id: campaign.campaign.id,
        name: campaign.campaign.name,
        status: this.mapCampaignStatus(campaign.campaign.status),
        type: 'google_ads',
        platform: 'Google Ads',
        budget: {
          daily: campaign.campaign.campaign_budget ? 
            (campaign.campaign.campaign_budget.amount_micros / 1000000) : 0
        },
        performance: {
          impressions: parseInt(campaign.metrics?.impressions || 0),
          clicks: parseInt(campaign.metrics?.clicks || 0),
          conversions: parseFloat(campaign.metrics?.conversions || 0),
          cost: (campaign.metrics?.cost_micros || 0) / 1000000,
          revenue: (campaign.metrics?.conversion_value || 0) / 1000000,
          ctr: campaign.metrics?.clicks && campaign.metrics?.impressions ? 
            (campaign.metrics.clicks / campaign.metrics.impressions * 100) : 0,
          cpc: campaign.metrics?.clicks && campaign.metrics?.cost_micros ? 
            (campaign.metrics.cost_micros / 1000000) / campaign.metrics.clicks : 0
        },
        dates: {
          start_date: campaign.campaign.start_date,
          end_date: campaign.campaign.end_date
        }
      }));
    } catch (error) {
      console.error('Error fetching Google Ads campaigns:', error);
      throw new Error(`Failed to fetch campaigns: ${error.message}`);
    }
  }

  async getKeywords(campaignId) {
    if (!this.customer) {
      throw new Error('Google Ads API not initialized');
    }

    try {
      const keywords = await this.customer.query(`
        SELECT 
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.quality_info.quality_score,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          ad_group.name,
          campaign.name
        FROM keyword_view 
        WHERE campaign.id = ${campaignId}
        AND segments.date DURING LAST_30_DAYS
      `);

      return keywords.map(keyword => ({
        text: keyword.ad_group_criterion?.keyword?.text,
        match_type: keyword.ad_group_criterion?.keyword?.match_type,
        quality_score: keyword.ad_group_criterion?.quality_info?.quality_score,
        ad_group: keyword.ad_group?.name,
        campaign: keyword.campaign?.name,
        performance: {
          impressions: parseInt(keyword.metrics?.impressions || 0),
          clicks: parseInt(keyword.metrics?.clicks || 0),
          conversions: parseFloat(keyword.metrics?.conversions || 0),
          cost: (keyword.metrics?.cost_micros || 0) / 1000000
        }
      }));
    } catch (error) {
      console.error('Error fetching keywords:', error);
      throw new Error(`Failed to fetch keywords: ${error.message}`);
    }
  }

  async updateCampaignBudget(campaignId, newBudgetAmount) {
    if (!this.customer) {
      throw new Error('Google Ads API not initialized');
    }

    try {
      // First get the campaign budget ID
      const campaigns = await this.customer.query(`
        SELECT campaign.campaign_budget, campaign.name
        FROM campaign 
        WHERE campaign.id = ${campaignId}
      `);

      if (campaigns.length === 0) {
        throw new Error('Campaign not found');
      }

      const budgetResourceName = campaigns[0].campaign.campaign_budget;
      
      // Update the budget
      const budgetOperation = {
        update: {
          resource_name: budgetResourceName,
          amount_micros: newBudgetAmount * 1000000, // Convert to micros
        },
        update_mask: {
          paths: ['amount_micros']
        }
      };

      const result = await this.customer.campaignBudgets.mutate([budgetOperation]);
      
      return {
        success: true,
        campaign_id: campaignId,
        new_budget: newBudgetAmount,
        result: result
      };
    } catch (error) {
      console.error('Error updating campaign budget:', error);
      throw new Error(`Failed to update budget: ${error.message}`);
    }
  }

  async pauseCampaign(campaignId) {
    if (!this.customer) {
      throw new Error('Google Ads API not initialized');
    }

    try {
      const campaignOperation = {
        update: {
          resource_name: `customers/${this.customerId}/campaigns/${campaignId}`,
          status: enums.CampaignStatus.PAUSED,
        },
        update_mask: {
          paths: ['status']
        }
      };

      const result = await this.customer.campaigns.mutate([campaignOperation]);
      
      return {
        success: true,
        campaign_id: campaignId,
        status: 'paused',
        result: result
      };
    } catch (error) {
      console.error('Error pausing campaign:', error);
      throw new Error(`Failed to pause campaign: ${error.message}`);
    }
  }

  async createTextAd(campaignId, adGroupId, headlines, descriptions) {
    if (!this.customer) {
      throw new Error('Google Ads API not initialized');
    }

    try {
      const adOperation = {
        create: {
          ad_group: `customers/${this.customerId}/adGroups/${adGroupId}`,
          ad: {
            type: enums.AdType.RESPONSIVE_SEARCH_AD,
            responsive_search_ad: {
              headlines: headlines.map(headline => ({
                text: headline,
                pinned_field: enums.ServedAssetFieldType.HEADLINE_1
              })),
              descriptions: descriptions.map(description => ({
                text: description
              }))
            },
            final_urls: [process.env.LANDING_PAGE_URL || 'https://example.com']
          }
        }
      };

      const result = await this.customer.adGroupAds.mutate([adOperation]);
      
      return {
        success: true,
        ad_id: result.results[0].resource_name,
        campaign_id: campaignId,
        ad_group_id: adGroupId
      };
    } catch (error) {
      console.error('Error creating text ad:', error);
      throw new Error(`Failed to create ad: ${error.message}`);
    }
  }

  mapCampaignStatus(status) {
    const statusMap = {
      'ENABLED': 'active',
      'PAUSED': 'paused',
      'REMOVED': 'removed'
    };
    return statusMap[status] || 'unknown';
  }

  // OAuth URL generation for initial setup
  generateAuthUrl() {
    const scopes = 'https://www.googleapis.com/auth/adwords';
    const authUrl = `https://accounts.google.com/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_ADS_CLIENT_ID}&` +
      `redirect_uri=${process.env.GOOGLE_ADS_REDIRECT_URI}&` +
      `scope=${scopes}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `approval_prompt=force`;
    
    return authUrl;
  }

  async exchangeCodeForTokens(authCode) {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_ADS_CLIENT_ID,
          client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
          redirect_uri: process.env.GOOGLE_ADS_REDIRECT_URI,
          grant_type: 'authorization_code',
          code: authCode,
        }),
      });

      const tokens = await response.json();
      
      if (tokens.error) {
        throw new Error(tokens.error_description || tokens.error);
      }

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        token_type: tokens.token_type
      };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error(`Token exchange failed: ${error.message}`);
    }
  }
}

export default GoogleAdsIntegration;