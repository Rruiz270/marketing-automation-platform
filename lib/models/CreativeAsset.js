import mongoose from 'mongoose';

const creativeAssetSchema = new mongoose.Schema({
  campaign_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'carousel', 'dynamic'],
    required: true
  },
  ai_generated: {
    type: Boolean,
    default: false
  },
  generation_details: {
    prompt_used: String,
    model_version: String,
    generation_time: Date,
    confidence_score: Number,
    human_reviewed: { type: Boolean, default: false }
  },
  content: {
    // Text content
    headline: String,
    description: String,
    call_to_action: String,
    
    // Media content
    image_url: String,
    video_url: String,
    thumbnail_url: String,
    
    // AI generation metadata
    dalle_prompt: String,
    voice_script: String,
    music_track: String,
    
    // Dimensions and formats
    dimensions: {
      width: Number,
      height: Number,
      aspect_ratio: String
    },
    formats: [String] // ['jpg', 'png', 'mp4', 'gif']
  },
  performance_data: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    engagement_rate: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  ab_test_data: {
    test_id: String,
    variant_name: String,
    test_status: {
      type: String,
      enum: ['draft', 'running', 'completed', 'paused'],
      default: 'draft'
    },
    traffic_split: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    statistical_significance: Number,
    winner: Boolean
  },
  competitor_analysis: {
    similar_creatives_found: Number,
    uniqueness_score: Number,
    trend_alignment: String,
    competitive_advantage: [String]
  },
  approval_status: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'needs_revision'],
      default: 'pending'
    },
    reviewed_by: String,
    reviewed_at: Date,
    feedback: String,
    platform_approval: {
      google_ads: String,
      facebook_ads: String,
      linkedin_ads: String
    }
  },
  usage_history: [{
    used_in_campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign'
    },
    start_date: Date,
    end_date: Date,
    performance_summary: mongoose.Schema.Types.Mixed
  }],
  tags: [String],
  version: {
    type: Number,
    default: 1
  },
  parent_creative: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreativeAsset'
  }
}, {
  timestamps: true
});

// Calculate performance metrics
creativeAssetSchema.virtual('performance_score').get(function() {
  const { impressions, clicks, conversions, cost, revenue } = this.performance_data;
  if (impressions === 0) return 0;
  
  const ctr = (clicks / impressions) * 100;
  const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
  const roas = cost > 0 ? revenue / cost : 0;
  
  // Weighted performance score
  return (ctr * 0.3) + (conversionRate * 0.4) + (roas * 0.3);
});

// Generate AI insights
creativeAssetSchema.methods.generateInsights = function() {
  const performanceScore = this.performance_score;
  const insights = [];
  
  if (performanceScore > 8) {
    insights.push('High-performing creative, consider scaling');
  } else if (performanceScore < 3) {
    insights.push('Low performance, needs optimization or replacement');
  }
  
  if (this.performance_data.ctr > 2) {
    insights.push('Above-average click-through rate');
  }
  
  return insights;
};

export default mongoose.models.CreativeAsset || mongoose.model('CreativeAsset', creativeAssetSchema);