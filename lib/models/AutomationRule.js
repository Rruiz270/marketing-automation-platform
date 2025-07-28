import mongoose from 'mongoose';

const automationRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  campaign_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  }],
  trigger_conditions: {
    metric: {
      type: String,
      enum: ['ctr', 'cpc', 'cpl', 'cac', 'roas', 'cost', 'conversions'],
      required: true
    },
    operator: {
      type: String,
      enum: ['greater_than', 'less_than', 'equals', 'percentage_change'],
      required: true
    },
    threshold_value: {
      type: Number,
      required: true
    },
    time_window: {
      type: String,
      enum: ['1h', '6h', '24h', '7d', '30d'],
      default: '24h'
    },
    consecutive_periods: {
      type: Number,
      default: 1
    }
  },
  actions: [{
    type: {
      type: String,
      enum: ['adjust_budget', 'pause_campaign', 'change_bid', 'send_alert', 'create_variant', 'generate_creative'],
      required: true
    },
    parameters: {
      budget_change_percentage: Number,
      new_bid_amount: Number,
      pause_duration: String,
      alert_channels: [String], // ['email', 'slack', 'whatsapp']
      creative_type: String // 'text', 'image', 'video'
    },
    requires_approval: {
      type: Boolean,
      default: false
    }
  }],
  ai_settings: {
    confidence_threshold: {
      type: Number,
      min: 0,
      max: 100,
      default: 85
    },
    safe_mode: {
      type: Boolean,
      default: true
    },
    learning_enabled: {
      type: Boolean,
      default: true
    },
    model_version: {
      type: String,
      default: 'v1.0'
    }
  },
  execution_history: [{
    executed_at: Date,
    trigger_data: mongoose.Schema.Types.Mixed,
    actions_taken: [String],
    confidence_score: Number,
    human_approved: Boolean,
    results: {
      success: Boolean,
      metrics_change: mongoose.Schema.Types.Mixed,
      error_message: String
    }
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'disabled'],
    default: 'active'
  },
  created_by: String,
  last_triggered: Date,
  total_executions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Validate rule logic
automationRuleSchema.pre('save', function(next) {
  // Ensure safe mode is enabled for high-risk actions
  const highRiskActions = ['adjust_budget', 'pause_campaign'];
  const hasHighRiskAction = this.actions.some(action => highRiskActions.includes(action.type));
  
  if (hasHighRiskAction && !this.ai_settings.safe_mode) {
    this.ai_settings.safe_mode = true;
  }
  
  next();
});

export default mongoose.models.AutomationRule || mongoose.model('AutomationRule', automationRuleSchema);