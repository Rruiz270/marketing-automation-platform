// Real-Time Performance Monitoring System
import cron from 'node-cron';

// Performance thresholds specific to Alumni campaigns
const PERFORMANCE_THRESHOLDS = {
  // Critical metrics that trigger immediate action
  critical: {
    roasDropPercent: 0.3,        // 30% ROAS drop
    ctrDropPercent: 0.4,         // 40% CTR drop  
    budgetBurnRate: 1.5,         // 150% of expected spend
    conversionRateMin: 0.01,     // 1% minimum conversion rate
    costPerConversionMax: 100    // Max $100 per conversion
  },
  
  // Warning thresholds for proactive monitoring
  warning: {
    roasDropPercent: 0.15,       // 15% ROAS drop
    ctrDropPercent: 0.2,         // 20% CTR drop
    budgetBurnRate: 1.2,         // 120% of expected spend
    conversionRateMin: 0.02,     // 2% conversion rate
    costPerConversionMax: 75     // $75 per conversion
  },
  
  // Trend analysis windows
  analysis: {
    shortTermWindow: 3600000,     // 1 hour
    mediumTermWindow: 86400000,   // 24 hours
    longTermWindow: 604800000,    // 7 days
    dataPointsRequired: 10        // Minimum data points
  }
};

// Active monitors storage
const activeMonitors = new Map();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { action, campaignId, config } = req.body;

    switch (action) {
      case 'start-monitoring':
        return startMonitoring(campaignId, config, res);
        
      case 'stop-monitoring':
        return stopMonitoring(campaignId, res);
        
      case 'get-performance-snapshot':
        return getPerformanceSnapshot(campaignId, res);
        
      case 'get-alerts':
        return getActiveAlerts(campaignId, res);
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}

// Start performance monitoring
async function startMonitoring(campaignId, config = {}, res) {
  try {
    // Create monitor configuration
    const monitorConfig = {
      campaignId,
      interval: config.interval || '*/5 * * * *', // Every 5 minutes
      thresholds: { ...PERFORMANCE_THRESHOLDS, ...config.thresholds },
      alerts: [],
      startTime: new Date(),
      metrics: {
        baseline: null,
        current: null,
        trends: {
          shortTerm: [],
          mediumTerm: [],
          longTerm: []
        }
      }
    };
    
    // Schedule monitoring task
    const task = cron.schedule(monitorConfig.interval, async () => {
      await checkPerformance(monitorConfig);
    });
    
    // Store monitor
    activeMonitors.set(campaignId, { config: monitorConfig, task });
    
    // Get initial baseline
    await establishBaseline(monitorConfig);
    
    res.status(200).json({
      success: true,
      message: 'Performance monitoring started',
      campaignId,
      interval: monitorConfig.interval,
      thresholds: monitorConfig.thresholds
    });
  } catch (error) {
    console.error('Error starting monitoring:', error);
    res.status(500).json({ error: 'Failed to start monitoring' });
  }
}

// Core performance checking logic
async function checkPerformance(monitorConfig) {
  try {
    // 1. Fetch current metrics
    const currentMetrics = await fetchCurrentMetrics(monitorConfig.campaignId);
    
    // 2. Compare with baseline and thresholds
    const analysis = analyzePerformance(currentMetrics, monitorConfig);
    
    // 3. Detect anomalies
    const anomalies = detectAnomalies(analysis, monitorConfig);
    
    // 4. Generate alerts if needed
    if (anomalies.length > 0) {
      await generateAlerts(anomalies, monitorConfig);
    }
    
    // 5. Update metrics history
    updateMetricsHistory(currentMetrics, monitorConfig);
    
    // 6. Trigger automated responses for critical issues
    await handleCriticalIssues(anomalies, monitorConfig);
    
  } catch (error) {
    console.error('Performance check error:', error);
  }
}

// Establish baseline metrics
async function establishBaseline(monitorConfig) {
  try {
    const historicalData = await fetchHistoricalMetrics(
      monitorConfig.campaignId,
      monitorConfig.thresholds.analysis.longTermWindow
    );
    
    monitorConfig.metrics.baseline = {
      avgROAS: calculateAverage(historicalData.map(d => d.roas)),
      avgCTR: calculateAverage(historicalData.map(d => d.ctr)),
      avgCPA: calculateAverage(historicalData.map(d => d.cpa)),
      avgConversionRate: calculateAverage(historicalData.map(d => d.conversionRate)),
      dailyBudget: historicalData[0]?.dailyBudget || 0,
      normalVariance: calculateVariance(historicalData)
    };
  } catch (error) {
    console.error('Error establishing baseline:', error);
  }
}

// Analyze performance against baselines
function analyzePerformance(currentMetrics, monitorConfig) {
  const baseline = monitorConfig.metrics.baseline;
  if (!baseline) return null;
  
  const analysis = {
    timestamp: new Date(),
    metrics: currentMetrics,
    deviations: {},
    trends: {},
    score: 100 // Start with perfect score
  };
  
  // Calculate deviations from baseline
  analysis.deviations.roas = (currentMetrics.roas - baseline.avgROAS) / baseline.avgROAS;
  analysis.deviations.ctr = (currentMetrics.ctr - baseline.avgCTR) / baseline.avgCTR;
  analysis.deviations.cpa = (currentMetrics.cpa - baseline.avgCPA) / baseline.avgCPA;
  analysis.deviations.conversionRate = (currentMetrics.conversionRate - baseline.avgConversionRate) / baseline.avgConversionRate;
  
  // Calculate performance score
  if (analysis.deviations.roas < 0) {
    analysis.score -= Math.abs(analysis.deviations.roas) * 100;
  }
  if (analysis.deviations.ctr < 0) {
    analysis.score -= Math.abs(analysis.deviations.ctr) * 50;
  }
  if (analysis.deviations.conversionRate < 0) {
    analysis.score -= Math.abs(analysis.deviations.conversionRate) * 50;
  }
  
  analysis.score = Math.max(0, analysis.score);
  
  // Analyze trends
  analysis.trends = analyzeTrends(monitorConfig.metrics.trends);
  
  return analysis;
}

// Detect performance anomalies
function detectAnomalies(analysis, monitorConfig) {
  if (!analysis) return [];
  
  const anomalies = [];
  const thresholds = monitorConfig.thresholds;
  
  // Check critical thresholds
  if (analysis.deviations.roas < -thresholds.critical.roasDropPercent) {
    anomalies.push({
      type: 'critical',
      metric: 'roas',
      message: `ROAS dropped ${Math.abs(analysis.deviations.roas * 100).toFixed(1)}% below baseline`,
      value: analysis.metrics.roas,
      baseline: monitorConfig.metrics.baseline.avgROAS,
      severity: 'critical',
      automatedAction: 'pause-low-performers'
    });
  }
  
  // Check CTR performance
  if (analysis.deviations.ctr < -thresholds.critical.ctrDropPercent) {
    anomalies.push({
      type: 'critical',
      metric: 'ctr',
      message: `CTR dropped ${Math.abs(analysis.deviations.ctr * 100).toFixed(1)}% below baseline`,
      value: analysis.metrics.ctr,
      baseline: monitorConfig.metrics.baseline.avgCTR,
      severity: 'critical',
      automatedAction: 'refresh-creatives'
    });
  }
  
  // Check budget burn rate
  const currentBurnRate = analysis.metrics.spend / (monitorConfig.metrics.baseline.dailyBudget * (new Date().getHours() / 24));
  if (currentBurnRate > thresholds.critical.budgetBurnRate) {
    anomalies.push({
      type: 'critical',
      metric: 'budget',
      message: `Budget burning at ${(currentBurnRate * 100).toFixed(0)}% of expected rate`,
      value: analysis.metrics.spend,
      expected: monitorConfig.metrics.baseline.dailyBudget * (new Date().getHours() / 24),
      severity: 'critical',
      automatedAction: 'reduce-bids'
    });
  }
  
  // Check warning thresholds
  if (analysis.deviations.roas < -thresholds.warning.roasDropPercent && analysis.deviations.roas > -thresholds.critical.roasDropPercent) {
    anomalies.push({
      type: 'warning',
      metric: 'roas',
      message: `ROAS declining - down ${Math.abs(analysis.deviations.roas * 100).toFixed(1)}%`,
      value: analysis.metrics.roas,
      baseline: monitorConfig.metrics.baseline.avgROAS,
      severity: 'warning'
    });
  }
  
  // Check conversion rate
  if (analysis.metrics.conversionRate < thresholds.critical.conversionRateMin) {
    anomalies.push({
      type: 'critical',
      metric: 'conversionRate',
      message: `Conversion rate critically low at ${(analysis.metrics.conversionRate * 100).toFixed(2)}%`,
      value: analysis.metrics.conversionRate,
      threshold: thresholds.critical.conversionRateMin,
      severity: 'critical',
      automatedAction: 'optimize-landing-pages'
    });
  }
  
  return anomalies;
}

// Analyze performance trends
function analyzeTrends(trendsData) {
  const trends = {
    shortTerm: 'stable',
    mediumTerm: 'stable',
    longTerm: 'stable'
  };
  
  // Analyze short-term trend (last hour)
  if (trendsData.shortTerm.length >= 5) {
    const recentTrend = calculateTrend(trendsData.shortTerm.slice(-5));
    if (recentTrend < -0.1) trends.shortTerm = 'declining';
    else if (recentTrend > 0.1) trends.shortTerm = 'improving';
  }
  
  // Analyze medium-term trend (last 24 hours)
  if (trendsData.mediumTerm.length >= 10) {
    const mediumTrend = calculateTrend(trendsData.mediumTerm.slice(-10));
    if (mediumTrend < -0.05) trends.mediumTerm = 'declining';
    else if (mediumTrend > 0.05) trends.mediumTerm = 'improving';
  }
  
  return trends;
}

// Generate alerts for anomalies
async function generateAlerts(anomalies, monitorConfig) {
  const newAlerts = [];
  
  for (const anomaly of anomalies) {
    const alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      campaignId: monitorConfig.campaignId,
      timestamp: new Date(),
      ...anomaly
    };
    
    newAlerts.push(alert);
    
    // Emit real-time alert if Socket.IO is available
    if (global.io) {
      global.io.to(`campaign-${monitorConfig.campaignId}`).emit('performance-alert', alert);
    }
  }
  
  // Store alerts
  monitorConfig.alerts.push(...newAlerts);
  
  // Keep only recent alerts (last 100)
  if (monitorConfig.alerts.length > 100) {
    monitorConfig.alerts = monitorConfig.alerts.slice(-100);
  }
}

// Handle critical issues with automated responses
async function handleCriticalIssues(anomalies, monitorConfig) {
  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
  
  for (const anomaly of criticalAnomalies) {
    if (anomaly.automatedAction) {
      try {
        switch (anomaly.automatedAction) {
          case 'pause-low-performers':
            await pauseLowPerformers(monitorConfig.campaignId);
            break;
            
          case 'refresh-creatives':
            await triggerCreativeRefresh(monitorConfig.campaignId);
            break;
            
          case 'reduce-bids':
            await reduceBids(monitorConfig.campaignId, 0.2); // 20% reduction
            break;
            
          case 'optimize-landing-pages':
            await optimizeLandingPages(monitorConfig.campaignId);
            break;
        }
        
        // Log automated action
        console.log(`Automated action executed: ${anomaly.automatedAction} for campaign ${monitorConfig.campaignId}`);
      } catch (error) {
        console.error(`Failed to execute automated action: ${anomaly.automatedAction}`, error);
      }
    }
  }
}

// Update metrics history for trend analysis
function updateMetricsHistory(metrics, monitorConfig) {
  const dataPoint = {
    timestamp: new Date(),
    roas: metrics.roas,
    ctr: metrics.ctr,
    conversionRate: metrics.conversionRate,
    cpa: metrics.cpa,
    spend: metrics.spend
  };
  
  // Update short-term history (keep last hour)
  monitorConfig.metrics.trends.shortTerm.push(dataPoint);
  const oneHourAgo = Date.now() - PERFORMANCE_THRESHOLDS.analysis.shortTermWindow;
  monitorConfig.metrics.trends.shortTerm = monitorConfig.metrics.trends.shortTerm.filter(
    d => d.timestamp.getTime() > oneHourAgo
  );
  
  // Update medium-term history (keep last 24 hours)
  monitorConfig.metrics.trends.mediumTerm.push(dataPoint);
  const oneDayAgo = Date.now() - PERFORMANCE_THRESHOLDS.analysis.mediumTermWindow;
  monitorConfig.metrics.trends.mediumTerm = monitorConfig.metrics.trends.mediumTerm.filter(
    d => d.timestamp.getTime() > oneDayAgo
  );
  
  // Update current metrics
  monitorConfig.metrics.current = metrics;
}

// Helper functions
function calculateAverage(values) {
  if (!values || values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function calculateVariance(data) {
  if (!data || data.length < 2) return 0;
  const roasValues = data.map(d => d.roas);
  const avg = calculateAverage(roasValues);
  const squareDiffs = roasValues.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(calculateAverage(squareDiffs));
}

function calculateTrend(dataPoints) {
  if (!dataPoints || dataPoints.length < 2) return 0;
  const firstValue = dataPoints[0].roas;
  const lastValue = dataPoints[dataPoints.length - 1].roas;
  return (lastValue - firstValue) / firstValue;
}

// Mock functions - replace with actual implementations
async function fetchCurrentMetrics(campaignId) {
  // In production, fetch real-time data from platforms
  return {
    campaignId,
    timestamp: new Date(),
    roas: 3.8 + (Math.random() - 0.5) * 2, // Simulated fluctuation
    ctr: 0.025 + (Math.random() - 0.5) * 0.01,
    conversionRate: 0.028 + (Math.random() - 0.5) * 0.01,
    cpa: 42 + (Math.random() - 0.5) * 10,
    spend: 180 + Math.random() * 50,
    impressions: 12000 + Math.random() * 3000,
    clicks: 300 + Math.random() * 100,
    conversions: 8 + Math.random() * 5
  };
}

async function fetchHistoricalMetrics(campaignId, timeWindow) {
  // Generate mock historical data
  const dataPoints = [];
  const intervals = 20;
  
  for (let i = 0; i < intervals; i++) {
    dataPoints.push({
      timestamp: new Date(Date.now() - (timeWindow / intervals) * i),
      roas: 4.2 + (Math.random() - 0.5) * 1,
      ctr: 0.028 + (Math.random() - 0.5) * 0.005,
      conversionRate: 0.03 + (Math.random() - 0.5) * 0.005,
      cpa: 40 + (Math.random() - 0.5) * 5,
      dailyBudget: 500
    });
  }
  
  return dataPoints;
}

// Automated action implementations
async function pauseLowPerformers(campaignId) {
  // Implement platform-specific pausing logic
  console.log(`Pausing low performers for campaign ${campaignId}`);
}

async function triggerCreativeRefresh(campaignId) {
  // Trigger AI creative generation
  console.log(`Triggering creative refresh for campaign ${campaignId}`);
}

async function reduceBids(campaignId, percentage) {
  // Implement bid reduction across platforms
  console.log(`Reducing bids by ${percentage * 100}% for campaign ${campaignId}`);
}

async function optimizeLandingPages(campaignId) {
  // Trigger landing page optimization
  console.log(`Optimizing landing pages for campaign ${campaignId}`);
}

// Stop monitoring
async function stopMonitoring(campaignId, res) {
  try {
    const monitor = activeMonitors.get(campaignId);
    if (monitor) {
      monitor.task.stop();
      activeMonitors.delete(campaignId);
      res.status(200).json({
        success: true,
        message: 'Monitoring stopped',
        campaignId
      });
    } else {
      res.status(404).json({ error: 'Monitor not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop monitoring' });
  }
}

// Get performance snapshot
async function getPerformanceSnapshot(campaignId, res) {
  try {
    const monitor = activeMonitors.get(campaignId);
    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }
    
    const snapshot = {
      campaignId,
      current: monitor.config.metrics.current,
      baseline: monitor.config.metrics.baseline,
      trends: analyzeTrends(monitor.config.metrics.trends),
      score: monitor.config.metrics.current ? 
        analyzePerformance(monitor.config.metrics.current, monitor.config).score : null,
      activeAlerts: monitor.config.alerts.filter(a => 
        new Date() - new Date(a.timestamp) < 3600000 // Last hour
      )
    };
    
    res.status(200).json({
      success: true,
      snapshot
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get snapshot' });
  }
}

// Get active alerts
async function getActiveAlerts(campaignId, res) {
  try {
    const monitor = activeMonitors.get(campaignId);
    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }
    
    res.status(200).json({
      success: true,
      campaignId,
      alerts: monitor.config.alerts
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get alerts' });
  }
}