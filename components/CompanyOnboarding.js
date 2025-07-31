import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProjectManager from './ProjectManager';
import { emergencyBackupCompanyData, emergencyRecoverCompanyData } from '../lib/emergency-backup.js';

const CompanyOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const [viewMode, setViewMode] = useState('loading'); // 'loading', 'existing', 'new', 'edit'
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    
    // Target Market
    targetPublic: '',
    geolocation: '',
    demographics: '',
    
    // Products/Services
    products: [{ name: '', description: '', averageTicket: '' }],
    
    // Competition
    competitors: ['', '', ''],
    differentials: '',
    
    // Marketing
    currentChannels: [],
    currentCAC: '',
    expectedCAC: '',
    monthlyBudget: '',
    marketingObjectives: '',
    challenges: ''
  });

  // Load existing profile on mount
  useEffect(() => {
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    try {
      // EMERGENCY RECOVERY FIRST - Check browser storage
      console.log('🚨 EMERGENCY: Checking for recovered company data...');
      const emergencyData = await emergencyRecoverCompanyData('default_user');
      if (emergencyData) {
        console.log('🚨 EMERGENCY RECOVERY SUCCESSFUL!');
        setExistingProfile(emergencyData);
        setFormData(emergencyData);
        setViewMode('existing');
        return;
      }

      const response = await fetch('/api/company-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get',
          user_id: 'default_user'
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setExistingProfile(data.data);
        setFormData(data.data);
        setViewMode('existing');
      } else {
        setViewMode('new');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setViewMode('new');
    }
  };

  const steps = [
    { number: 1, title: 'Company Basics', icon: '🏢', description: 'Tell us about your business' },
    { number: 2, title: 'Target Market', icon: '🎯', description: 'Who are your customers?' },
    { number: 3, title: 'Products & Services', icon: '📦', description: 'What do you offer?' },
    { number: 4, title: 'Competition', icon: '⚔️', description: 'Know your competitors' },
    { number: 5, title: 'Marketing Goals', icon: '🚀', description: 'Set your objectives' }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { name: '', description: '', averageTicket: '' }]
    }));
  };

  const updateProduct = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      )
    }));
  };

  const updateCompetitor = (index, value) => {
    setFormData(prev => ({
      ...prev,
      competitors: prev.competitors.map((comp, i) => i === index ? value : comp)
    }));
  };

  const toggleChannel = (channel) => {
    setFormData(prev => ({
      ...prev,
      currentChannels: prev.currentChannels.includes(channel)
        ? prev.currentChannels.filter(c => c !== channel)
        : [...prev.currentChannels, channel]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // EMERGENCY BACKUP FIRST - Save to browser storage immediately
      console.log('🚨 EMERGENCY: Saving company data to all locations...');
      await emergencyBackupCompanyData(formData, 'default_user');
      
      const response = await fetch('/api/company-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          user_id: 'default_user',
          data: formData
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Double backup after successful save
        await emergencyBackupCompanyData(formData, 'default_user');
        alert('✅ Company profile saved with EMERGENCY BACKUP protection!');
        onComplete();
      } else {
        alert(`Error: ${result.error || 'Failed to save profile'}`);
      }
    } catch (error) {
      console.error('Error saving company profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => updateFormData('companyName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your company name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => updateFormData('website', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
          <select
            value={formData.industry}
            onChange={(e) => updateFormData('industry', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Industry</option>
            <option value="Education">Education</option>
            <option value="E-commerce">E-commerce</option>
            <option value="SaaS">SaaS</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
          <select
            value={formData.companySize}
            onChange={(e) => updateFormData('companySize', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-1000">201-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience *</label>
        <textarea
          value={formData.targetPublic}
          onChange={(e) => updateFormData('targetPublic', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe your ideal customers (age, interests, behavior, etc.)"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Geographic Location</label>
          <input
            type="text"
            value={formData.geolocation}
            onChange={(e) => updateFormData('geolocation', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., United States, São Paulo, Global"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Demographics</label>
          <input
            type="text"
            value={formData.demographics}
            onChange={(e) => updateFormData('demographics', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 25-45 years, professionals, parents"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">Products & Services</h4>
        <button
          onClick={addProduct}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          + Add Product
        </button>
      </div>
      
      {formData.products.map((product, index) => (
        <div key={index} className="p-6 border border-gray-200 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => updateProduct(index, 'name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Product or service name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Average Price</label>
              <input
                type="text"
                value={product.averageTicket}
                onChange={(e) => updateProduct(index, 'averageTicket', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="$99, $1,500, etc."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={product.description}
              onChange={(e) => updateProduct(index, 'description', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of the product or service"
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Main Competitors</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {formData.competitors.map((competitor, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competitor {index + 1}
              </label>
              <input
                type="text"
                value={competitor}
                onChange={(e) => updateCompetitor(index, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Competitor name"
              />
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Competitive Advantages</label>
        <textarea
          value={formData.differentials}
          onChange={(e) => updateFormData('differentials', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="What makes you different and better than competitors?"
        />
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Current Marketing Channels</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Google Ads', 'Facebook Ads', 'Instagram', 'LinkedIn', 'Email', 'SEO', 'Content Marketing', 'Influencers'].map(channel => (
            <button
              key={channel}
              onClick={() => toggleChannel(channel)}
              className={`p-3 rounded-lg border transition-colors ${
                formData.currentChannels.includes(channel)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
            >
              {channel}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current CAC</label>
          <input
            type="text"
            value={formData.currentCAC}
            onChange={(e) => updateFormData('currentCAC', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="$50, $200, etc."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target CAC</label>
          <input
            type="text"
            value={formData.expectedCAC}
            onChange={(e) => updateFormData('expectedCAC', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="$30, $150, etc."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget</label>
          <input
            type="text"
            value={formData.monthlyBudget}
            onChange={(e) => updateFormData('monthlyBudget', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="$5,000, $20,000, etc."
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Marketing Objectives</label>
        <textarea
          value={formData.marketingObjectives}
          onChange={(e) => updateFormData('marketingObjectives', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="What are your main marketing goals? (increase sales, brand awareness, etc.)"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Marketing Challenges</label>
        <textarea
          value={formData.challenges}
          onChange={(e) => updateFormData('challenges', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="What marketing challenges are you facing?"
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  // If loading
  if (viewMode === 'loading') {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading company profile...</p>
      </div>
    );
  }

  // If existing profile found
  if (viewMode === 'existing' && existingProfile) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{existingProfile.companyName}</h2>
              <p className="text-gray-600">{existingProfile.industry} • {existingProfile.geolocation}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowProjectManager(true)}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium"
              >
                Manage Projects
              </button>
              <button
                onClick={() => {
                  setViewMode('edit');
                  setCurrentStep(1);
                }}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                Edit Profile
              </button>
              <button
                onClick={() => {
                  setFormData({
                    companyName: '',
                    industry: '',
                    companySize: '',
                    website: '',
                    targetPublic: '',
                    geolocation: '',
                    demographics: '',
                    products: [{ name: '', description: '', averageTicket: '' }],
                    competitors: ['', '', ''],
                    differentials: '',
                    currentChannels: [],
                    currentCAC: '',
                    expectedCAC: '',
                    monthlyBudget: '',
                    marketingObjectives: '',
                    challenges: ''
                  });
                  setViewMode('new');
                  setCurrentStep(1);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Create New Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-2">Target Market</h4>
              <p className="text-gray-600">{existingProfile.targetPublic}</p>
              <p className="text-sm text-gray-500 mt-1">{existingProfile.demographics}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-2">Marketing Budget</h4>
              <p className="text-2xl font-bold text-gray-900">{existingProfile.monthlyBudget}</p>
              <p className="text-sm text-gray-500">Current CAC: {existingProfile.currentCAC} → Target: {existingProfile.expectedCAC}</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">Marketing Objectives</h4>
            <p className="text-blue-800">{existingProfile.marketingObjectives}</p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onComplete}
              className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
            >
              Continue with this Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form view (new or edit)
  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                currentStep >= step.number 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {step.icon}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  currentStep > step.number ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-gray-600 mt-1">
            {steps[currentStep - 1].description}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8"
      >
        {renderCurrentStep()}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {currentStep < 5 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Next Step
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Complete Setup 🎉'}
          </button>
        )}
      </div>
      
      {/* Project Manager Modal */}
      {showProjectManager && existingProfile && (
        <ProjectManager
          company={existingProfile}
          onClose={() => setShowProjectManager(false)}
          onProjectCreated={() => {
            // Optionally refresh or show success message
            console.log('Project created successfully');
          }}
        />
      )}
    </div>
  );
};

export default CompanyOnboarding;