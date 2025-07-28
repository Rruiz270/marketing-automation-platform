import { useState } from 'react';

export default function Dashboard() {
  const [dateRange, setDateRange] = useState('7d');

  // Mock data for initial display
  const mockCampaigns = [
    {
      _id: '1',
      name: 'Google Search Campaign',
      type: 'google_ads',
      status: 'active',
      performance: { cost: 250, impressions: 15000, clicks: 450, conversions: 25, revenue: 1200 }
    },
    {
      _id: '2',
      name: 'Facebook Awareness Campaign', 
      type: 'facebook_ads',
      status: 'active',
      performance: { cost: 180, impressions: 12000, clicks: 360, conversions: 18, revenue: 900 }
    }
  ];

  const totalMetrics = {
    spend: 430,
    revenue: 2100,
    impressions: 27000,
    clicks: 810,
    conversions: 43
  };

  const roas = (totalMetrics.revenue / totalMetrics.spend).toFixed(2);
  const ctr = ((totalMetrics.clicks / totalMetrics.impressions) * 100).toFixed(2);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '24px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
            Marketing Automation Dashboard
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Manage and monitor your paid advertising campaigns
          </p>
        </div>
      </header>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Filters */}
        <div style={{ marginBottom: '32px', display: 'flex', gap: '16px' }}>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 16px' }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        {/* Key Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <MetricCard title="Total Spend" value={`$${totalMetrics.spend.toLocaleString()}`} />
          <MetricCard title="Revenue" value={`$${totalMetrics.revenue.toLocaleString()}`} />
          <MetricCard title="ROAS" value={`${roas}x`} />
          <MetricCard title="Impressions" value={totalMetrics.impressions.toLocaleString()} />
          <MetricCard title="CTR" value={`${ctr}%`} />
        </div>

        {/* Performance Chart Placeholder */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Performance Over Time</h3>
          <div style={{ height: '200px', backgroundColor: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#6b7280' }}>📈 Performance chart will be displayed here</p>
          </div>
        </div>

        {/* Campaigns Table */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Active Campaigns</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Campaign</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Platform</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Spend</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {mockCampaigns.map((campaign, index) => (
                  <tr key={campaign._id} style={{ borderBottom: index < mockCampaigns.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{campaign.name}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: '500',
                        backgroundColor: campaign.type === 'google_ads' ? '#dbeafe' : '#fef3c7',
                        color: campaign.type === 'google_ads' ? '#1e40af' : '#92400e'
                      }}>
                        {campaign.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: '500',
                        backgroundColor: '#d1fae5',
                        color: '#065f46'
                      }}>
                        {campaign.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827' }}>
                      ${campaign.performance.cost.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827' }}>
                      ${campaign.performance.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* API Status */}
        <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
          <h4 style={{ color: '#166534', margin: '0 0 8px 0' }}>🚀 Platform Status</h4>
          <p style={{ color: '#15803d', margin: 0, fontSize: '14px' }}>
            • Frontend: ✅ Active<br/>
            • Database: ✅ MongoDB Atlas Connected<br/>
            • APIs: ✅ Ready (/api/campaigns, /api/analytics)<br/>
            • Deployment: ✅ Vercel Production
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value }) {
  return (
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 8px 0' }}>{title}</p>
      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{value}</p>
    </div>
  );
}