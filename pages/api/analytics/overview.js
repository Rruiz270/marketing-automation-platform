import dbConnect from '../../../lib/mongodb';
import Campaign from '../../../lib/models/Campaign';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { range = '7d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    // Fetch campaigns within date range
    const campaigns = await Campaign.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Generate mock performance data for visualization
    const performanceData = [];
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Generate realistic mock data based on campaigns
      const totalSpend = campaigns.reduce((sum, c) => sum + (c.performance?.cost || 0), 0);
      const totalRevenue = campaigns.reduce((sum, c) => sum + (c.performance?.revenue || 0), 0);
      
      performanceData.push({
        date: date.toISOString().split('T')[0],
        spend: Math.round((totalSpend / days) * (0.8 + Math.random() * 0.4)),
        revenue: Math.round((totalRevenue / days) * (0.8 + Math.random() * 0.4)),
        impressions: Math.round(Math.random() * 10000 + 5000),
        clicks: Math.round(Math.random() * 500 + 100),
        conversions: Math.round(Math.random() * 50 + 10)
      });
    }

    // Calculate summary metrics
    const totalMetrics = campaigns.reduce((acc, campaign) => {
      const perf = campaign.performance || {};
      return {
        spend: acc.spend + (perf.cost || 0),
        revenue: acc.revenue + (perf.revenue || 0),
        impressions: acc.impressions + (perf.impressions || 0),
        clicks: acc.clicks + (perf.clicks || 0),
        conversions: acc.conversions + (perf.conversions || 0)
      };
    }, { spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0 });

    // Platform distribution
    const platformDistribution = {};
    campaigns.forEach(campaign => {
      const platform = campaign.type;
      if (!platformDistribution[platform]) {
        platformDistribution[platform] = { spend: 0, campaigns: 0 };
      }
      platformDistribution[platform].spend += campaign.performance?.cost || 0;
      platformDistribution[platform].campaigns += 1;
    });

    res.status(200).json({
      success: true,
      data: {
        performanceData,
        totalMetrics,
        platformDistribution,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalCampaigns: campaigns.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
}