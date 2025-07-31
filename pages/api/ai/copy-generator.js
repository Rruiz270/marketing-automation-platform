// AI Copy Generator - Create high-converting copy for all channels and funnel stages
import OpenAI from 'openai';

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

  // Use company and project data directly (like other APIs)
  const company = companyData;
  const project = projectData;
  const strategy = previousSteps[1]?.result;
  const mediaPlan = previousSteps[2]?.result;

  try {
    // Get API key from multiple sources (same as other APIs)
    let apiKey = null;
    
    // Source 1: Environment variable
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
      apiKey = process.env.OPENAI_API_KEY;
      console.log('✅ Copy Generator: Using environment variable API key');
    }
    
    // Source 2: Connected AIs
    if (!apiKey && connectedAIs && connectedAIs.length > 0) {
      const openaiService = connectedAIs.find(ai => 
        ai.service === 'openai' && ai.api_key && ai.api_key.startsWith('sk-')
      );
      if (openaiService) {
        apiKey = openaiService.api_key;
        console.log('✅ Copy Generator: Using connected AI API key');
      }
    }
    
    if (!apiKey || !apiKey.startsWith('sk-')) {
      console.log('❌ Copy Generator: No valid API key found');
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
          ai_service: 'Fallback Generator'
        }
      });
    }

    const openai = new OpenAI({
      apiKey: apiKey
    });

    const adCopy = {};

    // Generate copy for project channels or fallback to generic
    const channels = mediaPlan?.channels || project?.platforms?.map(platform => ({ name: platform })) || [{ name: 'Google Ads' }, { name: 'Facebook Ads' }];
    
    for (const channel of channels) {
      const copyPrompt = `
As an expert copywriter specializing in ${channel.name} advertising, create high-converting ad copy for:

Company: ${company?.companyName || 'Company'}
Industry: ${company?.industry || 'Business'}
Target Audience: ${company?.targetPublic || project?.targetAudience || 'Professionals'}
Unique Value: ${company?.differentials || 'Quality and expertise'}
Average Ticket: R$ ${company?.generalAverageTicket || '500'}

Project Details:
- Project: ${project?.name || 'Campaign'}
- Description: ${project?.description || 'Marketing campaign'}
- Objectives: ${project?.objectives || strategy?.objective || 'Generate leads'}
- Budget: R$ ${project?.budget || '10000'}

Channel: ${channel.name}
Expected Metrics: ${channel.expectedMetrics ? `${channel.expectedMetrics.cpa} CPA, ${channel.expectedMetrics.conversions} conversions` : 'Standard performance targets'}

Create copy optimized for each funnel stage:

AWARENESS STAGE (Top of Funnel):
- Focus: Brand introduction, problem identification
- Headlines: 5 variations (30 chars max for ${channel.name})
- Descriptions: 3 variations (90 chars max)
- CTAs: 3 options focused on learning/discovery

CONSIDERATION STAGE (Middle of Funnel):
- Focus: Solution presentation, benefits, social proof
- Headlines: 5 variations emphasizing value proposition
- Descriptions: 3 variations with credibility indicators
- CTAs: 3 options focused on engagement/trial

CONVERSION STAGE (Bottom of Funnel):
- Focus: Direct action, urgency, clear value
- Headlines: 5 variations with strong action orientation
- Descriptions: 3 variations with clear benefits and urgency
- CTAs: 3 options focused on immediate action

FORMAT REQUIREMENTS for ${channel.name}:
${getChannelCopyRequirements(channel.name)}

BRAND VOICE: ${company?.differentials || 'Professional and trustworthy, focusing on quality and results'}

KEY MESSAGING PILLARS:
1. Industry expertise and experience
2. Quality and proven results  
3. Flexible and convenient solutions
4. Professional growth and advancement
5. Unique value proposition

Return structured copy that maximizes performance for ${channel.name} while maintaining brand consistency.
`;

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: copyPrompt }],
          max_tokens: 2000,
          temperature: 0.7
        });

        const copyText = response.choices[0].message.content;
        adCopy[channel.name] = parseCopyResponse(copyText, channel.name);

      } catch (aiError) {
        console.error(`AI error for ${channel.name}:`, aiError);
        adCopy[channel.name] = generateFallbackCopy(channel.name, project, company);
      }
    }

    res.status(200).json({
      success: true,
      result: {
        adCopy,
        channels_processed: Object.keys(adCopy),
        total_variations: calculateTotalVariations(adCopy),
        company: company?.companyName || 'Company',
        project: project?.name || 'Campaign'
      },
      metadata: {
        generated_at: new Date().toISOString(),
        ai_service: 'AI Copy Generator'
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
  
  const fallbackCopy = {
    'Google Ads': {
      headlines: [
        'Professional English Course',
        'Business English Training',
        'Corporate English Classes',
        'Learn English Online',
        'English for Career Growth'
      ],
      descriptions: [
        '60+ years teaching English. Official Brazil-USA Binational Center.',
        'Flexible online + in-person classes. Corporate training available.',
        'Government recognized English courses. Professional development focus.'
      ],
      ctas: ['Learn More', 'Get Started', 'Free Assessment']
    },
    'Facebook/Instagram': {
      headlines: [
        'Advance Your Career 🚀',
        'English That Opens Doors',
        'Professional English Course',
        'Learn Business English',
        'Career Growth Starts Here'
      ],
      descriptions: [
        'Join thousands who advanced their careers with our English courses.',
        '60+ years of proven results. Flexible schedule that fits your life.',
        'Official Brazil-USA center. Government recognized quality.'
      ],
      ctas: ['Start Learning', 'Book Free Class', 'See Courses']
    },
    'LinkedIn': {
      headlines: [
        'Executive English Training',
        'Professional Development',
        'Business English Mastery',
        'Corporate Language Training',
        'Career Advancement English'
      ],
      descriptions: [
        'Strategic English training for business professionals and executives.',
        'Custom corporate programs. Government recognized certification.',
        '60+ years serving Brazil\'s top companies and professionals.'
      ],
      ctas: ['Schedule Consultation', 'View Programs', 'Contact Us']
    }
  };

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