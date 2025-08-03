// Company Projects API - Vercel-compatible with browser storage backup
import { connectToDatabase } from '../../lib/mongodb';

// In-memory storage for current session (Vercel serverless)
let memoryStorage = {};

// Load stored projects from MongoDB with fallback
async function loadStoredProjects() {
  try {
    // Try MongoDB first
    const { db } = await connectToDatabase();
    const projects = await db.collection('company_projects').find({}).toArray();
    
    if (projects.length > 0) {
      const projectsById = {};
      projects.forEach(project => {
        projectsById[project.id] = project;
      });
      memoryStorage = { ...memoryStorage, ...projectsById };
      console.log('✅ Loaded company projects from MongoDB:', Object.keys(projectsById).length);
      return projectsById;
    }
  } catch (error) {
    console.warn('⚠️ MongoDB not available for projects, using memory storage:', error.message);
  }
  
  // Use memory storage as fallback
  console.log('📝 Using memory storage for projects:', Object.keys(memoryStorage).length);
  return memoryStorage;
}

// Save projects to MongoDB with memory backup
async function saveStoredProjects(projects) {
  memoryStorage = projects;
  
  try {
    // Try to save to MongoDB
    const { db } = await connectToDatabase();
    
    // Update each project in MongoDB
    for (const [projectId, project] of Object.entries(projects)) {
      await db.collection('company_projects').updateOne(
        { id: projectId },
        { $set: project },
        { upsert: true }
      );
    }
    
    console.log('✅ Saved company projects to MongoDB:', Object.keys(projects).length, 'projects');
  } catch (error) {
    console.warn('⚠️ Could not save projects to MongoDB, keeping in memory:', error.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, company_id, project_id, data } = req.body;
    
    // Load existing projects
    let storedProjects = await loadStoredProjects();

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
        await saveStoredProjects(storedProjects);

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
          await saveStoredProjects(storedProjects);

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
          await saveStoredProjects(storedProjects);
          
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