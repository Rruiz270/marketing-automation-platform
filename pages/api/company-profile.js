// Company Profile API with persistent storage
const fs = require('fs');
const path = require('path');

// In-memory storage with file persistence
let memoryStorage = {};
const STORAGE_FILE = path.join('/tmp', 'company-profiles.json');

// Load stored profiles
function loadStoredProfiles() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      const fileData = JSON.parse(data);
      memoryStorage = { ...memoryStorage, ...fileData };
      console.log('Loaded company profiles from file');
    }
  } catch (error) {
    console.error('Error loading company profiles:', error);
  }
  
  return memoryStorage;
}

// Save profiles
function saveStoredProfiles(profiles) {
  memoryStorage = profiles;
  
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(profiles, null, 2));
    console.log('Saved company profiles to file');
  } catch (error) {
    console.error('Error saving company profiles:', error);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, user_id, data } = req.body;
    console.log('Company Profile API:', { action, user_id });
    
    // Load existing profiles
    let storedProfiles = loadStoredProfiles();

    switch (action) {
      case 'save':
        if (!user_id || !data) {
          return res.status(400).json({ error: 'User ID and data are required' });
        }

        // Validate required fields
        const requiredFields = ['companyName', 'industry', 'targetPublic', 'geolocation', 'monthlyBudget', 'marketingObjectives'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
          return res.status(400).json({ 
            error: 'Missing required fields',
            missingFields 
          });
        }

        // Store profile with timestamp
        storedProfiles[user_id] = {
          ...data,
          user_id,
          created_at: storedProfiles[user_id]?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        saveStoredProfiles(storedProfiles);

        return res.status(200).json({
          success: true,
          message: 'Company profile saved successfully',
          data: storedProfiles[user_id]
        });

      case 'get':
        if (!user_id) {
          return res.status(400).json({ error: 'User ID is required' });
        }

        const profile = storedProfiles[user_id];
        
        return res.status(200).json({
          success: true,
          data: profile || null
        });

      case 'delete':
        if (!user_id) {
          return res.status(400).json({ error: 'User ID is required' });
        }

        if (storedProfiles[user_id]) {
          delete storedProfiles[user_id];
          saveStoredProfiles(storedProfiles);
          
          return res.status(200).json({
            success: true,
            message: 'Company profile deleted successfully'
          });
        } else {
          return res.status(404).json({ error: 'Profile not found' });
        }

      case 'analyze':
        if (!user_id) {
          return res.status(400).json({ error: 'User ID is required' });
        }

        const companyProfile = storedProfiles[user_id];
        if (!companyProfile) {
          return res.status(404).json({ error: 'Company profile not found' });
        }

        // Generate AI insights based on company profile
        const insights = generateCompanyInsights(companyProfile);
        
        return res.status(200).json({
          success: true,
          insights
        });

      case 'list_all':
        const allCompanies = Object.values(storedProfiles);
        
        return res.status(200).json({
          success: true,
          companies: allCompanies
        });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Company Profile API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Generate insights based on company profile
function generateCompanyInsights(profile) {
  const {
    companyName,
    industry,
    targetPublic,
    geolocation,
    products,
    generalAverageTicket,
    competitors,
    differentials,
    marketingChallenges,
    currentChannels,
    currentCAC,
    expectedCAC,
    monthlyBudget,
    marketingObjectives
  } = profile;

  // Calculate metrics
  const budgetFloat = parseFloat(monthlyBudget) || 10000;
  const currentCACFloat = parseFloat(currentCAC) || 150;
  const expectedCACFloat = parseFloat(expectedCAC) || 100;
  const avgTicketFloat = parseFloat(generalAverageTicket) || 500;
  
  const potentialMonthlyLeads = Math.floor(budgetFloat / expectedCACFloat);
  const potentialMonthlyRevenue = potentialMonthlyLeads * avgTicketFloat;
  const roasTarget = potentialMonthlyRevenue / budgetFloat;
  const cacReduction = ((currentCACFloat - expectedCACFloat) / currentCACFloat) * 100;

  return {
    company: companyName,
    summary: `${companyName} operates in the ${industry} industry, targeting ${targetPublic} in ${geolocation}.`,
    
    marketPosition: {
      strengths: differentials || 'Unique value proposition to be defined',
      challenges: marketingChallenges || 'Marketing challenges to be identified',
      competitors: competitors.filter(c => c).join(', ') || 'Competitors to be analyzed',
      currentChannels: currentChannels.length > 0 ? currentChannels : ['No channels currently active']
    },
    
    performanceMetrics: {
      currentCAC: `R$ ${currentCACFloat.toFixed(2)}`,
      targetCAC: `R$ ${expectedCACFloat.toFixed(2)}`,
      cacReductionGoal: `${cacReduction.toFixed(1)}%`,
      monthlyBudget: `R$ ${budgetFloat.toLocaleString('pt-BR')}`,
      averageTicket: `R$ ${avgTicketFloat.toFixed(2)}`,
      targetROAS: roasTarget.toFixed(1) + 'x'
    },
    
    projections: {
      monthlyLeadsTarget: potentialMonthlyLeads,
      monthlyRevenueTarget: `R$ ${potentialMonthlyRevenue.toLocaleString('pt-BR')}`,
      yearlyRevenueTarget: `R$ ${(potentialMonthlyRevenue * 12).toLocaleString('pt-BR')}`,
      breakEvenLeads: Math.ceil(budgetFloat / avgTicketFloat)
    },
    
    recommendations: generateRecommendations(profile),
    
    nextSteps: [
      'Complete AI service connections for automated campaign creation',
      'Set up tracking pixels and conversion APIs',
      'Create first AI-powered campaign based on objectives',
      'Implement A/B testing framework',
      'Configure real-time optimization rules'
    ]
  };
}

// Generate strategic recommendations
function generateRecommendations(profile) {
  const recommendations = [];
  const budget = parseFloat(profile.monthlyBudget) || 10000;
  const currentChannels = profile.currentChannels || [];
  
  // Channel recommendations
  if (budget > 20000 && !currentChannels.includes('LinkedIn Ads')) {
    recommendations.push({
      type: 'channel',
      priority: 'high',
      title: 'Add LinkedIn Ads for B2B',
      description: 'With your budget and B2B focus, LinkedIn can deliver high-quality leads',
      expectedImpact: '40% better lead quality'
    });
  }
  
  if (!currentChannels.includes('Google Ads')) {
    recommendations.push({
      type: 'channel',
      priority: 'high',
      title: 'Implement Google Ads Search',
      description: 'Capture high-intent users actively searching for your services',
      expectedImpact: '35% of total conversions'
    });
  }
  
  // Budget allocation
  recommendations.push({
    type: 'budget',
    priority: 'medium',
    title: 'Optimal Budget Distribution',
    description: 'Based on your objectives and market',
    allocation: {
      'Google Ads': '40%',
      'Facebook/Instagram': '35%',
      'LinkedIn': '20%',
      'Testing & Innovation': '5%'
    }
  });
  
  // Strategy recommendations
  if (profile.competitors && profile.competitors.filter(c => c).length > 0) {
    recommendations.push({
      type: 'strategy',
      priority: 'high',
      title: 'Competitive Positioning Campaign',
      description: 'Leverage your differentials against competitors',
      expectedImpact: '25% market share gain'
    });
  }
  
  return recommendations;
}