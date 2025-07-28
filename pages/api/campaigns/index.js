// Mock data for testing without database
const mockCampaigns = [
  {
    _id: '1',
    name: 'Google Search Campaign',
    type: 'google_ads',
    status: 'active',
    budget: { daily: 100, total: 3000, spent: 250 },
    performance: { impressions: 15000, clicks: 450, conversions: 25, cost: 250, revenue: 1200 },
    createdAt: new Date('2024-01-15')
  },
  {
    _id: '2', 
    name: 'Facebook Awareness Campaign',
    type: 'facebook_ads',
    status: 'active',
    budget: { daily: 75, total: 2000, spent: 180 },
    performance: { impressions: 12000, clicks: 360, conversions: 18, cost: 180, revenue: 900 },
    createdAt: new Date('2024-01-20')
  }
];

export default async function handler(req, res) {
  // Skip database connection for demo
  
  switch (req.method) {
    case 'GET':
      try {
        // Add calculated fields
        const campaignsWithMetrics = mockCampaigns.map(campaign => ({
          ...campaign,
          ctr: (campaign.performance.clicks / campaign.performance.impressions * 100) || 0,
          cpc: (campaign.performance.cost / campaign.performance.clicks) || 0,
          roas: (campaign.performance.revenue / campaign.performance.cost) || 0
        }));
        
        res.status(200).json({
          success: true,
          data: campaignsWithMetrics,
          total: campaignsWithMetrics.length
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error fetching campaigns',
          error: error.message
        });
      }
      break;

    case 'POST':
      try {
        const newCampaign = {
          _id: (mockCampaigns.length + 1).toString(),
          ...req.body,
          performance: { impressions: 0, clicks: 0, conversions: 0, cost: 0, revenue: 0 },
          createdAt: new Date()
        };
        
        // In a real app, this would save to database
        // mockCampaigns.push(newCampaign);
        
        res.status(201).json({
          success: true,
          data: newCampaign,
          message: 'Campaign created successfully (demo mode)'
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          message: 'Error creating campaign',
          error: error.message
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}