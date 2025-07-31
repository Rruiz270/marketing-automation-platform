// Company Projects API - Vercel compatible (in-memory only)
// Note: Data will not persist between deployments on Vercel
// In production, this should connect to a database

// In-memory storage for current session
let memoryStorage = {};

// Since Vercel is serverless and stateless, we can't use file system
// Data will reset on each deployment or function restart
// This is a temporary solution - should be replaced with a database

// Load stored projects (in-memory only)
function loadStoredProjects() {
  // In Vercel, we can only use memory storage
  // Data will be lost when function restarts
  console.log('Loading company projects from memory:', Object.keys(memoryStorage).length);
  return memoryStorage;
}

// Save projects (in-memory only)
function saveStoredProjects(projects) {
  memoryStorage = projects;
  console.log('Saved company projects to memory:', Object.keys(projects).length, 'projects');
  // Note: This data will be lost when the serverless function restarts
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