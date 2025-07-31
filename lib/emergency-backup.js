// EMERGENCY BACKUP SYSTEM - SAVES TO MULTIPLE PERMANENT LOCATIONS
// This ensures company data NEVER disappears again

export async function emergencyBackupCompanyData(companyData, userId = 'default_user') {
  const timestamp = new Date().toISOString();
  const backupData = {
    userId,
    companyData,
    timestamp,
    backupId: `backup_${Date.now()}`
  };

  console.log('🚨 EMERGENCY BACKUP: Saving company data to ALL locations...');
  
  const results = [];

  // 1. Save to localStorage (if browser)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('EMERGENCY_COMPANY_BACKUP', JSON.stringify(backupData));
      results.push('✅ Saved to localStorage');
    } catch (e) {
      console.warn('Failed localStorage backup:', e.message);
    }
  }

  // 2. Save to multiple file locations (if server)
  if (typeof window === 'undefined') {
    const fs = require('fs');
    const path = require('path');
    
    const backupLocations = [
      // Public directory (accessible via web)
      path.join(process.cwd(), 'public', 'emergency_company_backup.json'),
      // Lib directory
      path.join(process.cwd(), 'lib', 'company_emergency.json'),
      // Pages directory
      path.join(process.cwd(), 'pages', 'company_backup.json'),
      // Components directory  
      path.join(process.cwd(), 'components', 'company_data.json'),
      // Styles directory
      path.join(process.cwd(), 'styles', 'company_backup.json')
    ];

    for (const location of backupLocations) {
      try {
        const dir = path.dirname(location);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(location, JSON.stringify(backupData, null, 2));
        results.push(`✅ Saved to ${location}`);
      } catch (error) {
        console.warn(`Failed to save to ${location}:`, error.message);
      }
    }
  }

  // 3. Save to console (for debugging)
  console.log('🚨 EMERGENCY COMPANY DATA BACKUP:', JSON.stringify(backupData, null, 2));

  // 4. Try to save to environment variable
  if (typeof process !== 'undefined') {
    try {
      process.env.EMERGENCY_COMPANY_BACKUP = JSON.stringify(backupData);
      results.push('✅ Saved to environment variable');
    } catch (e) {
      console.warn('Failed env var backup:', e.message);
    }
  }

  console.log('🚨 EMERGENCY BACKUP COMPLETE:', results);
  return results;
}

export async function emergencyRecoverCompanyData(userId = 'default_user') {
  console.log('🔍 EMERGENCY RECOVERY: Searching for company data...');
  
  // 1. Check localStorage (if browser)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('EMERGENCY_COMPANY_BACKUP');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.userId === userId) {
          console.log('✅ RECOVERED from localStorage');
          return parsed.companyData;
        }
      }
    } catch (e) {
      console.warn('Failed localStorage recovery:', e.message);
    }
  }

  // 2. Check file locations (if server)
  if (typeof window === 'undefined') {
    const fs = require('fs');
    const path = require('path');
    
    const backupLocations = [
      path.join(process.cwd(), 'public', 'emergency_company_backup.json'),
      path.join(process.cwd(), 'lib', 'company_emergency.json'),
      path.join(process.cwd(), 'pages', 'company_backup.json'),
      path.join(process.cwd(), 'components', 'company_data.json'),
      path.join(process.cwd(), 'styles', 'company_backup.json')
    ];

    for (const location of backupLocations) {
      try {
        if (fs.existsSync(location)) {
          const data = fs.readFileSync(location, 'utf8');
          const parsed = JSON.parse(data);
          if (parsed.userId === userId) {
            console.log(`✅ RECOVERED from ${location}`);
            return parsed.companyData;
          }
        }
      } catch (error) {
        console.warn(`Failed to recover from ${location}:`, error.message);
      }
    }
  }

  // 3. Check environment variable
  if (typeof process !== 'undefined' && process.env.EMERGENCY_COMPANY_BACKUP) {
    try {
      const parsed = JSON.parse(process.env.EMERGENCY_COMPANY_BACKUP);
      if (parsed.userId === userId) {
        console.log('✅ RECOVERED from environment variable');
        return parsed.companyData;
      }
    } catch (e) {
      console.warn('Failed env var recovery:', e.message);
    }
  }

  console.log('❌ No emergency backup found');
  return null;
}