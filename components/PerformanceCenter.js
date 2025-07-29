import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PerformanceCenter = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [metrics, setMetrics] = useState({
    totalSpend: 12450,
    revenue: 45680,
    roas: 3.67,
    clicks: 8240,
    impressions: 156700,
    ctr: 5.26,
    conversions: 234,
    cpa: 53.21
  });

  const [campaigns] = useState([
    {
      id: 1,
      name: 'AI-Generated Search Campaign #1',
      status: 'active',
      spend: 4250,
      revenue: 15680,
      roas: 3.69,
      clicks: 2840,
      impressions: 52400,
      conversions: 89
    },
    {
      id: 2,
      name: 'Social Media Automation Campaign',
      status: 'active', 
      spend: 3200,
      revenue: 12440,
      roas: 3.89,
      clicks: 1960,
      impressions: 38200,
      conversions: 67
    },
    {
      id: 3,
      name: 'Alumni English - Display Campaign',
      status: 'paused',
      spend: 2800,
      revenue: 8960,
      roas: 3.20,
      clicks: 1520,
      impressions: 28800,
      conversions: 45
    },
    {
      id: 4,
      name: 'AI Creative Test Campaign',
      status: 'active',
      spend: 2200,
      revenue: 8600,
      roas: 3.91,
      clicks: 1920,
      impressions: 37300,
      conversions: 33
    }
  ]);

  const timeframes = [
    { value: '1d', label: 'Today' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ];

  const MetricCard = ({ title, value, change, icon, color, format = 'number' }) => {
    const formatValue = (val) => {
      if (format === 'currency') return `$${val.toLocaleString()}`;
      if (format === 'percentage') return `${val}%`;
      if (format === 'decimal') return val.toFixed(2);
      return val.toLocaleString();
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white text-xl`}>
            {icon}
          </div>
          {change && (
            <div className={`flex items-center space-x-1 text-sm font-medium ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{change > 0 ? '↗' : '↘'}</span>
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </motion.div>
    );
  };

  const CampaignRow = ({ campaign }) => (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="hover:bg-gray-50 transition-colors"
    >
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            campaign.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          <div>
            <p className="font-medium text-gray-900">{campaign.name}</p>
            <p className="text-sm text-gray-500 capitalize">{campaign.status}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">${campaign.spend.toLocaleString()}</td>
      <td className="px-6 py-4 text-sm text-gray-900">${campaign.revenue.toLocaleString()}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{campaign.roas.toFixed(2)}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{campaign.clicks.toLocaleString()}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{campaign.impressions.toLocaleString()}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{campaign.conversions}</td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Optimize
          </button>
          <button className="text-gray-600 hover:text-gray-800 text-sm">
            Details
          </button>
        </div>
      </td>
    </motion.tr>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Performance Center</h1>
          <p className="text-gray-600">Real-time analytics and AI-powered optimization insights</p>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex bg-white rounded-lg border border-gray-200 p-1">
          {timeframes.map(timeframe => (
            <button
              key={timeframe.value}
              onClick={() => setSelectedTimeframe(timeframe.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe.value
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Ad Spend"
          value={metrics.totalSpend}
          change={-8.2}
          icon="💰"
          color="bg-red-500"
          format="currency"
        />
        <MetricCard
          title="Revenue Generated"
          value={metrics.revenue}
          change={15.3}
          icon="📈"
          color="bg-green-500"
          format="currency"
        />
        <MetricCard
          title="Return on Ad Spend"
          value={metrics.roas}
          change={12.7}
          icon="🎯"
          color="bg-blue-500"
          format="decimal"
        />
        <MetricCard
          title="Cost Per Acquisition"
          value={metrics.cpa}
          change={-5.8}
          icon="🔄"
          color="bg-purple-500"
          format="currency"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total Clicks"
          value={metrics.clicks}
          change={8.4}
          icon="👆"
          color="bg-orange-500"
        />
        <MetricCard
          title="Impressions"
          value={metrics.impressions}
          change={22.1}
          icon="👁️"
          color="bg-indigo-500"
        />
        <MetricCard
          title="Click-Through Rate"
          value={metrics.ctr}
          change={-2.3}
          icon="📊"
          color="bg-teal-500"
          format="percentage"
        />
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
            🤖
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Performance Insights</h3>
            <p className="text-gray-600">Automated analysis and optimization recommendations</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-3">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="font-semibold text-green-700">Opportunity Detected</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Increase Budget on High-Performing Keywords</h4>
            <p className="text-sm text-gray-600 mb-3">
              3 keywords in your search campaigns are showing 4.2x ROAS. Increasing budget by 25% could generate an additional $3,400 in revenue.
            </p>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Apply Recommendation →
            </button>
          </div>
          
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-3">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="font-semibold text-yellow-700">Optimization Needed</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Pause Underperforming Ad Creatives</h4>
            <p className="text-sm text-gray-600 mb-3">
              5 ad creatives have ROAS below 2.0. Pausing these could save $850 weekly and reallocate budget to better performers.
            </p>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Review Creatives →
            </button>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
            <div className="flex space-x-2">
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                Export Data
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600">
                Create Campaign
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROAS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impressions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map(campaign => (
                <CampaignRow key={campaign.id} campaign={campaign} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Notifications */}
      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Notifications</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700">
              <strong>Budget optimization applied</strong> - Increased spend on "English Course" keyword by 20%
            </span>
            <span className="text-xs text-green-600 ml-auto">2 min ago</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-blue-700">
              <strong>New creative performing well</strong> - AI-generated ad #47 has 4.2x ROAS after 100 clicks
            </span>
            <span className="text-xs text-blue-600 ml-auto">15 min ago</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-yellow-700">
              <strong>Campaign reached daily limit</strong> - "Social Media Campaign" hit $500 daily budget at 3:42 PM
            </span>
            <span className="text-xs text-yellow-600 ml-auto">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCenter;