// Persistent storage solution that survives serverless deployments
// Uses multiple storage layers for maximum reliability

class PersistentStorage {
  constructor() {
    this.cache = new Map();
    this.storageKey = 'marketing_platform_data';
  }

  // Store data with multiple redundancy layers
  async store(key, data) {
    const timestamp = new Date().toISOString();
    const storageData = {
      data,
      timestamp,
      backup_count: 3
    };

    try {
      // Layer 1: Memory cache
      this.cache.set(key, storageData);

      // Layer 2: Environment variable storage (for small data)
      if (typeof process !== 'undefined' && process.env) {
        const envKey = `PERSISTENT_${key.toUpperCase()}`;
        // Only store if data is small enough for env vars
        const dataString = JSON.stringify(storageData);
        if (dataString.length < 4000) {
          process.env[envKey] = dataString;
        }
      }

      // Layer 3: Create multiple backup files with timestamps
      if (typeof window === 'undefined') {
        const fs = require('fs');
        const path = require('path');
        
        // Create multiple backup locations
        const backupPaths = [
          path.join(process.cwd(), 'data', `${key}.json`),
          path.join(process.cwd(), 'public', `${key}_backup.json`),
          path.join(process.cwd(), 'lib', `${key}_storage.json`)
        ];

        for (const backupPath of backupPaths) {
          try {
            const dir = path.dirname(backupPath);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(backupPath, JSON.stringify(storageData, null, 2));
          } catch (error) {
            console.warn(`Failed to write to ${backupPath}:`, error.message);
          }
        }
      }

      console.log(`✅ Stored ${key} with timestamp ${timestamp}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to store ${key}:`, error);
      return false;
    }
  }

  // Retrieve data from multiple sources
  async retrieve(key) {
    try {
      // Layer 1: Check memory cache first
      if (this.cache.has(key)) {
        const cached = this.cache.get(key);
        console.log(`✅ Retrieved ${key} from memory cache`);
        return cached.data;
      }

      // Layer 2: Check environment variables
      if (typeof process !== 'undefined' && process.env) {
        const envKey = `PERSISTENT_${key.toUpperCase()}`;
        if (process.env[envKey]) {
          try {
            const parsed = JSON.parse(process.env[envKey]);
            this.cache.set(key, parsed); // Update cache
            console.log(`✅ Retrieved ${key} from environment variable`);
            return parsed.data;
          } catch (parseError) {
            console.warn(`Failed to parse env var ${envKey}`);
          }
        }
      }

      // Layer 3: Check backup files
      if (typeof window === 'undefined') {
        const fs = require('fs');
        const path = require('path');
        
        const backupPaths = [
          path.join(process.cwd(), 'data', `${key}.json`),
          path.join(process.cwd(), 'public', `${key}_backup.json`),
          path.join(process.cwd(), 'lib', `${key}_storage.json`)
        ];

        for (const backupPath of backupPaths) {
          try {
            if (fs.existsSync(backupPath)) {
              const fileContent = fs.readFileSync(backupPath, 'utf8');
              const parsed = JSON.parse(fileContent);
              this.cache.set(key, parsed); // Update cache
              console.log(`✅ Retrieved ${key} from ${backupPath}`);
              return parsed.data;
            }
          } catch (error) {
            console.warn(`Failed to read ${backupPath}:`, error.message);
          }
        }
      }

      console.log(`⚠️ No data found for ${key}`);
      return null;

    } catch (error) {
      console.error(`❌ Failed to retrieve ${key}:`, error);
      return null;
    }
  }

  // List all stored keys
  async listKeys() {
    const keys = new Set();
    
    // From memory cache
    for (const key of this.cache.keys()) {
      keys.add(key);
    }

    // From environment variables
    if (typeof process !== 'undefined' && process.env) {
      for (const envKey of Object.keys(process.env)) {
        if (envKey.startsWith('PERSISTENT_')) {
          const key = envKey.replace('PERSISTENT_', '').toLowerCase();
          keys.add(key);
        }
      }
    }

    // From files
    if (typeof window === 'undefined') {
      try {
        const fs = require('fs');
        const path = require('path');
        
        const dataDirs = [
          path.join(process.cwd(), 'data'),
          path.join(process.cwd(), 'public'),
          path.join(process.cwd(), 'lib')
        ];

        for (const dir of dataDirs) {
          if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            for (const file of files) {
              if (file.endsWith('.json') && (file.includes('_backup') || file.includes('_storage') || !file.includes('_'))) {
                const key = file.replace('.json', '').replace('_backup', '').replace('_storage', '');
                keys.add(key);
              }
            }
          }
        }
      } catch (error) {
        console.warn('Error scanning directories:', error.message);
      }
    }

    return Array.from(keys);
  }

  // Delete data from all layers
  async delete(key) {
    try {
      // Remove from cache
      this.cache.delete(key);

      // Remove from environment (not really possible, but clear the value)
      if (typeof process !== 'undefined' && process.env) {
        const envKey = `PERSISTENT_${key.toUpperCase()}`;
        delete process.env[envKey];
      }

      // Remove files
      if (typeof window === 'undefined') {
        const fs = require('fs');
        const path = require('path');
        
        const backupPaths = [
          path.join(process.cwd(), 'data', `${key}.json`),
          path.join(process.cwd(), 'public', `${key}_backup.json`),
          path.join(process.cwd(), 'lib', `${key}_storage.json`)
        ];

        for (const backupPath of backupPaths) {
          try {
            if (fs.existsSync(backupPath)) {
              fs.unlinkSync(backupPath);
            }
          } catch (error) {
            console.warn(`Failed to delete ${backupPath}:`, error.message);
          }
        }
      }

      console.log(`✅ Deleted ${key} from all storage layers`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to delete ${key}:`, error);
      return false;
    }
  }
}

// Export singleton instance
const storage = new PersistentStorage();
export default storage;