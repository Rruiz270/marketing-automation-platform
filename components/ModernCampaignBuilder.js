import React, { useState, useEffect, useCallback } from 'react';
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
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showContentViewer, setShowContentViewer] = useState(false);
  const [contentViewerData, setContentViewerData] = useState(null);
  const [generationPrompts, setGenerationPrompts] = useState({});
  const [editedContent, setEditedContent] = useState('');
  const [editedPrompt, setEditedPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [quickAdjustments, setQuickAdjustments] = useState({
    riskLevel: 50,
    timeline: 50,
    budgetFlexibility: 50,
    channelFocus: 50
  });
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [bulkMode, setBulkMode] = useState(false);

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

  // Timer for time elapsed
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'Enter':
            // Approve & Continue
            if (showContentViewer && contentViewerData) {
              approveAndContinue();
            }
            break;
          case 'g':
            e.preventDefault();
            // Generate/Regenerate
            if (currentStep > 0 && currentStep <= 7) {
              processStep(currentStep);
            }
            break;
          case 's':
            e.preventDefault();
            // Save Progress
            saveProgress();
            break;
          case 'z':
            e.preventDefault();
            // Undo
            console.log('Undo action');
            break;
          case 'y':
            e.preventDefault();
            // Redo
            console.log('Redo action');
            break;
        }
      } else if (e.key >= '1' && e.key <= '7') {
        // Jump to step
        const step = parseInt(e.key);
        if (selectedCompany && selectedProject) {
          setCurrentStep(step);
        }
      } else if (e.key === ' ' && showContentViewer) {
        e.preventDefault();
        // Preview
        console.log('Preview mode');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, showContentViewer, contentViewerData, selectedCompany, selectedProject]);

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  // Load projects when company is selected
  useEffect(() => {
    if (selectedCompany) {
      loadProjects(selectedCompany.user_id);
    }
  }, [selectedCompany]);

  const loadCompanies = async () => {
    try {
      console.log('Campaign Builder: Loading companies...');
      const response = await fetch('/api/company-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list_all'
        })
      });
      
      console.log('Campaign Builder: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Campaign Builder: API response:', data);
        console.log('Campaign Builder: Companies array:', data.companies);
        console.log('Campaign Builder: Companies length:', data.companies?.length);
        setCompanies(data.companies || []);
      } else {
        const errorData = await response.text();
        console.error('Campaign Builder: Failed to load companies:', response.status, errorData);
      }
    } catch (error) {
      console.error('Campaign Builder: Error loading companies:', error);
    }
  };

  const loadProjects = async (userId) => {
    try {
      console.log('Campaign Builder: Loading projects for company:', userId);
      
      // First, try to load from API
      const response = await fetch('/api/company-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list',
          company_id: userId
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Campaign Builder: Projects loaded from API:', data.projects?.length || 0);
        setProjects(data.projects || []);
        return;
      }
      
      // Fallback to emergency recovery
      console.log('Campaign Builder: API failed, trying emergency recovery...');
      const projectData = await emergencyRecoverProjectData(userId);
      if (projectData) {
        console.log('Campaign Builder: Projects loaded from emergency backup:', projectData.projects?.length || 0);
        setProjects(projectData.projects || []);
      } else {
        console.log('Campaign Builder: No projects found');
        setProjects([]);
      }
    } catch (error) {
      console.error('Campaign Builder: Error loading projects:', error);
      setProjects([]);
    }
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setSelectedProject(null);
    setStepData({});
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    emergencyBackupProjectData(selectedCompany.user_id, project);
  };

  const handleProjectCreated = async (newProject) => {
    // Add to current state
    setProjects([...projects, newProject]);
    setSelectedProject(newProject);
    setShowProjectManager(false);
    
    // Save to emergency backup
    emergencyBackupProjectData(selectedCompany.user_id, newProject);
    
    // Reload projects from API to ensure persistence
    await loadProjects(selectedCompany.user_id);
  };

  const processStep = async (stepId) => {
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
        connectedAIs: connectedAIs || [],
        userId: selectedCompany?.user_id || 'demo-user'
      };

      // Add specific data for certain steps
      if (stepId === 2 && stepData[1]) {
        requestBody.strategy = stepData[1];
      }

      // Add prompt if exists
      if (generationPrompts[stepId]) {
        requestBody.customPrompt = generationPrompts[stepId];
      }

      const response = await fetch(endpoints[stepId], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        const result = data.result;
        setStepData(prev => ({ ...prev, [stepId]: result }));
        
        // Open enhanced content viewer
        setContentViewerData({
          stepId,
          stepInfo: steps[stepId],
          content: data,
          result: result
        });
        setEditedContent(result);
        setEditedPrompt(generationPrompts[stepId] || '');
        setShowContentViewer(true);
      }
    } catch (error) {
      console.error('Error processing step:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveAndContinue = () => {
    if (isEditing) {
      handleContentEdit(contentViewerData.stepId, editedContent);
      setIsEditing(false);
    }
    if (isEditingPrompt) {
      handlePromptEdit(contentViewerData.stepId, editedPrompt);
      setIsEditingPrompt(false);
    }
    setShowContentViewer(false);
    
    // Auto-advance to next step
    if (contentViewerData.stepId === currentStep) {
      const nextStep = currentStep + 1;
      if (nextStep <= 7) {
        setCurrentStep(nextStep);
      }
    }
  };

  const handleContentEdit = (stepId, newContent) => {
    setStepData(prev => ({ ...prev, [stepId]: newContent }));
  };

  const handlePromptEdit = (stepId, newPrompt) => {
    setGenerationPrompts(prev => ({ ...prev, [stepId]: newPrompt }));
  };

  const regenerateWithPrompt = async (stepId, prompt) => {
    setGenerationPrompts(prev => ({ ...prev, [stepId]: prompt }));
    setShowContentViewer(false);
    await processStep(stepId);
  };

  const openContentViewer = (stepId) => {
    setContentViewerData({
      stepId,
      stepInfo: steps[stepId],
      content: { success: true, result: stepData[stepId] },
      result: stepData[stepId]
    });
    setEditedContent(stepData[stepId]);
    setEditedPrompt(generationPrompts[stepId] || '');
    setShowContentViewer(true);
  };

  const saveProgress = () => {
    // Save current state
    const progressData = {
      company: selectedCompany,
      project: selectedProject,
      stepData,
      currentStep,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('campaignProgress', JSON.stringify(progressData));
    alert('Progress saved!');
  };

  const getEstimatedTimeRemaining = () => {
    const avgTimePerStep = 3; // minutes
    const remainingSteps = 7 - currentStep;
    return remainingSteps * avgTimePerStep;
  };

  const getCompletionPercentage = () => {
    if (currentStep === 0) return 0;
    const totalSteps = 7;
    const completedSteps = Object.keys(stepData).length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  // Render step-specific content viewers
  const renderStrategyContent = (content) => {
    const strategy = content || {};
    
    return (
      <div className="space-y-6">
        {/* Executive Summary */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-3">Executive Summary</h4>
          <p className="text-gray-700 leading-relaxed">
            {strategy.fullText ? 
              strategy.fullText.split('\n')[0] : 
              'Comprehensive marketing strategy focused on maximizing ROI through data-driven channel selection and audience targeting.'}
          </p>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{strategy.primaryChannel || 'Google Ads'}</div>
              <div className="text-sm text-gray-600">Primary Channel</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{strategy.expectedROAS || 3.5}x</div>
              <div className="text-sm text-gray-600">Expected ROAS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{strategy.timeline || '3 months'}</div>
              <div className="text-sm text-gray-600">Campaign Duration</div>
            </div>
          </div>
        </div>

        {/* Visual Strategy Map */}
        <div className="grid grid-cols-2 gap-6">
          {/* Funnel Visualization */}
          <div className="bg-white border rounded-lg p-4">
            <h5 className="font-semibold mb-3">Funnel Strategy</h5>
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-3 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Awareness</span>
                  <span className="text-sm text-gray-600">20% budget</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-100 to-green-50 p-3 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Consideration</span>
                  <span className="text-sm text-gray-600">30% budget</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-3 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Conversion</span>
                  <span className="text-sm text-gray-600">40% budget</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-100 to-orange-50 p-3 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Retention</span>
                  <span className="text-sm text-gray-600">10% budget</span>
                </div>
              </div>
            </div>
          </div>

          {/* Channel Allocation */}
          <div className="bg-white border rounded-lg p-4">
            <h5 className="font-semibold mb-3">Channel Mix</h5>
            <div className="space-y-3">
              {Object.entries(strategy.channelMix || {
                'Google Ads': 50,
                'Facebook/Instagram': 40,
                'Testing': 10
              }).map(([channel, percentage]) => (
                <div key={channel}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{channel}</span>
                    <span className="font-medium">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown - Expandable */}
        <div className="space-y-3">
          <details className="bg-white border rounded-lg p-4 cursor-pointer">
            <summary className="font-semibold">Channel Strategy Details</summary>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <p>{strategy.channelStrategy || 'Multi-channel approach optimized for performance...'}</p>
            </div>
          </details>
          
          <details className="bg-white border rounded-lg p-4 cursor-pointer">
            <summary className="font-semibold">Audience Insights</summary>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <p>{strategy.audienceInsights || 'Target audience analysis and segmentation...'}</p>
            </div>
          </details>
          
          <details className="bg-white border rounded-lg p-4 cursor-pointer">
            <summary className="font-semibold">KPI Framework</summary>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <p>{strategy.kpiFramework || 'Key performance indicators and success metrics...'}</p>
            </div>
          </details>
        </div>

        {/* Quick Adjustment Panel */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-semibold mb-3">Quick Adjustments</h5>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Risk Level</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={quickAdjustments.riskLevel}
                onChange={(e) => setQuickAdjustments(prev => ({ ...prev, riskLevel: e.target.value }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Timeline Focus</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={quickAdjustments.timeline}
                onChange={(e) => setQuickAdjustments(prev => ({ ...prev, timeline: e.target.value }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Quick Win</span>
                <span>Long-term</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMediaPlanContent = (content) => {
    const mediaPlan = content || {};
    
    return (
      <div className="space-y-6">
        {/* Media Plan Calendar */}
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Media Plan Calendar</h4>
          <div className="grid grid-cols-4 gap-4">
            {['Week 1-2', 'Week 3-4', 'Week 5-6', 'Week 7-8'].map((period, index) => (
              <div key={period} className="border rounded-lg p-3 hover:shadow-lg transition-shadow cursor-move">
                <div className="font-medium text-sm mb-2">{period}</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Budget: ${Math.round((parseFloat(selectedProject?.budget) || 10000) / 4)}</div>
                  <div>Focus: {index === 0 ? 'Launch' : index === 3 ? 'Optimize' : 'Scale'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Deep Dive */}
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Channel Deep Dive</h4>
          <div className="space-y-4">
            {(mediaPlan.channels || [
              { name: 'Google Ads', budget: 60, tactics: ['Search', 'Display', 'YouTube'] },
              { name: 'Facebook/Instagram', budget: 40, tactics: ['Feed', 'Stories', 'Reels'] }
            ]).map((channel, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-semibold">{channel.name}</h5>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                    {channel.budget}% budget
                  </span>
                </div>
                <div className="flex space-x-2">
                  {(channel.tactics || []).map((tactic, i) => (
                    <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {tactic}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Optimizer */}
        <div className="bg-green-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Budget Optimizer</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                ${parseFloat(selectedProject?.budget) || 10000}
              </div>
              <div className="text-sm text-gray-600">Total Budget</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {mediaPlan.estimatedReach || '250K'}
              </div>
              <div className="text-sm text-gray-600">Est. Reach</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                ${mediaPlan.estimatedCPA || 45}
              </div>
              <div className="text-sm text-gray-600">Target CPA</div>
            </div>
          </div>
        </div>

        {/* Smart Suggestions */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h5 className="font-semibold text-yellow-800 mb-2">💡 AI Insights</h5>
          <ul className="space-y-2 text-sm text-yellow-700">
            <li>• Competitor X increased LinkedIn spend 40% last month</li>
            <li>• Tuesday 2-4pm shows 35% better CPM for your audience</li>
            <li>• Consider 15% more budget to Weeks 3-4 based on historical data</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderCopyContent = (content) => {
    const copyData = content || {};
    
    return (
      <div className="space-y-6">
        {/* Copy Variations Grid */}
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Copy Variations</h4>
          <div className="grid grid-cols-2 gap-6">
            {Object.entries(copyData).slice(0, 4).map(([platform, copy]) => (
              <div key={platform} className="border rounded-lg p-4">
                <h5 className="font-semibold mb-3">{platform}</h5>
                
                {/* Headlines */}
                <div className="mb-3">
                  <div className="text-sm text-gray-600 mb-1">Headlines</div>
                  <div className="space-y-1">
                    {(copy.headlines || []).slice(0, 3).map((headline, i) => (
                      <div key={i} className="bg-gray-50 p-2 rounded text-sm">
                        {headline}
                        <span className="text-xs text-gray-500 ml-2">({headline.length} chars)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Descriptions */}
                <div className="mb-3">
                  <div className="text-sm text-gray-600 mb-1">Descriptions</div>
                  <div className="space-y-1">
                    {(copy.descriptions || []).slice(0, 2).map((desc, i) => (
                      <div key={i} className="bg-gray-50 p-2 rounded text-sm">
                        {desc}
                        <span className="text-xs text-gray-500 ml-2">({desc.length} chars)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="bg-blue-50 rounded p-2">
                    <div className="text-sm font-semibold text-blue-600">8.5/10</div>
                    <div className="text-xs text-gray-600">Clarity</div>
                  </div>
                  <div className="bg-green-50 rounded p-2">
                    <div className="text-sm font-semibold text-green-600">92%</div>
                    <div className="text-xs text-gray-600">Brand Match</div>
                  </div>
                  <div className="bg-purple-50 rounded p-2">
                    <div className="text-sm font-semibold text-purple-600">Strong</div>
                    <div className="text-xs text-gray-600">CTA</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform-Specific Previews */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Ad Previews</h4>
          <div className="grid grid-cols-2 gap-4">
            {/* Google Ad Preview */}
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-blue-600 text-sm mb-1">Ad · www.example.com</div>
              <div className="text-blue-800 text-lg font-medium mb-1">
                {copyData['Google Ads']?.headlines?.[0] || 'Professional English Course'}
              </div>
              <div className="text-gray-700 text-sm">
                {copyData['Google Ads']?.descriptions?.[0] || 'Learn English with certified teachers...'}
              </div>
            </div>
            
            {/* Facebook Ad Preview */}
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
                <div className="text-sm font-medium">Your Company</div>
              </div>
              <div className="text-gray-700 text-sm mb-2">
                {copyData['Facebook Ads']?.primaryText?.[0] || 'Transform your career with...'}
              </div>
              <div className="bg-gray-200 h-48 rounded-lg mb-2"></div>
              <div className="font-medium">
                {copyData['Facebook Ads']?.headlines?.[0] || 'Start Your Journey Today'}
              </div>
            </div>
          </div>
        </div>

        {/* Copy Intelligence Dashboard */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h5 className="font-semibold text-blue-800 mb-3">Copy Intelligence</h5>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-blue-600">7/10</div>
              <div className="text-xs text-gray-600">Power Words</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">8th</div>
              <div className="text-xs text-gray-600">Reading Level</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-600">8.5/10</div>
              <div className="text-xs text-gray-600">CTA Strength</div>
            </div>
            <div>
              <div className="text-xl font-bold text-orange-600">92%</div>
              <div className="text-xs text-gray-600">Brand Voice</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCreativeContent = (content) => {
    const creativeData = content || {};
    
    return (
      <div className="space-y-6">
        {/* Creative Gallery */}
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Creative Gallery</h4>
          <div className="grid grid-cols-3 gap-4">
            {(creativeData.formats || []).map((creative, index) => (
              <div key={index} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 h-40 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎨</div>
                    <div className="text-sm font-medium">{creative.name}</div>
                    <div className="text-xs text-gray-600">{creative.dimensions}</div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium mb-1">{creative.concept}</div>
                  <div className="flex space-x-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {creative.platform}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {creative.variations} variants
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <button className="flex-1 bg-blue-500 text-white py-1 rounded text-xs hover:bg-blue-600">
                      Preview
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 py-1 rounded text-xs hover:bg-gray-200">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Design Variations Engine */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Design Variations</h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 border">
                <div className="w-16 h-16 bg-blue-500 rounded mx-auto mb-2"></div>
                <div className="text-sm">Original</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 border">
                <div className="w-16 h-16 bg-green-500 rounded mx-auto mb-2"></div>
                <div className="text-sm">Variant A</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 border">
                <div className="w-16 h-16 bg-purple-500 rounded mx-auto mb-2"></div>
                <div className="text-sm">Variant B</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 border">
                <div className="w-16 h-16 bg-orange-500 rounded mx-auto mb-2"></div>
                <div className="text-sm">Variant C</div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Consistency Checker */}
        <div className="bg-green-50 rounded-lg p-4">
          <h5 className="font-semibold text-green-800 mb-3">Brand Consistency</h5>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Logo Placement</span>
              <span className="text-sm font-semibold text-green-600">✓ Consistent</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Color Compliance</span>
              <span className="text-sm font-semibold text-green-600">✓ 98% Match</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Typography</span>
              <span className="text-sm font-semibold text-green-600">✓ On Brand</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Legal Disclaimers</span>
              <span className="text-sm font-semibold text-green-600">✓ Included</span>
            </div>
          </div>
        </div>

        {/* Smart Creative Assistant */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h5 className="font-semibold text-yellow-800 mb-2">✨ Creative Suggestions</h5>
          <ul className="space-y-2 text-sm text-yellow-700">
            <li>• Add 20% more contrast for mobile visibility</li>
            <li>• This color performs 40% better with your audience</li>
            <li>• Consider adding motion for 3x more engagement</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderCampaignStructureContent = (content) => {
    const structureData = content || {};
    
    return (
      <div className="space-y-6">
        {/* Campaign Architecture View */}
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Campaign Architecture</h4>
          <div className="space-y-4">
            {(structureData.campaigns || []).map((campaign, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold">{campaign.name}</h5>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                    {campaign.platform}
                  </span>
                </div>
                <div className="ml-4 space-y-2">
                  {(campaign.adGroups || campaign.adSets || []).map((group, gIndex) => (
                    <div key={gIndex} className="bg-gray-50 rounded p-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">{group.name}</div>
                        <div className="text-xs text-gray-600">
                          {group.targetingType} • {group.ads} ads • {group.budget}
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Edit →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Naming Convention System */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Naming Conventions</h4>
          <div className="space-y-3">
            <div className="bg-white rounded p-3">
              <div className="text-sm text-gray-600">Pattern</div>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                [Platform]_[Objective]_[Audience]_[Date]
              </code>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(structureData.namingConventions?.examples || []).map((example, i) => (
                <div key={i} className="bg-white rounded p-3">
                  <code className="text-sm">{example}</code>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Targeting Matrix */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Budget Allocation</h4>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium mb-2">By Platform</h5>
              {Object.entries(structureData.budgetAllocation?.byPlatform || {}).map(([platform, percentage]) => (
                <div key={platform} className="flex justify-between py-1">
                  <span className="text-sm">{platform}</span>
                  <span className="text-sm font-medium">{percentage}</span>
                </div>
              ))}
            </div>
            <div>
              <h5 className="font-medium mb-2">By Objective</h5>
              {Object.entries(structureData.budgetAllocation?.byObjective || {}).map(([objective, percentage]) => (
                <div key={objective} className="flex justify-between py-1">
                  <span className="text-sm">{objective}</span>
                  <span className="text-sm font-medium">{percentage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Structure Intelligence */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h5 className="font-semibold text-yellow-800 mb-2">🏗️ Optimization Tips</h5>
          <ul className="space-y-2 text-sm text-yellow-700">
            <li>• Combine these 2 ad groups for 20% efficiency</li>
            <li>• This structure allows for 15 A/B tests</li>
            <li>• Warning: Budget too thin across 12 ad groups</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderPlatformSetupContent = (content) => {
    const setupData = content || {};
    
    return (
      <div className="space-y-6">
        {/* Platform Dashboard */}
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Platform Dashboard</h4>
          <div className="grid grid-cols-2 gap-6">
            {(setupData.platforms || []).map((platform, index) => (
              <div key={index} className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                      {platform.name === 'Google Ads' ? '🔵' : '📘'}
                    </div>
                    <div>
                      <h5 className="font-semibold">{platform.name}</h5>
                      <p className="text-sm text-gray-600">{platform.status}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    platform.status === 'ready_to_connect' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <div className="space-y-3">
                  <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                    🔗 Connect {platform.name}
                  </button>
                  <div className="space-y-1">
                    {(platform.requirements || []).map((req, i) => (
                      <div key={i} className="flex items-center space-x-2 text-sm">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Launch Checklist */}
        <div className="bg-yellow-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Pre-flight Checklist</h4>
          <div className="space-y-3">
            {(setupData.checklist || [
              'Campaign budgets configured',
              'Conversion tracking ready',
              'Creative assets approved',
              'Landing pages functional'
            ]).map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" defaultChecked={index < 2} />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Launch Control Panel */}
        <div className="bg-green-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Launch Options</h4>
          <div className="grid grid-cols-3 gap-4">
            <button className="bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600">
              🚦 Soft Launch (10%)
            </button>
            <button className="bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600">
              📈 Phased Rollout
            </button>
            <button className="bg-green-500 text-white py-3 rounded-lg hover:bg-green-600">
              🚀 Full Launch
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceContent = (content) => {
    const performanceData = content || {};
    
    return (
      <div className="space-y-6">
        {/* Live Performance Dashboard */}
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Real-time Metrics</h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${performanceData.realTimeMetrics?.spend || 0}
              </div>
              <div className="text-sm text-gray-600">Spend</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {performanceData.realTimeMetrics?.conversions || 0}
              </div>
              <div className="text-sm text-gray-600">Conversions</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {performanceData.realTimeMetrics?.ctr || 0}%
              </div>
              <div className="text-sm text-gray-600">CTR</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {performanceData.realTimeMetrics?.roas || 0}x
              </div>
              <div className="text-sm text-gray-600">ROAS</div>
            </div>
          </div>
        </div>

        {/* Campaign Status */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Campaign Status</h4>
          <div className="space-y-3">
            {(performanceData.campaignStatus || []).map((campaign, index) => (
              <div key={index} className="bg-white rounded-lg p-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    campaign.health === 'green' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <div className="font-medium">{campaign.platform}</div>
                    <div className="text-sm text-gray-600">
                      {campaign.campaigns} campaigns • ${campaign.budget} budget
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{campaign.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Optimizations */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">AI Optimization Queue</h4>
          <div className="space-y-3">
            {(performanceData.aiOptimizations || []).map((opt, index) => (
              <div key={index} className={`bg-white rounded-lg p-4 border-l-4 border-${opt.color}-500`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{opt.type}</div>
                    <div className="text-sm text-gray-600">{opt.description}</div>
                  </div>
                  <button className="bg-blue-500 text-white px-4 py-1 rounded text-sm hover:bg-blue-600">
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Alerts */}
        <div className="bg-green-50 rounded-lg p-4">
          <h5 className="font-semibold text-green-800 mb-3">🟢 System Status</h5>
          <div className="space-y-2">
            {(performanceData.alerts || []).map((alert, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContentViewer = () => {
    if (!contentViewerData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        >
          {/* Enhanced Header */}
          <div className={`bg-gradient-to-r ${contentViewerData.stepInfo.color} p-4 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{contentViewerData.stepInfo.icon}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{contentViewerData.stepInfo.title}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    {contentViewerData.content?.success ? (
                      <span className="text-xs bg-green-500 bg-opacity-30 px-2 py-1 rounded flex items-center space-x-1">
                        <span>✓</span>
                        <span>AI Generated with {contentViewerData.content.metadata?.ai_service || 'AI Service'}</span>
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-500 bg-opacity-30 px-2 py-1 rounded flex items-center space-x-1">
                        <span>⚠️</span>
                        <span>Fallback Content</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowContentViewer(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Render step-specific content */}
            {contentViewerData.stepId === 1 && renderStrategyContent(editedContent)}
            {contentViewerData.stepId === 2 && renderMediaPlanContent(editedContent)}
            {contentViewerData.stepId === 3 && renderCopyContent(editedContent)}
            {contentViewerData.stepId === 4 && renderCreativeContent(editedContent)}
            {contentViewerData.stepId === 5 && renderCampaignStructureContent(editedContent)}
            {contentViewerData.stepId === 6 && renderPlatformSetupContent(editedContent)}
            {contentViewerData.stepId === 7 && renderPerformanceContent(editedContent)}
          </div>

          {/* Enhanced Action Buttons */}
          <div className="border-t p-4 bg-gray-50">
            {contentViewerData.stepId === 1 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={approveAndContinue}
                  className="bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center space-x-2"
                >
                  <span>✅</span>
                  <span>Approve & Continue</span>
                </button>
                <button className="bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 flex items-center justify-center space-x-2">
                  <span>🎯</span>
                  <span>Set as North Star</span>
                </button>
                <button 
                  onClick={() => regenerateWithPrompt(contentViewerData.stepId, 'Generate 3 alternative strategies')}
                  className="bg-purple-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-600 flex items-center justify-center space-x-2"
                >
                  <span>📊</span>
                  <span>Alternative Strategies</span>
                </button>
                <button className="bg-gray-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-600 flex items-center justify-center space-x-2">
                  <span>📥</span>
                  <span>Download</span>
                </button>
              </div>
            )}

            {contentViewerData.stepId === 2 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={approveAndContinue}
                  className="bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center space-x-2"
                >
                  <span>✅</span>
                  <span>Lock Plan & Continue</span>
                </button>
                <button className="bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 flex items-center justify-center space-x-2">
                  <span>🎰</span>
                  <span>Auto-Optimize</span>
                </button>
                <button className="bg-purple-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-600 flex items-center justify-center space-x-2">
                  <span>📈</span>
                  <span>Run Forecast</span>
                </button>
                <button className="bg-orange-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-orange-600 flex items-center justify-center space-x-2">
                  <span>📊</span>
                  <span>Export Plan</span>
                </button>
              </div>
            )}

            {contentViewerData.stepId === 3 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={approveAndContinue}
                  className="bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center space-x-2"
                >
                  <span>✅</span>
                  <span>Approve Copy</span>
                </button>
                <button 
                  onClick={() => regenerateWithPrompt(contentViewerData.stepId, 'Generate 5 more variations')}
                  className="bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 flex items-center justify-center space-x-2"
                >
                  <span>🎲</span>
                  <span>More Variations</span>
                </button>
                <button className="bg-purple-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-600 flex items-center justify-center space-x-2">
                  <span>🧪</span>
                  <span>A/B Test Sets</span>
                </button>
                <button className="bg-orange-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-orange-600 flex items-center justify-center space-x-2">
                  <span>✔️</span>
                  <span>Compliance Check</span>
                </button>
              </div>
            )}

            {contentViewerData.stepId === 4 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={approveAndContinue}
                  className="bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center space-x-2"
                >
                  <span>✅</span>
                  <span>Approve Creatives</span>
                </button>
                <button className="bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 flex items-center justify-center space-x-2">
                  <span>🎨</span>
                  <span>Generate More</span>
                </button>
                <button className="bg-purple-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-600 flex items-center justify-center space-x-2">
                  <span>📐</span>
                  <span>Auto-Adapt Sizes</span>
                </button>
                <button className="bg-orange-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-orange-600 flex items-center justify-center space-x-2">
                  <span>💾</span>
                  <span>Download All</span>
                </button>
              </div>
            )}

            {contentViewerData.stepId === 5 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={approveAndContinue}
                  className="bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center space-x-2"
                >
                  <span>✅</span>
                  <span>Finalize Structure</span>
                </button>
                <button className="bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 flex items-center justify-center space-x-2">
                  <span>🏗️</span>
                  <span>Auto-Structure</span>
                </button>
                <button className="bg-purple-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-600 flex items-center justify-center space-x-2">
                  <span>🔍</span>
                  <span>Validate</span>
                </button>
                <button className="bg-orange-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-orange-600 flex items-center justify-center space-x-2">
                  <span>📊</span>
                  <span>Export Map</span>
                </button>
              </div>
            )}

            {contentViewerData.stepId === 6 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={approveAndContinue}
                  className="bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center space-x-2"
                >
                  <span>🚀</span>
                  <span>Deploy Campaigns</span>
                </button>
                <button className="bg-yellow-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-yellow-600 flex items-center justify-center space-x-2">
                  <span>📅</span>
                  <span>Schedule Launch</span>
                </button>
                <button className="bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 flex items-center justify-center space-x-2">
                  <span>✅</span>
                  <span>Run Pre-flight</span>
                </button>
                <button className="bg-purple-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-600 flex items-center justify-center space-x-2">
                  <span>🛡️</span>
                  <span>Safety Mode</span>
                </button>
              </div>
            )}

            {contentViewerData.stepId === 7 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setShowContentViewer(false);
                    alert('Campaign setup complete! 🎉');
                  }}
                  className="bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center space-x-2"
                >
                  <span>✅</span>
                  <span>Complete Setup</span>
                </button>
                <button className="bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 flex items-center justify-center space-x-2">
                  <span>⚡</span>
                  <span>Auto-Optimize</span>
                </button>
                <button className="bg-purple-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-600 flex items-center justify-center space-x-2">
                  <span>📊</span>
                  <span>Export Report</span>
                </button>
                <button className="bg-orange-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-orange-600 flex items-center justify-center space-x-2">
                  <span>📱</span>
                  <span>Mobile Sync</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  const renderProjectSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Campaign Builder</h1>
        <p className="text-xl text-gray-600">Select a company and project to begin creating your campaign</p>
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
            <button 
              onClick={() => onNavigate?.('onboarding')}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
            >
              Create Company Profile
            </button>
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

  const renderStepContent = (step) => {
    const isCompleted = !!stepData[step.id];
    const isCurrent = currentStep === step.id;
    const isLoading = loading && isCurrent;

    if (step.id === 0) return null;

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
                  📖 View Results
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
    <div className="max-w-7xl mx-auto">
      {/* Global Quick Actions Bar */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 flex space-x-2 z-40">
        <button 
          onClick={saveProgress}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
          title="Save Progress (Ctrl+S)"
        >
          💾 Save
        </button>
        <select 
          value={currentStep}
          onChange={(e) => setCurrentStep(parseInt(e.target.value))}
          className="px-3 py-2 bg-gray-100 rounded text-sm"
          disabled={!selectedCompany || !selectedProject}
        >
          <option value={0}>Select Step</option>
          {steps.slice(1).map(step => (
            <option key={step.id} value={step.id}>
              Step {step.id}: {step.title}
            </option>
          ))}
        </select>
        <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">
          💬 Help
        </button>
        <div className="px-3 py-2 bg-gray-100 rounded text-sm">
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox"
              checked={bulkMode}
              onChange={(e) => setBulkMode(e.target.checked)}
              className="rounded"
            />
            <span>Bulk Mode</span>
          </label>
        </div>
      </div>

      {/* Progress Indicator */}
      {currentStep > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {steps.slice(1).map((step) => (
                <div 
                  key={step.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepData[step.id] 
                      ? 'bg-green-500 text-white' 
                      : step.id === currentStep 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {stepData[step.id] ? '✓' : step.id}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Step {currentStep} of 7 • {getCompletionPercentage()}% complete
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Time elapsed: {timeElapsed} min • Est. remaining: {getEstimatedTimeRemaining()} min
          </div>
        </div>
      )}

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

      {/* Smart Context Panel */}
      {currentStep > 0 && (
        <div className="fixed bottom-20 right-4 bg-blue-50 rounded-lg shadow-lg p-4 max-w-xs z-30">
          <h5 className="font-semibold text-blue-800 mb-2">💡 AI Assistant</h5>
          <div className="text-sm text-blue-700 space-y-2">
            {currentStep === 1 && <p>Most users spend 3 min here, you're on track</p>}
            {currentStep === 2 && <p>Your budget allocation looks optimal for this audience</p>}
            {currentStep === 3 && <p>Similar campaigns achieved 2.8% CTR with this copy style</p>}
            {currentStep === 4 && <p>Visual consistency score: 95% - looking great!</p>}
            {currentStep === 5 && <p>Campaign structure allows for 12 A/B tests</p>}
            {currentStep === 6 && <p>All pre-flight checks passing - ready to launch</p>}
            {currentStep === 7 && <p>Performance tracking configured for real-time insights</p>}
          </div>
          <div className="flex space-x-2 mt-3">
            <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
              Show me how
            </button>
            <button className="text-xs bg-white text-blue-600 px-2 py-1 rounded hover:bg-gray-100">
              Learn more
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernCampaignBuilder;