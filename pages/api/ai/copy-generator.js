// AI Copy Generator - Create high-converting copy for all channels and funnel stages
import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { strategy, mediaPlan, companyProfile, ai_service, ai_service_name } = req.body;

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'demo-key'
    });

    const adCopy = {};

    // Generate copy for each channel in the media plan
    for (const channel of mediaPlan.channels || []) {
      const copyPrompt = `
As an expert copywriter specializing in ${channel.name} advertising, create high-converting ad copy for:

Company: ${companyProfile?.companyName || 'Company'}
Industry: ${companyProfile?.industry || 'Business'}
Target Audience: ${companyProfile?.targetPublic || 'Professionals'}
Unique Value: ${companyProfile?.differentials || 'Quality and expertise'}
Average Ticket: R$ ${companyProfile?.generalAverageTicket || '500'}

Campaign Strategy:
- Objective: ${strategy.objective}
- Budget: R$ ${strategy.budget}
- Target CPA: R$ ${strategy.targetCPA}
- Primary Message: Professional growth through quality English education

Channel: ${channel.name}
Expected Metrics: ${channel.expectedMetrics?.cpa} CPA, ${channel.expectedMetrics?.conversions} conversions

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

BRAND VOICE: Professional yet approachable, emphasizing 60+ years of experience and government recognition.

KEY MESSAGING PILLARS:
1. Official Brazil-USA Binational Center (unique credibility)
2. 60+ years of proven results (heritage and trust)
3. Flexible online + in-person options (convenience)
4. Corporate focus for career advancement (professional growth)
5. Government recognition from both countries (official status)

Return structured copy that maximizes performance for ${channel.name} while maintaining brand consistency.
`;

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: copyPrompt }],
          max_tokens: 2000,
          temperature: 0.7
        });

        const copyText = response.choices[0].message.content;
        adCopy[channel.name] = parseCopyResponse(copyText, channel.name);

      } catch (aiError) {
        console.error(`AI error for ${channel.name}:`, aiError);
        adCopy[channel.name] = generateFallbackCopy(channel.name, strategy, companyProfile);
      }
    }

    res.status(200).json({
      success: true,
      adCopy,
      metadata: {
        generated_at: new Date().toISOString(),
        ai_service: ai_service_name || 'OpenAI GPT-4',
        channels_processed: Object.keys(adCopy),
        total_variations: calculateTotalVariations(adCopy)
      }
    });

  } catch (error) {
    console.error('Copy generation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Copy generation failed',
      fallback_copy: generateFallbackCopySet(mediaPlan, strategy, companyProfile)
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

function generateFallbackCopy(channelName, strategy, companyProfile) {
  const companyName = companyProfile?.companyName || 'Alumni English School';
  
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

function generateFallbackCopySet(mediaPlan, strategy, companyProfile) {
  const fallbackSet = {};
  
  (mediaPlan?.channels || []).forEach(channel => {
    fallbackSet[channel.name] = generateFallbackCopy(channel.name, strategy, companyProfile);
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