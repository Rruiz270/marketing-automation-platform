import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['google_ads', 'facebook_ads', 'linkedin_ads', 'twitter_ads', 'tiktok_ads'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'draft'],
    default: 'draft'
  },
  budget: {
    daily: { type: Number, required: true },
    total: { type: Number },
    spent: { type: Number, default: 0 }
  },
  targeting: {
    demographics: {
      age_min: Number,
      age_max: Number,
      genders: [String],
      locations: [String]
    },
    interests: [String],
    keywords: [String],
    custom_audiences: [String]
  },
  bidding: {
    strategy: {
      type: String,
      enum: ['cpc', 'cpm', 'cpa', 'roas', 'maximize_clicks', 'maximize_conversions'],
      default: 'cpc'
    },
    amount: Number,
    target_roas: Number
  },
  schedule: {
    start_date: Date,
    end_date: Date,
    time_targeting: {
      days: [String],
      hours: [String]
    }
  },
  creatives: [{
    type: {
      type: String,
      enum: ['image', 'video', 'carousel', 'text']
    },
    headline: String,
    description: String,
    cta: String,
    media_url: String,
    landing_page: String
  }],
  automation_rules: [{
    condition: String,
    action: String,
    value: Number,
    enabled: { type: Boolean, default: true }
  }],
  performance: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  platform_ids: {
    google_campaign_id: String,
    facebook_campaign_id: String,
    linkedin_campaign_id: String
  },
  
  // Real-time optimization fields
  optimization: {
    enabled: { type: Boolean, default: false },
    lastOptimized: Date,
    confidence: Number,
    rules: Object
  },
  
  // Budget history tracking
  budgetHistory: [{
    timestamp: Date,
    platform: String,
    previousBudget: Number,
    newBudget: Number,
    reason: String,
    action: String
  }],
  
  // Custom budget rules
  customBudgetRules: Object,
  
  // Performance monitoring
  monitoring: {
    enabled: { type: Boolean, default: false },
    alerts: Array,
    baseline: Object
  }
}, {
  timestamps: true
});

campaignSchema.virtual('ctr').get(function() {
  return this.performance.clicks / this.performance.impressions * 100 || 0;
});

campaignSchema.virtual('cpc').get(function() {
  return this.performance.cost / this.performance.clicks || 0;
});

campaignSchema.virtual('roas').get(function() {
  return this.performance.revenue / this.performance.cost || 0;
});

export default mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);