import mongoose from 'mongoose';

const apiCredentialsSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  platform: {
    type: String,
    enum: ['google_ads', 'facebook_ads', 'linkedin_ads', 'twitter_ads', 'tiktok_ads'],
    required: true
  },
  credentials: {
    // Google Ads fields
    refresh_token: String,
    access_token: String,
    customer_id: String,
    developer_token: String,
    
    // Facebook Ads fields
    access_token_fb: String,
    ad_account_id: String,
    app_id: String,
    
    // Common fields
    expires_at: Date,
    token_type: String,
    scope: [String]
  },
  account_info: {
    account_name: String,
    account_id: String,
    currency: String,
    timezone: String,
    permissions: [String]
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked', 'pending'],
    default: 'pending'
  },
  last_sync: Date,
  sync_frequency: {
    type: String,
    enum: ['hourly', 'daily', 'weekly'],
    default: 'daily'
  },
  error_log: [{
    error_message: String,
    error_code: String,
    occurred_at: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Encrypt sensitive credentials
apiCredentialsSchema.pre('save', function(next) {
  // In production, implement encryption for sensitive fields
  if (this.isModified('credentials.refresh_token') || this.isModified('credentials.access_token')) {
    // Encrypt tokens here using crypto
    // this.credentials.refresh_token = encrypt(this.credentials.refresh_token);
    // this.credentials.access_token = encrypt(this.credentials.access_token);
  }
  next();
});

// Method to check if token needs refresh
apiCredentialsSchema.methods.needsRefresh = function() {
  if (!this.credentials.expires_at) return false;
  
  const now = new Date();
  const expiryTime = new Date(this.credentials.expires_at);
  const timeUntilExpiry = expiryTime.getTime() - now.getTime();
  
  // Refresh if expires within 1 hour
  return timeUntilExpiry < (60 * 60 * 1000);
};

// Method to get decrypted credentials
apiCredentialsSchema.methods.getDecryptedCredentials = function() {
  // In production, implement decryption
  return {
    ...this.credentials,
    // refresh_token: decrypt(this.credentials.refresh_token),
    // access_token: decrypt(this.credentials.access_token)
  };
};

// Method to update last sync time
apiCredentialsSchema.methods.updateLastSync = function() {
  this.last_sync = new Date();
  return this.save();
};

// Method to log errors
apiCredentialsSchema.methods.logError = function(errorMessage, errorCode) {
  this.error_log.push({
    error_message: errorMessage,
    error_code: errorCode,
    occurred_at: new Date(),
    resolved: false
  });
  
  // Keep only last 10 errors
  if (this.error_log.length > 10) {
    this.error_log = this.error_log.slice(-10);
  }
  
  return this.save();
};

// Static method to find active credentials for user and platform
apiCredentialsSchema.statics.findActiveCredentials = function(userId, platform) {
  return this.findOne({
    user_id: userId,
    platform: platform,
    status: 'active'
  });
};

export default mongoose.models.ApiCredentials || mongoose.model('ApiCredentials', apiCredentialsSchema);