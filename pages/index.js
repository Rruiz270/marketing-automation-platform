import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  MousePointer, 
  Eye,
  Play,
  Pause,
  Plus,
  Settings,
  Zap,
  BarChart3
} from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const [dateRange, setDateRange] = useState('7d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  // Fetch data using SWR for better caching and revalidation
  const { data: campaignsResponse, error: campaignsError } = useSWR('/api/campaigns', fetcher);
  const { data: analyticsResponse } = useSWR(`/api/analytics/overview?range=${dateRange}`, fetcher);

  const campaigns = campaignsResponse?.data || [];
  const analytics = analyticsResponse?.data || {};

  if (campaignsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (!campaignsResponse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const platformColors = {
    google_ads: '#4285F4',
    facebook_ads: '#1877F2',
    linkedin_ads: '#0A66C2',
    twitter_ads: '#1DA1F2',
    tiktok_ads: '#FF0050'
  };

  const totalMetrics = analytics.totalMetrics || {
    spend: 0,
    revenue: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0
  };

  const roas = totalMetrics.revenue / totalMetrics.spend || 0;
  const ctr = (totalMetrics.clicks / totalMetrics.impressions * 100) || 0;

  const handleOptimizeCampaign = async (campaignId, type) => {
    try {
      const response = await fetch('/api/automation/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          optimizationType: type
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        alert(`${type} completed successfully!`);
        // Refresh data
        mutate('/api/campaigns');
      }
    } catch (error) {
      alert('Optimization failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketing Automation Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage and monitor your paid advertising campaigns</p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => window.location.href = '/campaigns/new'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                <span>New Campaign</span>
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-50 transition-colors">
                <Settings size={20} />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 flex space-x-4">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <select 
            value={selectedPlatform} 
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Platforms</option>
            <option value="google_ads">Google Ads</option>
            <option value="facebook_ads">Facebook Ads</option>
            <option value="linkedin_ads">LinkedIn Ads</option>
          </select>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <MetricCard
            title="Total Spend"
            value={`$${totalMetrics.spend.toLocaleString()}`}
            icon={<DollarSign className="h-6 w-6" />}
            trend="-5.2%"
            trendDown
          />
          <MetricCard
            title="Revenue"
            value={`$${totalMetrics.revenue.toLocaleString()}`}
            icon={<TrendingUp className="h-6 w-6" />}
            trend="+12.4%"
          />
          <MetricCard
            title="ROAS"
            value={`${roas.toFixed(2)}x`}
            icon={<BarChart3 className="h-6 w-6" />}
            trend="+8.1%"
          />
          <MetricCard
            title="Impressions"
            value={totalMetrics.impressions.toLocaleString()}
            icon={<Eye className="h-6 w-6" />}
            trend="+15.3%"
          />
          <MetricCard
            title="CTR"
            value={`${ctr.toFixed(2)}%`}
            icon={<MousePointer className="h-6 w-6" />}
            trend="+2.1%"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Over Time */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Performance Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.performanceData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="spend" stroke="#ef4444" strokeWidth={2} name="Spend" />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Spend by Platform</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(analytics.platformDistribution || {}).map(([platform, data]) => ({
                    name: platform.replace('_', ' ').toUpperCase(),
                    value: data.spend,
                    fill: platformColors[platform] || '#8884d8'
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Spend']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Active Campaigns</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                            style={{ backgroundColor: platformColors[campaign.type] + '20', color: platformColors[campaign.type] }}>
                        {campaign.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${campaign.performance?.cost?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleOptimizeCampaign(campaign._id, 'bid_optimization')}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Optimize Bids"
                        >
                          <Zap size={16} />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 transition-colors">
                          <Settings size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, trend, trendDown = false }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-gray-400">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center">
          {trendDown ? (
            <TrendingDown className="text-red-500 h-4 w-4" />
          ) : (
            <TrendingUp className="text-green-500 h-4 w-4" />
          )}
          <span className={`text-sm ml-1 ${trendDown ? 'text-red-600' : 'text-green-600'}`}>
            {trend}
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last period</span>
        </div>
      )}
    </div>
  );
}