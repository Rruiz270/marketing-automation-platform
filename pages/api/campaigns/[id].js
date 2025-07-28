import dbConnect from '../../../lib/mongodb';
import Campaign from '../../../lib/models/Campaign';

export default async function handler(req, res) {
  const { id } = req.query;
  
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const campaign = await Campaign.findById(id);
        
        if (!campaign) {
          return res.status(404).json({
            success: false,
            message: 'Campaign not found'
          });
        }
        
        res.status(200).json({
          success: true,
          data: campaign
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error fetching campaign',
          error: error.message
        });
      }
      break;

    case 'PUT':
      try {
        const campaign = await Campaign.findByIdAndUpdate(
          id,
          req.body,
          { new: true, runValidators: true }
        );
        
        if (!campaign) {
          return res.status(404).json({
            success: false,
            message: 'Campaign not found'
          });
        }
        
        res.status(200).json({
          success: true,
          data: campaign,
          message: 'Campaign updated successfully'
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          message: 'Error updating campaign',
          error: error.message
        });
      }
      break;

    case 'DELETE':
      try {
        const campaign = await Campaign.findByIdAndDelete(id);
        
        if (!campaign) {
          return res.status(404).json({
            success: false,
            message: 'Campaign not found'
          });
        }
        
        res.status(200).json({
          success: true,
          message: 'Campaign deleted successfully'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error deleting campaign',
          error: error.message
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}