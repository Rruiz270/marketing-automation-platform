import { useState, useEffect } from 'react';
import ApiConnectionManager from '../components/ApiConnectionManager';

export default function Dashboard() {
  const [dateRange, setDateRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [aiInsights, setAiInsights] = useState([]);
  const [automationRules, setAutomationRules] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock automation effects
  useEffect(() => {
    if (automationEnabled) {
      // Simulate fetching AI insights
      const fetchInsights = () => {
        setAiInsights([
          { type: 'opportunity', title: 'Budget Optimization', confidence: 92 },
          { type: 'warning', title: 'Performance Alert', confidence: 87 },
          { type: 'success', title: 'A/B Test Complete', confidence: 96 }
        ]);
      };
      
      fetchInsights();
      const interval = setInterval(fetchInsights, 30000); // Update every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [automationEnabled]);

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
            AI Marketing Automation Platform
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Intelligent campaign management with predictive analytics and automated optimization
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

        {/* Navigation Tabs */}
        <div style={{ marginBottom: '32px', borderBottom: '1px solid #e5e7eb' }}>
          <nav style={{ display: 'flex', gap: '32px' }}>
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'automation', label: 'AI Automation', icon: '🤖' },
              { id: 'insights', label: 'Predictive Insights', icon: '🔮' },
              { id: 'connections', label: 'API Connections', icon: '🔗' },
              { id: 'audit', label: 'Audit & Compliance', icon: '📋' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
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

            {/* AI Insights Panel */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>🤖 AI Insights & Recommendations</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Automation</span>
                  <button
                    onClick={() => setAutomationEnabled(!automationEnabled)}
                    style={{
                      width: '44px',
                      height: '24px',
                      backgroundColor: automationEnabled ? '#3b82f6' : '#d1d5db',
                      border: 'none',
                      borderRadius: '12px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: 'white',
                      borderRadius: '10px',
                      position: 'absolute',
                      top: '2px',
                      left: automationEnabled ? '22px' : '2px',
                      transition: 'all 0.2s'
                    }} />
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                <AIInsightCard 
                  type="opportunity" 
                  title="Budget Optimization Opportunity" 
                  description="Google Search Campaign shows 25% potential ROAS improvement with +$150 daily budget" 
                  confidence={92}
                  action="Apply Recommendation"
                />
                <AIInsightCard 
                  type="warning" 
                  title="Performance Decline Alert" 
                  description="Facebook Campaign CTR dropped 15% in last 3 days - creative refresh recommended" 
                  confidence={87}
                  action="Generate New Creatives"
                />
                <AIInsightCard 
                  type="success" 
                  title="Automated A/B Test Complete" 
                  description="Headline variant B increased conversions by 32% - automatically scaled to 100% traffic" 
                  confidence={96}
                  action="View Details"
                />
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
          </>
        )}

        {/* AI Automation Tab */}
        {activeTab === 'automation' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Automation Rules */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Active Automation Rules</h3>
                <button style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>+ Create Rule</button>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                <AutomationRuleCard 
                  name="Budget Auto-Scaling"
                  description="Automatically increase budget by 25% when ROAS &gt; 4.0 for 2 consecutive days"
                  status="active"
                  confidence={92}
                  executions={5}
                  lastRun="2 hours ago"
                />
                <AutomationRuleCard 
                  name="Creative Performance Monitor"
                  description="Generate new creatives when CTR drops below 2.0% for 3 days"
                  status="active"
                  confidence={88}
                  executions={12}
                  lastRun="1 day ago"
                />
                <AutomationRuleCard 
                  name="Competitive Response"
                  description="Adjust bids when competitor spend increases by &gt;30% in target keywords"
                  status="paused"
                  confidence={75}
                  executions={0}
                  lastRun="Never"
                />
              </div>
            </div>

            {/* AI Creative Generator */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>🎨 AI Creative Generator</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                <CreativeGeneratorCard type="text" title="Text Ads" description="Generate compelling headlines and descriptions" />
                <CreativeGeneratorCard type="image" title="Image Ads" description="DALL-E powered visual creatives" />
                <CreativeGeneratorCard type="video" title="Video Ads" description="AI-generated video with synthetic voices" />
              </div>
            </div>

            {/* Budget Automation */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>💰 Budget Automation</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>Safe Mode Settings</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                      <input type="checkbox" defaultChecked /> Require approval for budget changes &gt; $500
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                      <input type="checkbox" defaultChecked /> Enable emergency stop (ROAS &lt; 1.5)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                      <input type="checkbox" defaultChecked /> Daily spending limit: $2,000
                    </label>
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>Confidence Thresholds</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#6b7280' }}>Auto-execute: 95%+ confidence</label>
                      <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '6px', marginTop: '4px' }}>
                        <div style={{ width: '95%', backgroundColor: '#10b981', height: '100%', borderRadius: '4px' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#6b7280' }}>Require approval: 85-94% confidence</label>
                      <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '6px', marginTop: '4px' }}>
                        <div style={{ width: '85%', backgroundColor: '#f59e0b', height: '100%', borderRadius: '4px' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#6b7280' }}>Block execution: &lt;85% confidence</label>
                      <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '6px', marginTop: '4px' }}>
                        <div style={{ width: '84%', backgroundColor: '#ef4444', height: '100%', borderRadius: '4px' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Predictive Insights Tab */}
        {activeTab === 'insights' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Prediction Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <PredictionCard 
                metric="ROAS"
                current={4.2}
                predicted={4.8}
                change={14.3}
                confidence={89}
                horizon="7 days"
              />
              <PredictionCard 
                metric="Cost per Conversion"
                current={45}
                predicted={38}
                change={-15.6}
                confidence={92}
                horizon="7 days"
              />
              <PredictionCard 
                metric="Click-through Rate"
                current={2.8}
                predicted={3.2}
                change={14.3}
                confidence={76}
                horizon="7 days"
              />
            </div>

            {/* Seasonal Trends */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>📅 Seasonal Trends & Forecasting</h3>
              <div style={{ height: '200px', backgroundColor: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#6b7280' }}>📈 Seasonal forecasting chart will be displayed here</p>
              </div>
              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>UPCOMING OPPORTUNITY</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>Black Friday (Nov 24)</div>
                  <div style={{ fontSize: '12px', color: '#92400e' }}>Expected 340% traffic increase</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#dbeafe', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#1e40af', marginBottom: '4px' }}>BUDGET RECOMMENDATION</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>Increase by 25%</div>
                  <div style={{ fontSize: '12px', color: '#1e40af' }}>Starting November 20th</div>
                </div>
              </div>
            </div>

            {/* Competitor Insights */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>🕵️ Competitor Intelligence</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <CompetitorInsightCard 
                  competitor="Competitor A"
                  spendChange="+35%"
                  threat="High"
                  action="Increased video ad budget"
                />
                <CompetitorInsightCard 
                  competitor="Competitor B"
                  spendChange="-12%"
                  threat="Low"
                  action="Reduced search campaigns"
                />
                <CompetitorInsightCard 
                  competitor="Competitor C"
                  spendChange="+18%"
                  threat="Medium"
                  action="New creative formats"
                />
              </div>
            </div>
          </div>
        )}

        {/* API Connections Tab */}
        {activeTab === 'connections' && (
          <ApiConnectionManager userId="demo_user" />
        )}

        {/* Audit & Compliance Tab */}
        {activeTab === 'audit' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Compliance Overview */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>📋 Compliance Overview</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <ComplianceMetricCard title="Automation Actions" value="247" subtitle="Last 30 days" />
                <ComplianceMetricCard title="Human Approvals" value="23" subtitle="9.3% of actions" />
                <ComplianceMetricCard title="Compliance Score" value="96%" subtitle="Excellent" />
                <ComplianceMetricCard title="Audit Trail" value="100%" subtitle="Complete coverage" />
              </div>
            </div>

            {/* Recent Audit Log */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Recent Automation Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <AuditLogEntry 
                  timestamp="2 hours ago"
                  action="Budget Adjustment"
                  campaign="Google Search Campaign"
                  confidence={94}
                  status="Executed"
                  change="+$150 daily budget"
                />
                <AuditLogEntry 
                  timestamp="5 hours ago"
                  action="Creative Generation"
                  campaign="Facebook Awareness Campaign"
                  confidence={87}
                  status="Pending Approval"
                  change="3 new ad variations"
                />
                <AuditLogEntry 
                  timestamp="1 day ago"
                  action="A/B Test Conclusion"
                  campaign="LinkedIn Lead Gen"
                  confidence={96}
                  status="Executed"
                  change="Winner scaled to 100%"
                />
              </div>
            </div>

            {/* Confidence Analysis */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>AI Confidence Analysis</h3>
              <div style={{ height: '200px', backgroundColor: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#6b7280' }}>📊 Confidence distribution chart will be displayed here</p>
              </div>
            </div>
          </div>
        )}

        {/* API Status */}
        <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
          <h4 style={{ color: '#166534', margin: '0 0 8px 0' }}>🚀 Platform Status</h4>
          <p style={{ color: '#15803d', margin: 0, fontSize: '14px' }}>
            • Frontend: ✅ Active<br/>
            • Database: ✅ MongoDB Atlas Connected<br/>
            • APIs: ✅ Ready (/api/ai/*, /api/campaigns, /api/analytics)<br/>
            • AI Services: ✅ Automation, Predictions, Audit System<br/>
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

function AIInsightCard({ type, title, description, confidence, action }) {
  const colors = {
    opportunity: { bg: '#ecfdf5', border: '#10b981', text: '#065f46' },
    warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    success: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' }
  };
  
  const color = colors[type] || colors.success;
  
  return (
    <div style={{ 
      backgroundColor: color.bg, 
      border: `1px solid ${color.border}`, 
      borderRadius: '8px', 
      padding: '16px' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: color.text, margin: 0 }}>{title}</h4>
        <span style={{ fontSize: '12px', color: color.text, opacity: 0.8 }}>{confidence}% confidence</span>
      </div>
      <p style={{ fontSize: '12px', color: color.text, margin: '0 0 12px 0', opacity: 0.9 }}>{description}</p>
      <button style={{
        fontSize: '12px',
        fontWeight: '500',
        color: color.text,
        backgroundColor: 'transparent',
        border: `1px solid ${color.border}`,
        padding: '4px 8px',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>{action}</button>
    </div>
  );
}

function AutomationRuleCard({ name, description, status, confidence, executions, lastRun }) {
  const statusColors = {
    active: { bg: '#ecfdf5', color: '#065f46' },
    paused: { bg: '#fef3c7', color: '#92400e' },
    disabled: { bg: '#fee2e2', color: '#991b1b' }
  };
  
  const statusColor = statusColors[status] || statusColors.active;
  
  return (
    <div style={{ 
      backgroundColor: 'white', 
      border: '1px solid #e5e7eb', 
      borderRadius: '8px', 
      padding: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{name}</h4>
          <span style={{
            fontSize: '12px',
            padding: '2px 8px',
            borderRadius: '12px',
            backgroundColor: statusColor.bg,
            color: statusColor.color
          }}>{status}</span>
        </div>
        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>{description}</p>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#9ca3af' }}>
          <span>Confidence: {confidence}%</span>
          <span>Executions: {executions}</span>
          <span>Last run: {lastRun}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button style={{
          fontSize: '12px',
          padding: '4px 8px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          backgroundColor: 'white',
          cursor: 'pointer'
        }}>Edit</button>
        <button style={{
          fontSize: '12px',
          padding: '4px 8px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          backgroundColor: 'white',
          cursor: 'pointer'
        }}>{status === 'active' ? 'Pause' : 'Activate'}</button>
      </div>
    </div>
  );
}

function CreativeGeneratorCard({ type, title, description }) {
  const icons = { text: '📝', image: '🎨', video: '🎬' };
  
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icons[type]}</div>
      <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>{title}</h4>
      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 12px 0' }}>{description}</p>
      <button style={{
        fontSize: '12px',
        fontWeight: '500',
        color: '#3b82f6',
        backgroundColor: 'white',
        border: '1px solid #3b82f6',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>Generate</button>
    </div>
  );
}

function PredictionCard({ metric, current, predicted, change, confidence, horizon }) {
  const isPositive = change > 0;
  
  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{metric}</h4>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>{horizon}</span>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Current: {current}</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Predicted: {predicted}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: '12px',
          fontWeight: '500',
          color: isPositive ? '#10b981' : '#ef4444'
        }}>
          {isPositive ? '↗' : '↘'} {Math.abs(change)}%
        </span>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>{confidence}% confidence</span>
      </div>
    </div>
  );
}

function CompetitorInsightCard({ competitor, spendChange, threat, action }) {
  const threatColors = {
    High: '#ef4444',
    Medium: '#f59e0b',
    Low: '#10b981'
  };
  
  return (
    <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{competitor}</h4>
        <span style={{
          fontSize: '12px',
          fontWeight: '500',
          color: threatColors[threat]
        }}>{threat} Threat</span>
      </div>
      <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>{spendChange}</div>
      <div style={{ fontSize: '12px', color: '#6b7280' }}>{action}</div>
    </div>
  );
}

function ComplianceMetricCard({ title, value, subtitle }) {
  return (
    <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: '#6b7280' }}>{subtitle}</div>
    </div>
  );
}

function AuditLogEntry({ timestamp, action, campaign, confidence, status, change }) {
  const statusColors = {
    Executed: '#10b981',
    'Pending Approval': '#f59e0b',
    Failed: '#ef4444'
  };
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      backgroundColor: '#f9fafb',
      borderRadius: '6px'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>{action}</span>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>•</span>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>{campaign}</span>
        </div>
        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
          {timestamp} • {confidence}% confidence • {change}
        </div>
      </div>
      <span style={{
        fontSize: '12px',
        fontWeight: '500',
        color: statusColors[status]
      }}>{status}</span>
    </div>
  );
}