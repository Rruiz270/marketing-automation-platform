// Minimal test endpoint to isolate the copy generation issue
export default function handler(req, res) {
  console.log('🧪 Test Copy API called');
  
  // Return the absolute simplest possible response
  return res.status(200).json({
    success: true,
    result: {
      adCopy: {
        'Meta Business': {
          headlines: ['Test Headline 1', 'Test Headline 2'],
          descriptions: ['Test Description 1'],
          ctas: ['Test CTA']
        }
      },
      channels_processed: ['Meta Business'],
      total_variations: 1,
      company: 'Test Company',
      project: 'Test Project'
    }
  });
}