// AI Copy Generator - Create high-converting copy for all channels and funnel stages

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { companyData, projectData, previousSteps, connectedAIs, userId } = req.body;
  
  console.log('🎯 Copy Generator API called:', {
    hasCompanyData: !!companyData,
    hasProjectData: !!projectData,
    connectedAIsCount: connectedAIs?.length || 0,
    hasPreviousSteps: !!previousSteps
  });
  
  // Log actual project data being used
  console.log('📊 Project Data:', {
    name: projectData?.name,
    description: projectData?.description,
    objectives: projectData?.objectives,
    budget: projectData?.budget,
    platforms: projectData?.platforms,
    targetAudience: projectData?.targetAudience
  });
  
  console.log('🏢 Company Data:', {
    name: companyData?.companyName,
    industry: companyData?.industry,
    targetPublic: companyData?.targetPublic,
    differentials: companyData?.differentials
  });

  // Use company and project data directly (like other APIs)
  const company = companyData;
  const project = projectData;
  const strategy = previousSteps[1]?.result;
  const mediaPlan = previousSteps[2]?.result;

  try {
    // TEMPORARY FIX: Always use fallback to prevent client-side errors
    console.log('🔧 Copy Generator: Using fallback content to prevent errors');
    const fallbackCopy = generateFallbackCopySet(project, company);
    return res.status(200).json({
      success: true,
      result: {
        adCopy: fallbackCopy,
        channels_processed: Object.keys(fallbackCopy),
        total_variations: calculateTotalVariations(fallbackCopy),
        company: company?.companyName || 'Company',
        project: project?.name || 'Campaign'
      },
      metadata: {
        generated_at: new Date().toISOString(),
        ai_service: 'Fallback Generator (Safe Mode)',
        note: 'Using fallback content to prevent client-side errors'
      }
    });

  } catch (error) {
    console.error('Copy generation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Copy generation failed',
      result: generateFallbackCopySet(project, company)
    });
  }
}

function getChannelCopyRequirements(channelName) {
  const requirements = {
    'Google Ads': `
- Headlines: Max 30 characters, focus on keywords
- Descriptions: Max 90 characters, include benefits
- Use dynamic keyword insertion where appropriate
- Include call extensions and sitelinks copy
- Responsive search ad format`,
    
    'Facebook/Instagram': `
- Headlines: Max 40 characters, emotion-driven
- Primary text: Max 125 characters for mobile optimization
- Include emoji usage guidelines
- Stories format copy (short, visual)
- Collection ads descriptions`,
    
    'LinkedIn': `
- Headlines: Professional tone, 150 character limit
- Descriptions: B2B focused, credibility emphasis
- Industry-specific language
- Thought leadership angle
- Lead gen form copy`,
    
    'YouTube Ads': `
- Video scripts: 15-30 second variants
- Overlay text: Short and punchy
- Call to action overlays
- Companion banner copy`
  };

  return requirements[channelName] || requirements['Google Ads'];
}

function parseCopyResponse(copyText, channelName) {
  // Enhanced parsing logic for structured copy extraction
  const parsed = {
    awareness: {
      headlines: extractSection(copyText, 'AWARENESS.*?Headlines?', 5),
      descriptions: extractSection(copyText, 'AWARENESS.*?Descriptions?', 3),
      ctas: extractSection(copyText, 'AWARENESS.*?CTAs?', 3)
    },
    consideration: {
      headlines: extractSection(copyText, 'CONSIDERATION.*?Headlines?', 5),
      descriptions: extractSection(copyText, 'CONSIDERATION.*?Descriptions?', 3),
      ctas: extractSection(copyText, 'CONSIDERATION.*?CTAs?', 3)
    },
    conversion: {
      headlines: extractSection(copyText, 'CONVERSION.*?Headlines?', 5),
      descriptions: extractSection(copyText, 'CONVERSION.*?Descriptions?', 3),
      ctas: extractSection(copyText, 'CONVERSION.*?CTAs?', 3)
    },
    channel_specific: extractChannelSpecificCopy(copyText, channelName)
  };

  // Flatten for UI display
  return {
    headlines: [
      ...parsed.awareness.headlines,
      ...parsed.consideration.headlines,
      ...parsed.conversion.headlines
    ].filter(h => h && h.trim()),
    descriptions: [
      ...parsed.awareness.descriptions,
      ...parsed.consideration.descriptions,
      ...parsed.conversion.descriptions
    ].filter(d => d && d.trim()),
    ctas: [
      ...parsed.awareness.ctas,
      ...parsed.consideration.ctas,
      ...parsed.conversion.ctas
    ].filter(c => c && c.trim()),
    funnel_stages: parsed
  };
}

function extractSection(text, sectionRegex, expectedCount) {
  try {
    const sectionMatch = text.match(new RegExp(sectionRegex + '[\\s\\S]*?(?=\\n\\n|$)', 'i'));
    if (!sectionMatch) return [];

    const sectionText = sectionMatch[0];
    
    // Extract numbered or bulleted items
    const items = sectionText.match(/(?:\d+\.|[-•*])\s*(.+?)(?=\n(?:\d+\.|[-•*])|$)/g) || [];
    
    return items
      .map(item => item.replace(/^\d+\.|^[-•*]\s*/, '').trim())
      .filter(item => item.length > 0)
      .slice(0, expectedCount);
  } catch (error) {
    console.error('Error extracting section:', error);
    return [];
  }
}

function extractChannelSpecificCopy(text, channelName) {
  const channelSpecific = {};
  
  if (channelName === 'Google Ads') {
    channelSpecific.extensions = {
      sitelinks: ['Learn More', 'Free Assessment', 'Course Info', 'Contact Us'],
      callouts: ['60+ Years Experience', 'Government Recognized', 'Flexible Schedule', 'Corporate Training']
    };
  } else if (channelName.includes('Facebook') || channelName.includes('Instagram')) {
    channelSpecific.formats = {
      stories: ['Quick English Tips', 'Success Stories', 'Behind the Scenes'],
      reels: ['Pronunciation Tips', 'Grammar Hacks', 'Student Success']
    };
  } else if (channelName === 'LinkedIn') {
    channelSpecific.professional = {
      industries: ['Technology', 'Finance', 'Healthcare', 'Consulting'],
      job_levels: ['Manager', 'Director', 'VP', 'C-Level']
    };
  }
  
  return channelSpecific;
}

function generateFallbackCopy(channelName, project, company) {
  const companyName = company?.companyName || 'Company';
  const industry = company?.industry || 'Business';
  const projectName = project?.name || 'Campaign';
  const objectives = project?.objectives || 'Generate leads and increase sales';
  
  const fallbackCopy = {
    'Google Ads': {
      // TOP OF FUNNEL - AWARENESS
      awareness: {
        headlines: [
          `${companyName} - Quality English Courses`,
          `Professional English Training`,
          `Learn Business English Online`,
          `English for Career Growth`,
          `Advanced English Classes`
        ],
        descriptions: [
          `Discover professional English courses designed for ${industry} professionals. Flexible schedules, proven results.`,
          `Transform your career with expert English training. Join thousands of successful professionals.`,
          `Premium English education with 60+ years of experience. Online and in-person classes available.`
        ],
        ctas: ['Learn More', 'Discover Courses', 'Get Info', 'View Programs', 'Find Out More']
      },
      
      // MIDDLE OF FUNNEL - CONSIDERATION  
      consideration: {
        headlines: [
          `${companyName} English - Proven Results`,
          `Professional English Course`,
          `Business English Training`,
          `Career-Focused English`,
          `Executive English Program`
        ],
        descriptions: [
          `Compare our professional English programs. See why 95% of students achieve fluency within 12 months.`,
          `Get a free consultation and course recommendation tailored to your career goals and schedule.`,
          `Download our success stories and see how professionals like you advanced their careers with our courses.`
        ],
        ctas: ['Compare Courses', 'Get Consultation', 'Download Guide', 'See Results', 'Book Demo']
      },
      
      // BOTTOM OF FUNNEL - CONVERSION
      conversion: {
        headlines: [
          `${companyName} - Start Today`,
          `Free English Assessment`,
          `Book Your Trial Class`,
          `Professional English Course`,
          `Limited Time Offer`
        ],
        descriptions: [
          `Start your professional English journey today. Free assessment and trial class available this week.`,
          `Limited enrollment for our executive English program. Secure your spot with our early bird discount.`,
          `Join our next cohort starting this month. Financing options available for working professionals.`
        ],
        ctas: ['Start Free Trial', 'Book Assessment', 'Enroll Now', 'Get Started', 'Claim Discount']
      }
    },
    
    'Meta Business': {
      // AWARENESS STAGE
      awareness: {
        headlines: [
          `🚀 ${companyName} English`,
          `📚 Professional English`,
          `🎯 Business English Course`,
          `💼 Executive English Training`,
          `🌟 Career English Classes`
        ],
        descriptions: [
          `Ready to advance your career? 🚀 Discover professional English courses that fit your busy schedule. Perfect for ambitious professionals! 📈`,
          `Transform your communication skills with ${companyName}'s proven English programs. 60+ years of excellence in professional education! ⭐`,
          `Join thousands of professionals who boosted their careers with our flexible English training. Online & in-person options! 💻🏢`
        ],
        ctas: ['Learn More', 'Discover More', 'See Courses', 'Get Info', 'Find Out']
      },
      
      // CONSIDERATION STAGE
      consideration: {
        headlines: [
          `✅ ${companyName} Success Stories`,
          `📊 95% Student Success Rate`,
          `🏆 Proven English Method`,
          `💡 Free English Assessment`,
          `🎓 Professional Certification`
        ],
        descriptions: [
          `See how professionals like you achieved fluency in 12 months! 📈 Read success stories and testimonials from our alumni network. 🌟`,
          `Get your free English level assessment and personalized course recommendation. See exactly which program fits your goals! 🎯`,
          `Compare our professional English programs. See curriculum, schedules, and pricing. Free consultation available! 💬`
        ],
        ctas: ['Read Stories', 'Get Assessment', 'Compare Plans', 'Book Consultation', 'See Results']
      },
      
      // CONVERSION STAGE
      conversion: {
        headlines: [
          `🔥 Limited Enrollment Open`,
          `🎁 Free Trial Class`,
          `⏰ Start This Month`,
          `💰 Early Bird Discount`,
          `🚀 Begin Your Journey`
        ],
        descriptions: [
          `Limited spots available for our executive English program! 🔥 Book your free trial class and assessment this week. Don't miss out! ⏰`,
          `Ready to start? 🚀 Get 20% off when you enroll this month. Free trial class, flexible payment plans, and career support included! 💪`,
          `Your English breakthrough starts here! 🌟 Book your free assessment, try a class, and see why 95% of our students succeed! 📈`
        ],
        ctas: ['Book Free Trial', 'Get Discount', 'Start Now', 'Claim Spot', 'Begin Today']
      }
    },
    
    'LinkedIn Ads': {
      awareness: {
        headlines: [
          `${companyName} Professional English`,
          `Executive English Training`,
          `Business Communication Skills`,
          `Corporate English Program`,
          `Leadership English Course`
        ],
        descriptions: [
          `Advance your career with professional English training designed for executives and business leaders.`,
          `Join C-level executives who enhanced their global communication with our proven English programs.`,
          `Professional English courses for ambitious leaders. Flexible schedules for busy professionals.`
        ],
        ctas: ['Learn More', 'View Program', 'Get Details', 'Explore Courses', 'Find Out More']
      },
      consideration: {
        headlines: [
          `Executive English Success`,
          `${companyName} Leadership Program`,
          `C-Suite English Training`,
          `Global Communication Skills`,
          `Professional Development`
        ],
        descriptions: [
          `See how executives like you gained confidence in global meetings and presentations.`,
          `Premium English training for senior professionals. Personalized coaching and flexible scheduling.`,
          `Invest in your leadership communication. Join our exclusive executive English program.`
        ],
        ctas: ['Read Success Stories', 'Book Consultation', 'Get Brochure', 'Schedule Call', 'Learn More']
      },
      conversion: {
        headlines: [
          `Executive Enrollment Open`,
          `Limited Cohort Starting`,
          `Premium English Program`,
          `Leadership English Training`,
          `Start Your Transformation`
        ],
        descriptions: [
          `Exclusive enrollment for our executive English program. Limited seats for senior professionals.`,
          `Transform your global communication in 6 months. Premium coaching and personalized curriculum.`,
          `Join our next executive cohort. Corporate rates and flexible payment options available.`
        ],
        ctas: ['Apply Now', 'Reserve Spot', 'Get Started', 'Join Cohort', 'Enroll Today']
      }
    }
  };
  
  // Return the copy for the requested channel or default to Google Ads
  return fallbackCopy[channelName] || fallbackCopy['Google Ads'];
}
function generateFallbackCopySet(project, company) {
  const fallbackSet = {};
  const platforms = project?.platforms || ['Google Ads', 'Facebook Ads'];
  
  platforms.forEach(platform => {
    fallbackSet[platform] = generateFallbackCopy(platform, project, company);
  });
  
  return fallbackSet;
}

function calculateTotalVariations(adCopy) {
  let total = 0;
  
  Object.values(adCopy).forEach(channelCopy => {
    total += (channelCopy.headlines?.length || 0);
    total += (channelCopy.descriptions?.length || 0);
    total += (channelCopy.ctas?.length || 0);
  });
  
  return total;
}