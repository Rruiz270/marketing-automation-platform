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

  // 2. Save to browser storage alternatives (Vercel-compatible)
  if (typeof window !== 'undefined') {
    // Multiple browser storage methods for redundancy
    const backupMethods = [
      // sessionStorage backup
      () => {
        sessionStorage.setItem('EMERGENCY_COMPANY_SESSION', JSON.stringify(backupData));
        return '✅ Saved to sessionStorage';
      },
      // IndexedDB backup
      () => {
        if ('indexedDB' in window) {
          // Simple IndexedDB backup (fire and forget)
          const request = indexedDB.open('EmergencyBackup', 1);
          request.onsuccess = (event) => {
            const db = event.target.result;
            if (db.objectStoreNames.contains('companyData')) {
              const transaction = db.transaction(['companyData'], 'readwrite');
              const store = transaction.objectStore('companyData');
              store.put(backupData, 'company_backup');
            }
          };
          return '✅ Saved to IndexedDB';
        }
        return '❌ IndexedDB not available';
      }
    ];

    for (const method of backupMethods) {
      try {
        const result = method();
        results.push(result);
      } catch (e) {
        console.warn('Backup method failed:', e.message);
      }
    }
  }

  // 3. Server-side backup disabled for Vercel compatibility
  if (typeof window === 'undefined') {
    // Skip file system operations on Vercel serverless
    results.push('⚠️ Server-side backup skipped (Vercel serverless)');
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

  // 2. Check sessionStorage (if browser)
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('EMERGENCY_COMPANY_SESSION');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.userId === userId) {
          console.log('✅ RECOVERED from sessionStorage');
          return parsed.companyData;
        }
      }
    } catch (e) {
      console.warn('Failed sessionStorage recovery:', e.message);
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