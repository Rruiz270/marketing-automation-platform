// AI Creative Generator - Generate visual assets in correct formats for all platforms
import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { adCopy, mediaPlan, companyProfile, ai_service, ai_service_name } = req.body;

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'demo-key'
    });

    const creatives = {
      formats: [],
      designGuidelines: generateDesignGuidelines(companyProfile),
      assetLibrary: generateAssetLibrary(companyProfile),
      brandElements: generateBrandElements(companyProfile),
      variations: []
    };

    // Generate creative formats for each channel
    for (const channel of mediaPlan.channels || []) {
      const channelFormats = getChannelCreativeFormats(channel.name);
      
      for (const format of channelFormats) {
        const creativeBrief = await generateCreativeBrief(
          format, 
          channel, 
          adCopy[channel.name], 
          companyProfile, 
          openai
        );
        
        creatives.formats.push({
          ...format,
          channel: channel.name,
          brief: creativeBrief,
          variations: await generateCreativeVariations(format, creativeBrief, openai)
        });
      }
    }

    // Generate design system
    creatives.designSystem = await generateDesignSystem(companyProfile, openai);
    
    // Generate creative calendar
    creatives.productionCalendar = generateProductionCalendar(creatives.formats);

    res.status(200).json({
      success: true,
      creatives,
      metadata: {
        generated_at: new Date().toISOString(),
        ai_service: ai_service_name || 'OpenAI GPT-4',
        total_formats: creatives.formats.length,
        production_timeline: '7-10 business days'
      }
    });

  } catch (error) {
    console.error('Creative generation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Creative generation failed',
      fallback_creatives: generateFallbackCreatives(mediaPlan, companyProfile)
    });
  }
}

function getChannelCreativeFormats(channelName) {
  const formatMap = {
    'Google Ads': [
      {
        name: 'Responsive Search Ads',
        dimensions: '300x250, 728x90, 320x50',
        icon: '🔍',
        platform: 'Google Search',
        variations: 3,
        priority: 'High',
        specs: {
          logo: 'Required in corner',
          text: 'Overlay on image',
          cta: 'Button style'
        }
      },
      {
        name: 'Responsive Display Ads',
        dimensions: '1200x628, 1080x1080, 1200x1500',
        icon: '🖼️',
        platform: 'Google Display Network',
        variations: 4,
        priority: 'Medium',
        specs: {
          logo: 'Prominent placement',
          imagery: 'High quality photos',
          text: 'Readable at small sizes'
        }
      },
      {
        name: 'YouTube Video Thumbnails',
        dimensions: '1280x720',
        icon: '🎬',
        platform: 'YouTube',
        variations: 2,
        priority: 'Low',
        specs: {
          style: 'Eye-catching, professional',
          text: 'Large, bold headlines',
          branding: 'Subtle logo placement'
        }
      }
    ],
    'Facebook/Instagram': [
      {
        name: 'Feed Single Image',
        dimensions: '1080x1080',
        icon: '📷',
        platform: 'Facebook/Instagram Feed',
        variations: 5,
        priority: 'High',
        specs: {
          ratio: '1:1 square format',
          text: 'Minimal overlay',
          style: 'Native, scrollable content'
        }
      },
      {
        name: 'Stories',
        dimensions: '1080x1920',
        icon: '📱',
        platform: 'Instagram/Facebook Stories',
        variations: 4,
        priority: 'High',
        specs: {
          ratio: '9:16 vertical',
          interactive: 'Swipe-up ready',
          mobile: 'Mobile-first design'
        }
      },
      {
        name: 'Carousel',
        dimensions: '1080x1080',
        icon: '🎠',
        platform: 'Facebook/Instagram Feed',
        variations: 3,
        priority: 'Medium',
        specs: {
          cards: '3-5 cards per set',
          consistency: 'Cohesive visual flow',
          storytelling: 'Sequential narrative'
        }
      },
      {
        name: 'Video (Square)',
        dimensions: '1080x1080',
        icon: '🎥',
        platform: 'Facebook/Instagram Feed',
        variations: 2,
        priority: 'Medium',
        specs: {
          duration: '15-30 seconds',
          captions: 'Subtitle ready',
          hook: 'Strong first 3 seconds'
        }
      }
    ],
    'LinkedIn': [
      {
        name: 'Sponsored Content',
        dimensions: '1200x627',
        icon: '💼',
        platform: 'LinkedIn Feed',
        variations: 4,
        priority: 'High',
        specs: {
          professional: 'Business appropriate',
          credibility: 'Trust indicators',
          b2b: 'Industry-specific imagery'
        }
      },
      {
        name: 'Message Ads',
        dimensions: '300x250',
        icon: '💬',
        platform: 'LinkedIn Messaging',
        variations: 2,
        priority: 'Medium',
        specs: {
          personal: 'Conversational tone',
          minimal: 'Clean, simple design',
          actionable: 'Clear next steps'
        }
      }
    ]
  };

  return formatMap[channelName] || formatMap['Google Ads'];
}

async function generateCreativeBrief(format, channel, channelCopy, companyProfile, openai) {
  const briefPrompt = `
As a creative director, write a detailed creative brief for ${format.name} ads for:

Company: ${companyProfile?.companyName || 'Alumni English School'}
Industry: ${companyProfile?.industry || 'Education'}
Platform: ${format.platform}
Format: ${format.name} (${format.dimensions})

Available Copy:
Headlines: ${channelCopy?.headlines?.slice(0, 3).join(', ') || 'Professional English'}
Descriptions: ${channelCopy?.descriptions?.slice(0, 2).join(', ') || 'Quality education'}

Creative Brief Requirements:

VISUAL CONCEPT:
- Overall visual direction and mood
- Color palette recommendations
- Photography/illustration style
- Typography approach

COMPOSITION:
- Layout structure for ${format.dimensions}
- Hierarchy of elements
- Logo placement guidelines
- Text overlay specifications

BRAND INTEGRATION:
- How to incorporate 60+ years heritage
- Government recognition display
- Professional credibility indicators
- Brazil-USA connection visual elements

AUDIENCE APPEAL:
- Visual elements that resonate with ${companyProfile?.targetPublic || 'professionals'}
- Professional vs approachable balance
- Cultural considerations for Brazil market

PLATFORM OPTIMIZATION:
- ${format.platform} best practices
- Mobile-first considerations
- Thumb-stopping elements
- Performance-focused design choices

PRODUCTION NOTES:
- Asset requirements
- Technical specifications
- Variation guidelines
- A/B testing considerations

Return a comprehensive brief that guides designers to create high-performing ${format.name} ads.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: briefPrompt }],
      max_tokens: 1500,
      temperature: 0.6
    });

    return parseCreativeBrief(response.choices[0].message.content, format);
  } catch (error) {
    console.error('Creative brief generation error:', error);
    return generateFallbackBrief(format, companyProfile);
  }
}

function parseCreativeBrief(briefText, format) {
  return {
    concept: extractBriefSection(briefText, 'VISUAL CONCEPT') || 'Professional, trustworthy, aspirational',
    composition: extractBriefSection(briefText, 'COMPOSITION') || `Optimized for ${format.dimensions}`,
    brandIntegration: extractBriefSection(briefText, 'BRAND INTEGRATION') || 'Heritage and credibility focus',
    audienceAppeal: extractBriefSection(briefText, 'AUDIENCE APPEAL') || 'Professional development focus',
    platformOptimization: extractBriefSection(briefText, 'PLATFORM OPTIMIZATION') || 'Mobile-optimized design',
    productionNotes: extractBriefSection(briefText, 'PRODUCTION NOTES') || 'High-quality assets required',
    fullBrief: briefText
  };
}

function extractBriefSection(text, sectionName) {
  try {
    const regex = new RegExp(`${sectionName}:?\\s*([\\s\\S]*?)(?=\\n\\n[A-Z]+:|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  } catch (error) {
    return null;
  }
}

async function generateCreativeVariations(format, brief, openai) {
  const variations = [];
  
  for (let i = 1; i <= format.variations; i++) {
    variations.push({
      id: i,
      name: `${format.name} Variation ${i}`,
      concept: generateVariationConcept(format, brief, i),
      mockup: generateMockupDescription(format, i),
      testingFocus: getVariationTestingFocus(i),
      designPrompt: generateDesignPrompt(format, brief, i)
    });
  }
  
  return variations;
}

function generateVariationConcept(format, brief, variationNumber) {
  const concepts = [
    'Heritage & Authority - Emphasize 60+ years experience with classic, trustworthy design',
    'Modern & Dynamic - Contemporary design with bold colors and modern typography',
    'Personal & Aspirational - Focus on individual success stories and career growth',
    'Corporate & Professional - B2B focused with business imagery and corporate appeal',
    'Innovative & Tech-Forward - Modern learning methods with digital-first approach'
  ];
  
  return concepts[variationNumber - 1] || concepts[0];
}

function generateMockupDescription(format, variationNumber) {
  return {
    mainImage: getImageDescription(variationNumber),
    textPlacement: getTextPlacement(format, variationNumber),
    colorScheme: getColorScheme(variationNumber),
    logoPlacement: getLogoPlacement(format),
    callToAction: getCTAStyle(variationNumber)
  };
}

function getImageDescription(variation) {
  const images = [
    'Professional businesswoman in modern office, confident and successful',
    'Group of diverse professionals in meeting, collaborative atmosphere',
    'Individual studying English online, modern home office setup',
    'Corporate training session, professional development focus',
    'Success celebration, career advancement achievement'
  ];
  
  return images[variation - 1] || images[0];
}

function getTextPlacement(format, variation) {
  if (format.dimensions.includes('1080x1920')) { // Stories
    return variation % 2 === 0 ? 'Top third overlay' : 'Bottom third overlay';
  } else if (format.dimensions.includes('1080x1080')) { // Square
    return variation % 2 === 0 ? 'Center overlay' : 'Bottom overlay';
  } else { // Landscape
    return variation % 2 === 0 ? 'Left side text area' : 'Right side text area';
  }
}

function getColorScheme(variation) {
  const schemes = [
    { primary: '#003366', secondary: '#0066CC', accent: '#FFD700' }, // Navy & Gold
    { primary: '#1E40AF', secondary: '#3B82F6', accent: '#10B981' }, // Blue & Green  
    { primary: '#7C3AED', secondary: '#A855F7', accent: '#F59E0B' }, // Purple & Orange
    { primary: '#DC2626', secondary: '#EF4444', accent: '#F97316' }, // Red & Orange
    { primary: '#059669', secondary: '#10B981', accent: '#3B82F6' }  // Green & Blue
  ];
  
  return schemes[variation - 1] || schemes[0];
}

function getLogoPlacement(format) {
  if (format.platform.includes('Google')) {
    return 'Bottom right corner, subtle';
  } else if (format.platform.includes('LinkedIn')) {
    return 'Top left, professional prominence';
  } else {
    return 'Integrated naturally within design';
  }
}

function getCTAStyle(variation) {
  const styles = [
    'Solid button, high contrast',
    'Outlined button, elegant',
    'Text link, minimal',
    'Gradient button, modern',
    'Floating action, dynamic'
  ];
  
  return styles[variation - 1] || styles[0];
}

function getVariationTestingFocus(variation) {
  const focuses = [
    'Trust & credibility indicators',
    'Modern appeal to younger professionals',
    'Personal success and aspiration',
    'Corporate benefits and ROI',
    'Innovation and technology'
  ];
  
  return focuses[variation - 1] || focuses[0];
}

function generateDesignPrompt(format, brief, variation) {
  return `Create a ${format.name} advertisement with dimensions ${format.dimensions}. 
Concept: ${generateVariationConcept(format, brief, variation)}
Style: ${brief.concept}
Layout: ${generateMockupDescription(format, variation).textPlacement}
Colors: Professional with ${getColorScheme(variation).primary} primary
Focus: ${getVariationTestingFocus(variation)}
Platform: Optimized for ${format.platform}`;
}

function generateDesignGuidelines(companyProfile) {
  return {
    brandColors: {
      primary: '#003366', // Navy blue - trust and professionalism
      secondary: '#0066CC', // Bright blue - modernity and innovation  
      accent: '#FFD700', // Gold - premium and achievement
      neutral: '#F8F9FA' // Light gray - clean and professional
    },
    typography: {
      headlines: 'Montserrat Bold - Modern, professional',
      body: 'Open Sans Regular - Readable, friendly',
      accent: 'Playfair Display - Elegant, authoritative'
    },
    imagery: {
      style: 'Professional photography with natural lighting',
      subjects: 'Diverse professionals, business settings, success moments',
      mood: 'Aspirational yet approachable, confident and optimistic',
      quality: 'High resolution, crisp, well-composed'
    },
    logoUsage: {
      clearSpace: 'Minimum 20px on all sides',
      minSize: '80px width for digital',
      placement: 'Consistent positioning across all formats',
      variations: 'Full logo, icon only, text only as needed'
    }
  };
}

function generateAssetLibrary(companyProfile) {
  return {
    photography: [
      'Professional headshots - diverse ages and backgrounds',
      'Classroom settings - modern, well-lit environments',
      'Business meetings - collaborative professional scenes',
      'Online learning - home office, laptop scenarios',
      'Success moments - graduation, achievement celebrations'
    ],
    graphics: [
      'Flag icons - Brazil and USA partnership',
      'Timeline graphics - 60+ years heritage',
      'Award badges - government recognition',
      'Progress indicators - learning journey',
      'Industry icons - various professional sectors'
    ],
    textures: [
      'Subtle paper texture - heritage and tradition',
      'Clean geometric patterns - modern approach',
      'Soft gradients - approachable feel',
      'Professional backgrounds - office environments'
    ]
  };
}

function generateBrandElements(companyProfile) {
  return {
    keyMessages: [
      '60+ Years of Excellence',
      'Official Brazil-USA Binational Center',
      'Government Recognized Quality',
      'Flexible Online + In-Person',
      'Corporate Training Specialists'
    ],
    visualElements: [
      'Heritage badge - "Since 1960"',
      'Government seal integration',
      'Bi-national flag element',
      'Professional certification symbols',
      'Modern technology icons'
    ],
    tonalAttributes: [
      'Professional yet approachable',
      'Trustworthy and established',
      'Modern and innovative',
      'Results-oriented',
      'Culturally aware'
    ]
  };
}

async function generateDesignSystem(companyProfile, openai) {
  const designSystemPrompt = `
Create a comprehensive design system for ${companyProfile?.companyName || 'Alumni English School'} advertising campaigns.

Company Context:
- 60+ years in English education
- Official Brazil-USA Binational Center
- Government recognized
- Professional and corporate focus
- São Paulo, Brazil location

Design System Requirements:

VISUAL IDENTITY:
- Primary brand colors and usage
- Secondary color palette
- Typography hierarchy
- Logo placement guidelines

IMAGERY STYLE:
- Photography direction
- Illustration style if needed
- Icon set specifications
- Graphic element library

LAYOUT PRINCIPLES:
- Grid systems for different formats
- Spacing and proportion rules
- Hierarchy and emphasis guidelines
- Responsive design considerations

BRAND VOICE VISUAL:
- How to express "professional yet approachable"
- Heritage vs modern balance
- Government credibility display
- International partnership representation

Return a structured design system that ensures consistent, professional advertising across all platforms.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: designSystemPrompt }],
      max_tokens: 1000,
      temperature: 0.5
    });

    return {
      guidelines: response.choices[0].message.content,
      colorPalette: generateDesignGuidelines(companyProfile).brandColors,
      typography: generateDesignGuidelines(companyProfile).typography,
      spacing: {
        small: '8px',
        medium: '16px', 
        large: '24px',
        xlarge: '32px'
      },
      borderRadius: {
        small: '4px',
        medium: '8px',
        large: '16px'
      }
    };
  } catch (error) {
    return generateDesignGuidelines(companyProfile);
  }
}

function generateProductionCalendar(formats) {
  const timeline = {
    week1: {
      phase: 'Creative Brief & Concept',
      deliverables: [
        'Finalize creative briefs',
        'Concept approval from stakeholders',
        'Asset gathering and preparation'
      ]
    },
    week2: {
      phase: 'Design & Development',
      deliverables: [
        'Initial design concepts',
        'First round of variations',
        'Internal review and feedback'
      ]
    },
    week3: {
      phase: 'Refinement & Optimization',
      deliverables: [
        'Design revisions based on feedback',
        'Final format adaptations',
        'Quality assurance testing'
      ]
    },
    week4: {
      phase: 'Final Delivery',
      deliverables: [
        'Final asset delivery',
        'Format specifications documentation',
        'Campaign launch preparation'
      ]
    }
  };

  return {
    timeline,
    totalFormats: formats.length,
    estimatedHours: formats.length * 8, // 8 hours per format
    priority: formats.filter(f => f.priority === 'High').length,
    dependencies: ['Brand guidelines approval', 'Copy finalization', 'Asset library access']
  };
}

function generateFallbackBrief(format, companyProfile) {
  return {
    concept: 'Professional and trustworthy design emphasizing heritage and quality',
    composition: `Clean layout optimized for ${format.dimensions} with clear hierarchy`,
    brandIntegration: '60+ years experience and government recognition prominently featured',
    audienceAppeal: 'Appeals to career-focused professionals seeking growth opportunities',
    platformOptimization: `Designed for optimal performance on ${format.platform}`,
    productionNotes: 'Use high-quality imagery and maintain brand consistency'
  };
}

function generateFallbackCreatives(mediaPlan, companyProfile) {
  return {
    formats: [
      {
        name: 'Standard Display Ad',
        dimensions: '1200x628',
        icon: '🖼️',
        platform: 'Multi-platform',
        variations: 3,
        concept: 'Professional English education with heritage emphasis'
      }
    ],
    designGuidelines: generateDesignGuidelines(companyProfile),
    productionCalendar: {
      timeline: 'Standard 2-week production cycle',
      totalFormats: 1
    }
  };
}