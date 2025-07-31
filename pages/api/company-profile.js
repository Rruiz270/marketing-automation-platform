// Company Profile API with BULLETPROOF persistent storage
const fs = require('fs');
const path = require('path');

// Import bulletproof storage system
import storage from '../../lib/persistent-storage.js';
import { emergencyBackupCompanyData, emergencyRecoverCompanyData } from '../../lib/emergency-backup.js';

// Fallback in-memory storage
let memoryStorage = {};

// Multiple storage locations for maximum redundancy
const STORAGE_DIR = process.env.STORAGE_PATH || path.join(process.cwd(), 'data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'company-profiles.json');

// Ensure storage directory exists
function ensureStorageDir() {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
      console.log('Created storage directory:', STORAGE_DIR);
    }
  } catch (error) {
    console.error('Error creating storage directory:', error);
  }
}

// Load stored profiles with BULLETPROOF recovery
async function loadStoredProfiles() {
  try {
    console.log('🔍 Loading company profiles with bulletproof storage...');
    
    // EMERGENCY RECOVERY FIRST
    const emergencyData = await emergencyRecoverCompanyData();
    if (emergencyData) {
      memoryStorage = { 'default_user': emergencyData };
      console.log('🚨 EMERGENCY RECOVERY SUCCESSFUL!');
      // Immediately save to all other storages
      await storage.store('company_profiles', memoryStorage);
      return memoryStorage;
    }

    // Try bulletproof storage second
    const bulletproofData = await storage.retrieve('company_profiles');
    if (bulletproofData) {
      memoryStorage = bulletproofData;
      console.log('✅ Loaded company profiles from bulletproof storage:', Object.keys(memoryStorage).length);
      return memoryStorage;
    }
    
    // Fallback to traditional file storage
    ensureStorageDir();
    
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      const fileData = JSON.parse(data);
      memoryStorage = { ...memoryStorage, ...fileData };
      console.log('✅ Loaded company profiles from file (fallback):', Object.keys(memoryStorage).length);
      
      // Immediately save to bulletproof storage
      await storage.store('company_profiles', memoryStorage);
      
    } else {
      console.log('⚠️ No existing company profiles found - creating new storage');
      memoryStorage = {};
      // Initialize bulletproof storage
      await storage.store('company_profiles', memoryStorage);
      
      // Create traditional file as backup
      try {
        fs.writeFileSync(STORAGE_FILE, JSON.stringify({}, null, 2));
      } catch (fileError) {
        console.warn('Failed to create traditional backup file:', fileError.message);
      }
    }
  } catch (error) {
    console.error('❌ Error loading company profiles:', error);
    memoryStorage = {};
    
    // Try to initialize empty bulletproof storage
    try {
      await storage.store('company_profiles', memoryStorage);
      console.log('✅ Initialized empty bulletproof storage');
    } catch (storageError) {
      console.error('❌ Failed to initialize bulletproof storage:', storageError);
    }
  }
  
  return memoryStorage;
}

// Save profiles with BULLETPROOF persistence
async function saveStoredProfiles(profiles) {
  memoryStorage = profiles;
  
  try {
    console.log('💾 Saving company profiles with bulletproof storage...');
    
    // EMERGENCY BACKUP FIRST - ALWAYS SAVE TO ALL LOCATIONS
    for (const userId in profiles) {
      await emergencyBackupCompanyData(profiles[userId], userId);
    }
    console.log('🚨 EMERGENCY BACKUP COMPLETED FOR ALL USERS');

    // PRIMARY: Save to bulletproof storage (multiple layers)
    const bulletproofSuccess = await storage.store('company_profiles', profiles);
    if (bulletproofSuccess) {
      console.log('✅ Saved company profiles to bulletproof storage:', Object.keys(profiles).length, 'profiles');
    }
    
    // BACKUP: Traditional file storage
    ensureStorageDir();
    
    // Create backup first
    const backupFile = STORAGE_FILE.replace('.json', '_backup.json');
    if (fs.existsSync(STORAGE_FILE)) {
      fs.copyFileSync(STORAGE_FILE, backupFile);
    }
    
    // Write new data
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(profiles, null, 2));
    console.log('✅ Saved company profiles to traditional file storage');
    
    // Create timestamped backup
    const localBackup = path.join(STORAGE_DIR, `profiles_${Date.now()}.json`);
    fs.writeFileSync(localBackup, JSON.stringify(profiles, null, 2));
    
    // EXTRA BACKUP: Save to public directory (accessible via HTTP)
    try {
      const publicBackup = path.join(process.cwd(), 'public', 'company_profiles_backup.json');
      fs.writeFileSync(publicBackup, JSON.stringify(profiles, null, 2));
      console.log('✅ Created public backup');
    } catch (publicError) {
      console.warn('Failed to create public backup:', publicError.message);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error saving company profiles:', error);
    
    // Try to restore from backup
    const backupFile = STORAGE_FILE.replace('.json', '_backup.json');
    if (fs.existsSync(backupFile)) {
      try {
        fs.copyFileSync(backupFile, STORAGE_FILE);
        console.log('✅ Restored from traditional backup');
      } catch (restoreError) {
        console.error('❌ Failed to restore from backup:', restoreError);
      }
    }
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, user_id, data } = req.body;
    console.log('Company Profile API:', { action, user_id });
    
    // Load existing profiles with bulletproof recovery
    let storedProfiles = await loadStoredProfiles();

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

        await saveStoredProfiles(storedProfiles);

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
          await saveStoredProfiles(storedProfiles);
          
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
        console.log('Company Profile API: list_all called');
        console.log('Company Profile API: storedProfiles keys:', Object.keys(storedProfiles));
        console.log('Company Profile API: allCompanies length:', allCompanies.length);
        console.log('Company Profile API: allCompanies:', allCompanies);
        
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