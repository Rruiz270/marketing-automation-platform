import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectManager from './ProjectManager';
import { 
  emergencyRecoverCompanyData, 
  emergencyRecoverProjectData, 
  emergencyBackupProjectData
} from '../lib/emergency-backup.js';

const ModernCampaignBuilder = ({ connectedAIs, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stepData, setStepData] = useState({});
  const [showApproval, setShowApproval] = useState(false);
  const [currentGeneration, setCurrentGeneration] = useState(null);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showContentViewer, setShowContentViewer] = useState(false);
  const [contentViewerData, setContentViewerData] = useState(null);
  const [generationPrompts, setGenerationPrompts] = useState({});
  const [editedContent, setEditedContent] = useState('');
  const [editedPrompt, setEditedPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);

  const steps = [
    { 
      id: 0, 
      title: 'Project Selection', 
      icon: '🏢', 
      description: 'Choose company and project for campaign',
      color: 'from-gray-500 to-gray-600'
    },
    { 
      id: 1, 
      title: 'Strategy Translation', 
      icon: '🎯', 
      description: 'AI translates business objectives into marketing strategy',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 2, 
      title: 'Media Planning', 
      icon: '📊', 
      description: 'AI-optimized channel selection and budget allocation',
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 3, 
      title: 'Copy Creation', 
      icon: '✍️', 
      description: 'Generate high-converting copy for each channel',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      id: 4, 
      title: 'Creative Design', 
      icon: '🎨', 
      description: 'AI-generated visuals and creative assets',
      color: 'from-pink-500 to-pink-600'
    },
    { 
      id: 5, 
      title: 'Campaign Structure', 
      icon: '🏗️', 
      description: 'Organize campaigns, ad groups, and targeting',
      color: 'from-orange-500 to-orange-600'
    },
    { 
      id: 6, 
      title: 'Platform Setup', 
      icon: '🚀', 
      description: 'Deploy to advertising platforms',
      color: 'from-red-500 to-red-600'
    },
    { 
      id: 7, 
      title: 'Performance Tracking', 
      icon: '📈', 
      description: 'AI-powered insights and optimization',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  useEffect(() => {
    // Clean up any corrupted project backups with default projects
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('EMERGENCY_PROJECTS_BACKUP');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.projectsData && parsed.projectsData.some(p => p.isDefault)) {
            console.log('🧹 Cleaning corrupted project backup with default projects');
            localStorage.removeItem('EMERGENCY_PROJECTS_BACKUP');
            sessionStorage.removeItem('EMERGENCY_PROJECTS_SESSION');
          }
        }
      } catch (e) {
        console.log('🧹 Cleaning corrupted backup data');
        localStorage.removeItem('EMERGENCY_PROJECTS_BACKUP');
        sessionStorage.removeItem('EMERGENCY_PROJECTS_SESSION');
      }
    }
    
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      // EMERGENCY RECOVERY FIRST - Check for backed up company data
      console.log('🚨 Campaign Builder: Checking for emergency company data...');
      const emergencyCompanyData = await emergencyRecoverCompanyData('default_user');
      if (emergencyCompanyData) {
        console.log('🚨 Campaign Builder: Emergency company data recovered!');
        const mockCompany = {
          user_id: 'default_user',
          companyName: emergencyCompanyData.companyName,
          industry: emergencyCompanyData.industry,
          ...emergencyCompanyData
        };
        setCompanies([mockCompany]);
        // Auto-select the recovered company
        setSelectedCompany(mockCompany);
        return;
      }

      const response = await fetch('/api/company-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list_all'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded companies:', data);
        setCompanies(data.companies || []);
      } else {
        console.error('Failed to load companies:', response.status);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadProjects = async (companyId) => {
    try {
      // First try to recover from backup (only user-created projects)
      const emergencyProjectData = await emergencyRecoverProjectData('default_user');
      if (emergencyProjectData && emergencyProjectData.length > 0) {
        // Filter out any default projects that might be in backup
        const userProjects = emergencyProjectData.filter(project => !project.isDefault);
        if (userProjects.length > 0) {
          console.log('✅ User projects recovered from backup');
          setProjects(userProjects);
          return;
        }
      }

      // Load from API
      const response = await fetch('/api/company-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list',
          company_id: companyId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects || []);
        // Backup loaded projects (only user-created ones)
        if (data.projects && data.projects.length > 0) {
          const userProjects = data.projects.filter(project => !project.isDefault);
          if (userProjects.length > 0) {
            await emergencyBackupProjectData(userProjects, 'default_user');
          }
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    loadProjects(company.user_id);
    setSelectedProject(null);
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
  };

  const handleProjectCreated = async (newProject) => {
    // Refresh projects list
    await loadProjects(selectedCompany.user_id);
    // Close the modal
    setShowProjectManager(false);
    // Optionally auto-select the new project
    setSelectedProject(newProject);
    // Backup the updated projects list
    const updatedProjects = [...projects, newProject];
    await emergencyBackupProjectData(updatedProjects, 'default_user');
  };

  const processStep = async (stepId) => {
    if (!selectedCompany || !selectedProject) {
      alert('Please select a company and project first');
      return;
    }

    setLoading(true);
    
    try {
      const endpoints = {
        1: '/api/ai/strategy-translator',
        2: '/api/ai/media-planner', 
        3: '/api/ai/copy-generator',
        4: '/api/ai/creative-generator',
        5: '/api/ai/campaign-structurer',
        6: '/api/ai/campaign-publisher',
        7: '/api/ai/performance-analyzer'
      };
      
      let requestBody = {
        companyData: selectedCompany,
        projectData: selectedProject,
        previousSteps: stepData,
        connectedAIs: connectedAIs,
        userId: 'default_user'
      };

      // For media planner (step 2), send strategy data from step 1
      if (stepId === 2 && stepData[1] && stepData[1].result) {
        requestBody.strategy = stepData[1].result;
        requestBody.companyProfile = selectedCompany;
      }

      const response = await fetch(endpoints[stepId], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store the generated content
        setStepData(prev => ({
          ...prev,
          [stepId]: data.result
        }));
        
        // Open content viewer directly
        setContentViewerData({
          stepId: stepId,
          stepInfo: steps.find(s => s.id === stepId),
          content: data.result,
          prompt: generationPrompts[stepId] || ''
        });
        setShowContentViewer(true);
      } else {
        console.error('API Error Details:', data);
        alert(`Error: ${data.error || 'Generation failed'}\n\nDetails: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.error(`Error processing step ${stepId}:`, error);
      alert(`Network Error: ${error.message}\n\nPlease check:\n- AI connection is active\n- API keys are valid\n- Internet connection`);
    } finally {
      setLoading(false);
    }
  };

  const approveGeneration = () => {
    setStepData(prev => ({
      ...prev,
      [currentStep]: currentGeneration
    }));
    setShowApproval(false);
    setCurrentGeneration(null);
    
    // Auto-advance to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const openContentViewer = (stepId) => {
    const content = stepData[stepId];
    const prompt = generationPrompts[stepId] || '';
    
    setContentViewerData({
      stepId: stepId,
      stepInfo: steps.find(s => s.id === stepId),
      content: content,
      prompt: prompt
    });
    
    // Initialize editing states
    setEditedContent(content);
    setEditedPrompt(prompt);
    setIsEditing(false);
    setIsEditingPrompt(false);
    setShowContentViewer(true);
  };

  const handleContentEdit = (stepId, newContent) => {
    setStepData(prev => ({
      ...prev,
      [stepId]: newContent
    }));
  };

  const handlePromptEdit = (stepId, newPrompt) => {
    setGenerationPrompts(prev => ({
      ...prev,
      [stepId]: newPrompt
    }));
  };

  const regenerateWithPrompt = async (stepId, customPrompt) => {
    setLoading(true);
    setShowContentViewer(false);
    
    try {
      const endpoints = {
        1: '/api/ai/strategy-translator',
        2: '/api/ai/media-planner', 
        3: '/api/ai/copy-generator',
        4: '/api/ai/creative-generator',
        5: '/api/ai/campaign-structurer',
        6: '/api/ai/campaign-publisher',
        7: '/api/ai/performance-analyzer'
      };
      
      const response = await fetch(endpoints[stepId], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyData: selectedCompany,
          projectData: selectedProject,
          previousSteps: stepData,
          connectedAIs: connectedAIs,
          customPrompt: customPrompt
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStepData(prev => ({
          ...prev,
          [stepId]: data.result
        }));
        setGenerationPrompts(prev => ({
          ...prev,
          [stepId]: customPrompt
        }));
        setContentViewerData({
          stepId: stepId,
          stepInfo: steps.find(s => s.id === stepId),
          content: data.result,
          prompt: customPrompt
        });
        setShowContentViewer(true);
      } else {
        alert(`Error: ${data.error || 'Generation failed'}`);
      }
    } catch (error) {
      console.error(`Error regenerating step ${stepId}:`, error);
      alert('Error generating content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const rejectGeneration = () => {
    setShowApproval(false);
    setCurrentGeneration(null);
    // User can try again or modify parameters
  };

  const renderProjectSelection = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Select Company & Project</h2>
        <p className="text-gray-600">Choose the company and project for your campaign</p>
      </div>

      {/* Company Selection */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">1. Select Company</h3>
        {companies.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🏢</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No Company Profiles Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              To create campaigns, you need at least one company profile. 
              Set up your first company profile to get started.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('onboarding');
                  } else {
                    alert('Please go to Company Setup first to create a company profile.');
                  }
                }}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
              >
                Create Company Profile
              </button>
              <p className="text-sm text-gray-500">
                You can also navigate to "Company Setup" in the sidebar
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companies.map(company => (
              <div
                key={company.user_id}
                onClick={() => handleCompanySelect(company)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCompany?.user_id === company.user_id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-semibold">{company.companyName}</h4>
                <p className="text-sm text-gray-600">{company.industry} • {company.geolocation}</p>
                <p className="text-xs text-gray-500 mt-1">Budget: {company.monthlyBudget}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Selection */}
      {selectedCompany && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">2. Select Project</h3>
            <button 
              onClick={() => setShowProjectManager(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
            >
              + New Project
            </button>
          </div>
          
          {projects.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">No projects found for {selectedCompany.companyName}</p>
              <button 
                onClick={() => setShowProjectManager(true)}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => handleProjectSelect(project)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedProject?.id === project.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-semibold">{project.name}</h4>
                  <p className="text-sm text-gray-600">{project.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Audience: {project.targetAudience} • Budget: {project.budget}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Continue Button */}
      {selectedCompany && selectedProject && (
        <div className="text-center">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
          >
            Start Campaign Creation →
          </button>
        </div>
      )}
    </div>
  );

  const renderContentViewer = () => {
    if (!contentViewerData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${contentViewerData.stepInfo.color} p-6 text-white rounded-t-2xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{contentViewerData.stepInfo.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold">Generated Content</h2>
                  <p className="text-sm opacity-90">{contentViewerData.stepInfo.title}</p>
                  {contentViewerData.content && (
                    <p className="text-xs opacity-75 mt-1">
                      {contentViewerData.content.ai_generated 
                        ? `✓ AI Generated with ${contentViewerData.content.ai_service_used || 'AI Service'}`
                        : '⚠️ Fallback Strategy (Connect OpenAI for AI generation)'}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowContentViewer(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Content Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Generated Content</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isEditing ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isEditing ? 'Save Changes' : 'Edit Content'}
                </button>
              </div>
              
              {isEditing ? (
                <textarea
                  value={typeof editedContent === 'string' ? editedContent : JSON.stringify(editedContent, null, 2)}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Edit your content here..."
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                  {contentViewerData.stepId === 1 && editedContent.fullText ? (
                    // Special rendering for strategy step
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Strategy Overview</h4>
                        <p className="text-gray-700 whitespace-pre-line">{editedContent.fullText}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-700">Primary Channel</h5>
                          <p className="text-gray-600">{editedContent.primaryChannel}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700">Expected ROAS</h5>
                          <p className="text-gray-600">{editedContent.expectedROAS}x</p>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Channel Mix</h5>
                        <div className="space-y-1">
                          {Object.entries(editedContent.channelMix || {}).map(([channel, percentage]) => (
                            <div key={channel} className="flex justify-between text-sm">
                              <span>{channel}</span>
                              <span className="font-medium">{percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <details className="cursor-pointer">
                        <summary className="font-medium text-gray-700">View Full JSON Data</summary>
                        <pre className="mt-2 text-xs overflow-x-auto">
                          {JSON.stringify(editedContent, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    // Default rendering for other steps
                    <pre className="whitespace-pre-wrap text-gray-700 text-sm">
                      {typeof editedContent === 'string' ? editedContent : JSON.stringify(editedContent, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Prompt Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Generation Prompt</h3>
                <button
                  onClick={() => setIsEditingPrompt(!isEditingPrompt)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isEditingPrompt ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isEditingPrompt ? 'Save Prompt' : 'Edit Prompt'}
                </button>
              </div>
              
              {isEditingPrompt ? (
                <textarea
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter custom prompt for regeneration..."
                />
              ) : (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    {editedPrompt || 'Default AI prompt was used for this generation.'}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  if (isEditing) {
                    handleContentEdit(contentViewerData.stepId, editedContent);
                    setIsEditing(false);
                  }
                  if (isEditingPrompt) {
                    handlePromptEdit(contentViewerData.stepId, editedPrompt);
                    setIsEditingPrompt(false);
                  }
                  setShowContentViewer(false);
                  
                  // Auto-advance to next step after approval
                  const nextStep = contentViewerData.stepId + 1;
                  if (nextStep <= 7) {
                    setCurrentStep(nextStep);
                  }
                }}
                className="bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                ✓ Approve & Continue
              </button>
              
              <button
                onClick={() => regenerateWithPrompt(contentViewerData.stepId, editedPrompt)}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                🔄 Regenerate
              </button>
              
              <button
                onClick={() => regenerateWithPrompt(contentViewerData.stepId, '')}
                disabled={loading}
                className="bg-purple-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-600 disabled:opacity-50 transition-colors"
              >
                ✨ Generate Again
              </button>
              
              <button
                onClick={() => setShowContentViewer(false)}
                className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderApprovalScreen = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className={`bg-gradient-to-r ${steps[currentStep].color} p-6 text-white rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{steps[currentStep].icon}</span>
              <div>
                <h2 className="text-2xl font-bold">Review & Approve</h2>
                <p className="text-sm opacity-90">{steps[currentStep].title}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Generated Content:</h3>
            <div className="whitespace-pre-wrap text-gray-700">
              {typeof currentGeneration === 'string' 
                ? currentGeneration 
                : JSON.stringify(currentGeneration, null, 2)
              }
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={approveGeneration}
              className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600"
            >
              ✓ Approve & Continue
            </button>
            <button
              onClick={rejectGeneration}
              className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50"
            >
              ✗ Regenerate
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderStepContent = (step) => {
    const isCompleted = !!stepData[step.id];
    const isCurrent = currentStep === step.id;
    const isLoading = loading && isCurrent;

    if (step.id === 0) return null; // Skip project selection in main steps

    return (
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 mb-6 ${
          isCurrent 
            ? 'border-blue-500 shadow-xl' 
            : isCompleted 
              ? 'border-green-500' 
              : 'border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${step.color} p-6 text-white rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{step.icon}</div>
              <div>
                <h3 className="text-xl font-bold">Step {step.id}: {step.title}</h3>
                <p className="text-sm opacity-90">{step.description}</p>
              </div>
            </div>
            
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
              isCompleted 
                ? 'bg-green-500' 
                : isCurrent 
                  ? 'bg-yellow-500' 
                  : 'bg-white bg-opacity-20'
            }`}>
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isCompleted ? (
                '✓'
              ) : (
                step.id
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isCompleted ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
                <span className="text-green-700 font-medium">Step completed and approved</span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Generated Results Preview:</h4>
                <div className="text-sm text-gray-600 max-h-20 overflow-hidden">
                  {typeof stepData[step.id] === 'string' ? (
                    <p className="truncate">{stepData[step.id].substring(0, 150)}...</p>
                  ) : (
                    <p className="truncate">Generated content available (Object/JSON format)</p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => openContentViewer(step.id)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                >
                  📖 Open Results
                </button>
                <button
                  onClick={() => processStep(step.id)}
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-sm"
                >
                  🔄 Regenerate
                </button>
              </div>
            </div>
          ) : isCurrent ? (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">Ready to generate {step.title.toLowerCase()} with AI</p>
              <button
                onClick={() => processStep(step.id)}
                disabled={connectedAIs.length === 0 || loading}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {connectedAIs.length === 0 ? 'Connect AI Services First' : `Generate ${step.title}`}
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400">Complete previous steps to unlock</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {currentStep === 0 ? (
        renderProjectSelection()
      ) : (
        <>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Campaign Builder
            </h1>
            <p className="text-xl text-gray-600">
              Creating campaign for <strong>{selectedCompany?.companyName}</strong> → <strong>{selectedProject?.name}</strong>
            </p>
            
            {/* Progress Bar */}
            <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Campaign Progress</span>
                <span className="text-sm text-gray-500">
                  {Object.keys(stepData).length} of 7 steps completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(Object.keys(stepData).length / 7) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Campaign Steps */}
          <div className="space-y-6">
            {steps.slice(1).map((step) => renderStepContent(step))}
          </div>

          {/* Back to Project Selection */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setCurrentStep(0)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              ← Back to Project Selection
            </button>
          </div>
        </>
      )}

      {/* Approval Modal */}
      <AnimatePresence>
        {showApproval && renderApprovalScreen()}
      </AnimatePresence>

      {/* Content Viewer Modal */}
      <AnimatePresence>
        {showContentViewer && renderContentViewer()}
      </AnimatePresence>

      {/* Project Manager Modal */}
      {showProjectManager && selectedCompany && (
        <ProjectManager
          company={selectedCompany}
          onClose={() => setShowProjectManager(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default ModernCampaignBuilder;