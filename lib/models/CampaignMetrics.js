import mongoose from 'mongoose';

const campaignMetricsSchema = new mongoose.Schema({
  campaign_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  platform: {
    type: String,
    enum: ['google_ads', 'facebook_ads', 'linkedin_ads', 'twitter_ads', 'tiktok_ads'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  metrics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 }, // Click-through rate
    cpc: { type: Number, default: 0 }, // Cost per click
    cpl: { type: Number, default: 0 }, // Cost per lead
    cac: { type: Number, default: 0 }, // Customer acquisition cost
    roas: { type: Number, default: 0 }, // Return on ad spend
    quality_score: { type: Number, default: 0 }
  },
  trends: {
    ctr_trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
    cost_trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
    conversion_trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
    anomaly_detected: { type: Boolean, default: false },
    confidence_score: { type: Number, default: 0 } // AI confidence in trend analysis
  },
  ai_insights: {
    performance_prediction: String,
    recommended_actions: [String],
    risk_level: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    next_review_date: Date
  }
}, {
  timestamps: true,
  indexes: [
    { campaign_id: 1, date: -1 },
    { platform: 1, date: -1 },
    { 'trends.anomaly_detected': 1 }
  ]
});

// Calculate derived metrics
campaignMetricsSchema.pre('save', function(next) {
  if (this.metrics.impressions > 0) {
    this.metrics.ctr = (this.metrics.clicks / this.metrics.impressions * 100);
  }
  if (this.metrics.clicks > 0) {
    this.metrics.cpc = (this.metrics.cost / this.metrics.clicks);
  }
  if (this.metrics.conversions > 0) {
    this.metrics.cpl = (this.metrics.cost / this.metrics.conversions);
    this.metrics.cac = (this.metrics.cost / this.metrics.conversions);
  }
  if (this.metrics.cost > 0) {
    this.metrics.roas = (this.metrics.revenue / this.metrics.cost);
  }
  next();
});

export default mongoose.models.CampaignMetrics || mongoose.model('CampaignMetrics', campaignMetricsSchema);