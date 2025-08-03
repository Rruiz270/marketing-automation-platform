// Ultra-Simple Copy Generator - Zero dependencies, cannot fail
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { companyData, projectData } = req.body;
    
    console.log('✅ Copy Generator called successfully');
    console.log('📊 Project:', projectData?.name || 'Unknown');
    console.log('🏢 Company:', companyData?.companyName || 'Unknown');

    // Simple copy generation
    const adCopy = {
      'Meta Business': {
        headlines: [
          `${companyData?.companyName || 'Professional'} English Training`,
          `Master Business English Today`,
          `${projectData?.name || 'Advanced English'} Course`,
          `Professional English Classes`,
          `Career English Training`
        ],
        descriptions: [
          `Transform your career with ${companyData?.companyName || 'professional'} English training.`,
          `Join thousands who advanced their careers with our proven English courses.`,
          `Flexible schedules, expert teachers, guaranteed results.`
        ],
        ctas: ['Learn More', 'Start Today', 'Get Info', 'Enroll Now', 'Try Free']
      },
      'Google Ads': {
        headlines: [
          `${companyData?.companyName || 'Professional'} English`,
          `Business English Course`,
          `${projectData?.name || 'Advanced English'}`,
          `Professional Training`,
          `English Classes Online`
        ],
        descriptions: [
          `Professional English training for career growth and business success.`,
          `Expert instruction, flexible schedules, proven results for professionals.`,
          `Join our community of successful English language professionals.`
        ],
        ctas: ['Learn More', 'Get Started', 'Contact Us', 'Free Trial', 'Enroll']
      }
    };

    return res.status(200).json({
      success: true,
      result: {
        adCopy: adCopy,
        channels_processed: Object.keys(adCopy),
        total_variations: 30,
        company: companyData?.companyName || 'Company',
        project: projectData?.name || 'Campaign'
      },
      metadata: {
        generated_at: new Date().toISOString(),
        ai_service: 'Simple Copy Generator'
      }
    });

  } catch (error) {
    console.error('Copy generator error:', error);
    return res.status(500).json({
      success: false,
      error: 'Copy generation failed',
      message: error.message
    });
  }
}