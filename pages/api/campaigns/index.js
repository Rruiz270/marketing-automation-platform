import dbConnect from '../../../lib/mongodb';
import Campaign from '../../../lib/models/Campaign';

export default async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const campaigns = await Campaign.find({}).sort({ createdAt: -1 });
        
        res.status(200).json({
          success: true,
          data: campaigns,
          total: campaigns.length
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
        const campaign = new Campaign(req.body);
        await campaign.save();
        
        // Here you would integrate with actual ad platforms
        // For demo purposes, we'll simulate platform IDs
        if (campaign.type === 'google_ads') {
          campaign.platform_ids.google_campaign_id = `google_${campaign._id}`;
        } else if (campaign.type === 'facebook_ads') {
          campaign.platform_ids.facebook_campaign_id = `facebook_${campaign._id}`;
        }
        
        await campaign.save();
        
        res.status(201).json({
          success: true,
          data: campaign,
          message: 'Campaign created successfully'
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