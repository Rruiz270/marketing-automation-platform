// Company Projects API - Manage projects under companies
const fs = require('fs');
const path = require('path');

// Storage
let memoryStorage = {};

// Use environment variable for storage path or default to a persistent location
const STORAGE_DIR = process.env.STORAGE_PATH || path.join(process.cwd(), 'data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'company-projects.json');

// Ensure storage directory exists
function ensureStorageDir() {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
      console.log('Created projects storage directory:', STORAGE_DIR);
    }
  } catch (error) {
    console.error('Error creating projects storage directory:', error);
  }
}

// Load stored projects
function loadStoredProjects() {
  try {
    ensureStorageDir();
    
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      const fileData = JSON.parse(data);
      memoryStorage = { ...memoryStorage, ...fileData };
      console.log('Loaded company projects from file:', Object.keys(memoryStorage).length);
    } else {
      console.log('No existing projects file found');
    }
  } catch (error) {
    console.error('Error loading company projects:', error);
  }
  return memoryStorage;
}

// Save projects
function saveStoredProjects(projects) {
  memoryStorage = projects;
  try {
    ensureStorageDir();
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(projects, null, 2));
    console.log('Saved company projects to file:', Object.keys(projects).length, 'companies');
  } catch (error) {
    console.error('Error saving company projects:', error);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, company_id, project_id, data } = req.body;
    
    // Load existing projects
    let storedProjects = loadStoredProjects();

    switch (action) {
      case 'create':
        if (!company_id || !data) {
          return res.status(400).json({ error: 'Company ID and project data required' });
        }

        const projectId = `${company_id}_${Date.now()}`;
        const newProject = {
          id: projectId,
          company_id,
          name: data.name,
          description: data.description,
          targetAudience: data.targetAudience || '',
          platforms: data.platforms || [],
          budget: data.budget || '',
          objectives: data.objectives || '',
          created_at: new Date().toISOString(),
          status: 'active'
        };

        storedProjects[projectId] = newProject;
        saveStoredProjects(storedProjects);

        return res.status(200).json({
          success: true,
          message: 'Project created successfully',
          project: newProject
        });

      case 'list':
        if (!company_id) {
          return res.status(400).json({ error: 'Company ID required' });
        }

        const companyProjects = Object.values(storedProjects)
          .filter(p => p.company_id === company_id);

        return res.status(200).json({
          success: true,
          projects: companyProjects
        });

      case 'get':
        if (!project_id) {
          return res.status(400).json({ error: 'Project ID required' });
        }

        const project = storedProjects[project_id];
        
        return res.status(200).json({
          success: true,
          project: project || null
        });

      case 'update':
        if (!project_id || !data) {
          return res.status(400).json({ error: 'Project ID and data required' });
        }

        if (storedProjects[project_id]) {
          storedProjects[project_id] = {
            ...storedProjects[project_id],
            ...data,
            updated_at: new Date().toISOString()
          };
          saveStoredProjects(storedProjects);

          return res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            project: storedProjects[project_id]
          });
        } else {
          return res.status(404).json({ error: 'Project not found' });
        }

      case 'delete':
        if (!project_id) {
          return res.status(400).json({ error: 'Project ID required' });
        }

        if (storedProjects[project_id]) {
          delete storedProjects[project_id];
          saveStoredProjects(storedProjects);
          
          return res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
          });
        } else {
          return res.status(404).json({ error: 'Project not found' });
        }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Projects API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}