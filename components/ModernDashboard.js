import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import all components
import CompanyOnboarding from './CompanyOnboarding';
import AIConnectionHub from './AIConnectionHub';
import AdvertisingPlatforms from './AdvertisingPlatforms';
import CampaignWizard from './CampaignWizard';
import PerformanceCenter from './PerformanceCenter';

const ModernDashboard = () => {
  const [currentView, setCurrentView] = useState('overview');
  const [userProgress, setUserProgress] = useState({
    companySetup: false,
    aiConnected: false,
    campaignsCreated: 0,
    isOnboarded: false
  });
  const [connectedAIs, setConnectedAIs] = useState([]);

  // Check user progress
  useEffect(() => {
    checkUserProgress();
  }, []);

  const checkUserProgress = async () => {
    try {
      // Check company setup
      const companyRes = await fetch('/api/company-profile');
      const companyData = await companyRes.json();
      
      // Check AI connections
      const aiRes = await fetch('/api/ai-keys-simple');
      const aiData = await aiRes.json();
      
      setUserProgress({
        companySetup: companyData.success && companyData.data?.companyName,
        aiConnected: aiData.success && aiData.keys?.length > 0,
        campaignsCreated: 0, // TODO: Get from campaigns API
        isOnboarded: companyData.success && aiData.success
      });
      
      if (aiData.success) {
        setConnectedAIs(aiData.keys || []);
      }
    } catch (error) {
      console.error('Error checking progress:', error);
    }
  };

  // Navigation items with modern icons
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: '🏠', description: 'Dashboard home' },
    { id: 'onboarding', label: 'Company Setup', icon: '🏢', description: 'Business profile setup', required: !userProgress.companySetup },
    { id: 'ai-hub', label: 'AI Connections', icon: '🤖', description: 'Connect AI services (13 available)', required: !userProgress.aiConnected },
    { id: 'advertising-platforms', label: 'Ad Platforms', icon: '📱', description: 'Google, Facebook, LinkedIn & more' },
    { id: 'campaign-wizard', label: 'Campaign Builder', icon: '🎯', description: '7-step AI campaign creation' },
    { id: 'performance', label: 'Performance', icon: '📊', description: 'Analytics & insights', disabled: !userProgress.isOnboarded },
    { id: 'automation', label: 'Automation', icon: '⚡', description: 'Smart optimization', disabled: !userProgress.isOnboarded }
  ];

  const ProgressIndicator = () => (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Setup Progress</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${userProgress.companySetup ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
            {userProgress.companySetup ? '✓' : '1'}
          </div>
          <span className={userProgress.companySetup ? 'text-green-600 font-medium' : 'text-gray-600'}>
            Company Profile Setup
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${userProgress.aiConnected ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
            {userProgress.aiConnected ? '✓' : '2'}
          </div>
          <span className={userProgress.aiConnected ? 'text-green-600 font-medium' : 'text-gray-600'}>
            AI Services Connected ({connectedAIs.length})
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${userProgress.isOnboarded ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            {userProgress.isOnboarded ? '🚀' : '3'}
          </div>
          <span className={userProgress.isOnboarded ? 'text-blue-600 font-medium' : 'text-gray-600'}>
            Ready for Campaigns
          </span>
        </div>
      </div>
    </div>
  );

  const QuickStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">AI Services</p>
            <p className="text-2xl font-bold text-gray-900">{connectedAIs.length}</p>
            <p className="text-xs text-gray-500">13 available</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            🤖
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Ad Platforms</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-500">8 available</p>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            📱
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Active Campaigns</p>
            <p className="text-2xl font-bold text-gray-900">{userProgress.campaignsCreated}</p>
            <p className="text-xs text-gray-500">Ready to create</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            🎯
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Setup Progress</p>
            <p className="text-2xl font-bold text-gray-900">{userProgress.isOnboarded ? '100%' : '75%'}</p>
            <p className="text-xs text-gray-500">Almost ready</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            📈
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'onboarding':
        return <CompanyOnboarding onComplete={() => checkUserProgress()} />;
      case 'ai-hub':
        return <AIConnectionHub onUpdate={() => checkUserProgress()} />;
      case 'advertising-platforms':
        return <AdvertisingPlatforms onUpdate={() => checkUserProgress()} />;
      case 'campaign-wizard':
        return <CampaignWizard connectedAIs={connectedAIs} />;
      case 'performance':
        return <PerformanceCenter />;
      case 'automation':
        return (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold mb-4">Smart Automation</h3>
            <p className="text-gray-600">Advanced automation features coming soon...</p>
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            <div className="text-center py-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Alumni AI Marketing Platform
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Create, optimize, and scale your marketing campaigns with AI-powered automation
              </p>
            </div>
            <QuickStats />
            <ProgressIndicator />
            
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">
                {userProgress.isOnboarded ? 'Ready for AI Marketing Automation!' : 'Get Started with AI Marketing'}
              </h3>
              <p className="mb-6 opacity-90">
                {userProgress.isOnboarded 
                  ? 'All systems ready. Create your first AI-powered campaign now!'
                  : 'Connect AI services and advertising platforms to unlock automated marketing'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!userProgress.companySetup && (
                  <button 
                    onClick={() => setCurrentView('onboarding')}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    📋 Setup Company Profile
                  </button>
                )}
                {!userProgress.aiConnected && (
                  <button 
                    onClick={() => setCurrentView('ai-hub')}
                    className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-colors"
                  >
                    🤖 Connect AI Services (13 available)
                  </button>
                )}
                <button 
                  onClick={() => setCurrentView('advertising-platforms')}
                  className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-colors"
                >
                  📱 Connect Ad Platforms
                </button>
                <button 
                  onClick={() => setCurrentView('campaign-wizard')}
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  🚀 Build Campaigns Now
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Sidebar */}
      <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl border-r border-gray-100 z-50">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Alumni Marketing</h2>
              <p className="text-sm text-gray-500">AI Platform</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => !item.disabled && setCurrentView(item.id)}
              disabled={item.disabled}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                currentView === item.id 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : item.disabled 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
              whileHover={!item.disabled ? { scale: 1.02 } : {}}
              whileTap={!item.disabled ? { scale: 0.98 } : {}}
            >
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1 text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{item.label}</span>
                  {item.required && (
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </div>
                <p className="text-xs opacity-75">{item.description}</p>
              </div>
            </motion.button>
          ))}
        </nav>
        
        {/* AI Status */}
        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${connectedAIs.length > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {connectedAIs.length > 0 ? `${connectedAIs.length} AI${connectedAIs.length > 1 ? 's' : ''} Connected` : 'No AI Connected'}
              </span>
            </div>
            {connectedAIs.length > 0 && (
              <div className="text-xs text-gray-500">
                {connectedAIs.map(ai => ai.service).join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-72 p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModernDashboard;