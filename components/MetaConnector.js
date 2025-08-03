import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MetaConnector = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionData, setConnectionData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/platforms/meta-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_campaigns',
          userId: 'default_user'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsConnected(true);
        setCampaigns(data.campaigns || []);
        if (onConnectionChange) onConnectionChange(true);
      } else {
        setIsConnected(false);
        if (onConnectionChange) onConnectionChange(false);
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const connectMeta = async () => {
    setIsConnecting(true);
    try {
      // Get OAuth URL
      const response = await fetch('/api/platforms/meta-auth?userId=default_user');
      const data = await response.json();
      
      if (data.authUrl) {
        // In production, redirect to authUrl
        // For now, show instructions
        alert(`To connect Meta:\n\n1. Create a Meta App at developers.facebook.com\n2. Add these env variables:\n   META_APP_ID=your_app_id\n   META_APP_SECRET=your_app_secret\n3. Then redirect to: ${data.authUrl}`);
      }
    } catch (error) {
      console.error('Meta connection error:', error);
      alert('Failed to initiate Meta connection');
    } finally {
      setIsConnecting(false);
    }
  };

  const createTestCampaign = async () => {
    try {
      const campaignData = {
        name: 'Alumni English - Professional Courses',
        objective: 'leads',
        budget: 5000, // R$50 daily
        targeting: {
          location: 'São Paulo, Brazil',
          ageMin: 25,
          ageMax: 55,
          interests: ['Business English', 'Professional Development']
        }
      };

      const response = await fetch('/api/platforms/meta-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_campaign',
          userId: 'default_user',
          campaignData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Campaign created successfully!');
        checkConnection(); // Refresh campaigns
      } else {
        alert(`Error: ${result.error || 'Campaign creation failed'}`);
      }
    } catch (error) {
      console.error('Campaign creation error:', error);
      alert('Failed to create campaign');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📘</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Meta Business</h3>
            <p className="text-sm text-gray-600">Facebook & Instagram Ads</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {isConnected ? '✓ Connected' : 'Not Connected'}
        </div>
      </div>

      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Connect your Meta Business account to create and manage Facebook & Instagram campaigns.
          </p>
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">What you'll get:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Create campaigns directly from Alumni platform</li>
              <li>• Target Brazilian professionals aged 25-55</li>
              <li>• Automatic ad optimization for education sector</li>
              <li>• Real-time performance tracking</li>
            </ul>
          </div>
          <button
            onClick={connectMeta}
            disabled={isConnecting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect Meta Business Account'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">
                {campaigns.length}
              </div>
              <div className="text-sm text-gray-600">Active Campaigns</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">
                R$ 5,000
              </div>
              <div className="text-sm text-gray-600">Monthly Budget</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">
                2.8%
              </div>
              <div className="text-sm text-gray-600">Avg. CTR</div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={createTestCampaign}
                className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                Create Campaign
              </button>
              <button className="border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">
                View Dashboard
              </button>
            </div>
          </div>

          {campaigns.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Recent Campaigns</h4>
              <div className="space-y-2">
                {campaigns.slice(0, 3).map((campaign) => (
                  <div key={campaign.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-gray-600">{campaign.objective}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {campaign.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetaConnector;