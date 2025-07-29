import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CampaignWizard = ({ connectedAIs }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stepData, setStepData] = useState({});
  const [companyData, setCompanyData] = useState(null);

  const steps = [
    { 
      id: 1, 
      title: 'Strategy Translation', 
      icon: '🎯', 
      description: 'Transform business objectives into AI-powered marketing strategy',
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
      title: 'Publish Campaign', 
      icon: '🚀', 
      description: 'Deploy to advertising platforms',
      color: 'from-red-500 to-red-600'
    },
    { 
      id: 7, 
      title: 'Performance Analysis', 
      icon: '📈', 
      description: 'AI-powered insights and optimization recommendations',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const response = await fetch('/api/company-profile');
      const data = await response.json();
      if (data.success) {
        setCompanyData(data.data);
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    }
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
      
      const response = await fetch(endpoints[stepId], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyData,
          previousSteps: stepData,
          connectedAIs: connectedAIs.map(ai => ai.service)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStepData(prev => ({
          ...prev,
          [stepId]: data.result
        }));
        
        // Auto-advance to next step if not the last one
        if (stepId < 7) {
          setTimeout(() => setCurrentStep(stepId + 1), 1000);
        }
      }
    } catch (error) {
      console.error(`Error processing step ${stepId}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    const data = stepData[step.id];
    const isCompleted = !!data;
    const isCurrent = currentStep === step.id;
    const isLoading = loading && isCurrent;

    return (
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${
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
            
            <div className="flex items-center space-x-2">
              {connectedAIs.length > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs opacity-80">AI:</span>
                  {connectedAIs.slice(0, 2).map(ai => (
                    <span key={ai.service} className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                      {ai.service}
                    </span>
                  ))}
                </div>
              )}
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                isCompleted 
                  ? 'bg-green-500' 
                  : isCurrent 
                    ? 'bg-yellow-500' 
                    : 'bg-white bg-opacity-20'
              }`}>
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isCompleted ? (
                  '✓'
                ) : (
                  step.id
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">AI is processing your {step.title.toLowerCase()}...</p>
            </div>
          ) : isCompleted ? (
            <div className="space-y-4">
              {/* Success State */}
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
                <span className="text-green-700 font-medium">Step completed successfully</span>
              </div>
              
              {/* Step Results */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Generated Results:</h4>
                <div className="text-sm text-gray-600 max-h-40 overflow-y-auto">
                  {typeof data === 'string' ? (
                    <p>{data}</p>
                  ) : (
                    <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
                  )}
                </div>
              </div>
            </div>
          ) : isCurrent ? (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">Ready to process this step with your connected AI services.</p>
              <button
                onClick={() => processStep(step.id)}
                disabled={connectedAIs.length === 0}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {connectedAIs.length === 0 ? 'Connect AI Services First' : `Process ${step.title}`}
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

  if (!companyData) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🏢</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Company Setup Required</h3>
        <p className="text-gray-600">Please complete your company profile setup before creating campaigns.</p>
      </div>
    );
  }

  if (connectedAIs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🤖</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Services Required</h3>
        <p className="text-gray-600">Please connect at least one AI service to use the campaign builder.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI Campaign Builder
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Transform your business objectives into high-performing marketing campaigns using AI automation
        </p>
        
        {/* Progress Overview */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
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

      {/* Company Info Banner */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{companyData.companyName}</h3>
            <p className="text-gray-300">{companyData.industry} • Target: {companyData.targetPublic}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">Monthly Budget</p>
            <p className="text-xl font-bold">{companyData.monthlyBudget}</p>
          </div>
        </div>
      </div>

      {/* Connected AI Services */}
      <div className="bg-blue-50 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900">Connected AI Services</h4>
            <p className="text-blue-700 text-sm">
              Using {connectedAIs.length} AI service{connectedAIs.length > 1 ? 's' : ''} for campaign generation
            </p>
          </div>
          <div className="flex space-x-2">
            {connectedAIs.map(ai => (
              <div key={ai.service} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium capitalize">{ai.service}</span>
                {ai.is_default && <span className="text-xs text-yellow-600">⭐</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign Steps */}
      <div className="space-y-6">
        {steps.map((step) => renderStepContent(step))}
      </div>

      {/* Action Buttons */}
      {Object.keys(stepData).length === 7 && (
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">🎉 Campaign Ready!</h3>
            <p className="mb-6 opacity-90">
              Your AI-powered marketing campaign has been fully generated and is ready for deployment.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50">
                Download Campaign Plan
              </button>
              <button className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800">
                Start New Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignWizard;