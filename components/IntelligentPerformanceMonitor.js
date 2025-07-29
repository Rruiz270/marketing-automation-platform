import { useState, useEffect } from 'react';

export default function IntelligentPerformanceMonitor({ campaignId, userId = 'demo_user' }) {
  const [performanceData, setPerformanceData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [showCompetitorAnalysis, setShowCompetitorAnalysis] = useState(false);
  const [competitorData, setCompetitorData] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock performance data - in real app this would come from API
  useEffect(() => {
    // Simulate loading performance data
    const mockData = {
      campaign_name: "Alumni Corporate English - Q4 2024",
      status: "active",
      performance: {
        impressions: 15420,
        clicks: 234,
        conversions: 8,
        spend: 2840,
        ctr: 1.52, // Below target of 2.5%
        cpa: 355,  // Above target of 45
        roas: 1.8, // Below target of 4.2
        conversion_rate: 3.42
      },
      targets: {
        ctr: 2.5,
        cpa: 45,
        roas: 4.2,
        conversion_rate: 2.8
      },
      platform_breakdown: {
        google_ads: { spend: 1704, conversions: 5, cpa: 340.8, roas: 2.1 },
        linkedin_ads: { spend: 1136, conversions: 3, cpa: 378.7, roas: 1.4 }
      },
      time_period: "Last 7 days",
      alerts: [
        { type: "performance", severity: "high", message: "CPA 689% above target" },
        { type: "budget", severity: "medium", message: "Daily spend 23% below allocation" },
        { type: "creative", severity: "high", message: "CTR declining for 5 consecutive days" }
      ]
    };

    setPerformanceData(mockData);
    analyzePerformance(mockData);
  }, []);

  // AI-powered performance analysis
  const analyzePerformance = (data) => {
    const generatedInsights = [];
    const recommendations = [];

    // Low CTR Analysis
    if (data.performance.ctr < data.targets.ctr) {
      generatedInsights.push({
        type: 'creative_performance',
        severity: 'high',
        title: 'Low Click-Through Rate Detected',
        description: `Current CTR of ${data.performance.ctr}% is ${((data.targets.ctr - data.performance.ctr) / data.targets.ctr * 100).toFixed(0)}% below target`,
        impact: 'High - Limiting campaign reach and increasing costs',
        action: 'competitor_analysis',
        actionLabel: 'Analyze Competitors',
        icon: '📉'
      });

      recommendations.push({
        priority: 'high',
        category: 'Creative Optimization',
        title: 'Refresh Ad Creatives',
        description: 'Current ads may be experiencing fatigue. Test new headlines and descriptions.',
        effort: 'Medium',
        impact: 'High',
        timeline: '2-3 days'
      });
    }

    // High CPA Analysis
    if (data.performance.cpa > data.targets.cpa * 1.5) {
      generatedInsights.push({
        type: 'cost_efficiency',
        severity: 'critical',
        title: 'Cost Per Acquisition Above Acceptable Range',
        description: `CPA of R$${data.performance.cpa} is ${((data.performance.cpa / data.targets.cpa - 1) * 100).toFixed(0)}% above target`,
        impact: 'Critical - Campaign profitability at risk',
        action: 'optimize_targeting',
        actionLabel: 'Optimize Targeting',
        icon: '💰'
      });

      recommendations.push({
        priority: 'critical',
        category: 'Bidding Strategy',
        title: 'Implement Smart Bidding',
        description: 'Switch to Target CPA bidding with historical conversion data.',
        effort: 'Low',
        impact: 'High',
        timeline: '1 day'
      });
    }

    // Platform Performance Analysis
    const underperformingPlatforms = Object.entries(data.platform_breakdown)
      .filter(([platform, metrics]) => metrics.roas < data.targets.roas * 0.7);

    if (underperformingPlatforms.length > 0) {
      generatedInsights.push({
        type: 'platform_optimization',
        severity: 'medium',
        title: 'Platform Performance Imbalance',
        description: `${underperformingPlatforms.map(([platform]) => platform).join(', ')} underperforming vs targets`,
        impact: 'Medium - Budget reallocation needed',
        action: 'rebalance_budget',
        actionLabel: 'Rebalance Budget',
        icon: '⚖️'
      });
    }

    setInsights(generatedInsights);
    setAiRecommendations(recommendations);
  };

  // Trigger competitor analysis
  const triggerCompetitorAnalysis = async () => {
    setLoading(true);
    try {
      // Simulate API call to competitor analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockCompetitorData = {
        analysis_date: new Date().toISOString(),
        competitors_analyzed: 5,
        key_findings: {
          market_trends: [
            "Competitors increasing ad spend by 34% in corporate segment",
            "New creative formats (video testimonials) gaining 45% more engagement",
            "LinkedIn campaigns showing 67% better B2B conversion rates"
          ],
          competitive_gaps: [
            "Alumni's heritage messaging underutilized vs competitors",
            "Competitors using more professional imagery and case studies",
            "Missing opportunity in executive-focused campaigns"
          ],
          winning_strategies: [
            {
              competitor: "CNA Corporate",
              strategy: "Executive testimonial videos",
              performance: "2.3x higher CTR",
              adaptation: "Create Alumni executive success stories"
            },
            {
              competitor: "Wizard Business",
              strategy: "LinkedIn Sponsored InMail campaigns",
              performance: "4.1x lower CPA",
              adaptation: "Test personalized InMail sequences"
            }
          ]
        },
        recommended_actions: [
          {
            action: "Creative Refresh",
            priority: "High",
            description: "Develop video testimonials featuring Alumni corporate success stories",
            expected_impact: "35-50% CTR improvement",
            timeline: "1-2 weeks"
          },
          {
            action: "Platform Strategy",
            priority: "High", 
            description: "Increase LinkedIn investment, add Sponsored InMail campaigns",
            expected_impact: "25-40% CPA reduction",
            timeline: "3-5 days"
          },
          {
            action: "Messaging Pivot",
            priority: "Medium",
            description: "Emphasize 60-year heritage and government recognition more prominently",
            expected_impact: "15-25% conversion rate improvement",
            timeline: "1 week"
          }
        ]
      };

      setCompetitorData(mockCompetitorData);
      setShowCompetitorAnalysis(true);
    } catch (error) {
      console.error('Competitor analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Execute AI recommendation
  const executeRecommendation = async (recommendation) => {
    setLoading(true);
    // Simulate implementation
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert(`✅ ${recommendation.title} has been implemented successfully!`);
    setLoading(false);
  };

  if (!performanceData) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <div>Loading performance data...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '20px', 
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        padding: '32px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            marginRight: '16px'
          }}>
            📊
          </div>
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              margin: '0 0 4px 0',
              lineHeight: '1.2'
            }}>
              Intelligent Performance Monitor
            </h1>
            <p style={{ 
              fontSize: '14px', 
              margin: 0,
              opacity: '0.9'
            }}>
              {performanceData.campaign_name} • {performanceData.time_period}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: performanceData.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500',
            border: `1px solid ${performanceData.status === 'active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
          }}>
            {performanceData.status === 'active' ? '🟢 Active' : '🔴 Paused'}
          </div>
          
          {performanceData.alerts.length > 0 && (
            <div style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              ⚠️ {performanceData.alerts.length} Alerts
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        {/* Performance Metrics */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1e293b' }}>
            Performance Overview
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            {[
              { 
                metric: 'CTR', 
                value: `${performanceData.performance.ctr}%`, 
                target: `${performanceData.targets.ctr}%`,
                status: performanceData.performance.ctr >= performanceData.targets.ctr ? 'good' : 'bad',
                change: '-0.8%'
              },
              { 
                metric: 'CPA', 
                value: `R$${performanceData.performance.cpa}`, 
                target: `R$${performanceData.targets.cpa}`,
                status: performanceData.performance.cpa <= performanceData.targets.cpa ? 'good' : 'bad',
                change: '+112%'
              },
              { 
                metric: 'ROAS', 
                value: `${performanceData.performance.roas}x`, 
                target: `${performanceData.targets.roas}x`,
                status: performanceData.performance.roas >= performanceData.targets.roas ? 'good' : 'bad',
                change: '-1.4x'
              },
              { 
                metric: 'Conversions', 
                value: performanceData.performance.conversions, 
                target: '22',
                status: performanceData.performance.conversions >= 22 ? 'good' : 'bad',
                change: '-14'
              }
            ].map(item => (
              <div key={item.metric} style={{
                padding: '20px',
                backgroundColor: item.status === 'good' ? '#f0fdf4' : '#fef2f2',
                border: `2px solid ${item.status === 'good' ? '#bbf7d0' : '#fecaca'}`,
                borderRadius: '12px'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#64748b', 
                  fontWeight: '500',
                  marginBottom: '4px'
                }}>
                  {item.metric}
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: item.status === 'good' ? '#059669' : '#dc2626',
                  marginBottom: '4px'
                }}>
                  {item.value}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Target: {item.target} 
                  <span style={{ 
                    color: item.status === 'good' ? '#059669' : '#dc2626',
                    fontWeight: '500',
                    marginLeft: '8px'
                  }}>
                    ({item.change})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1e293b' }}>
            🤖 AI Performance Insights
          </h2>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {insights.map((insight, index) => (
              <div key={index} style={{
                padding: '20px',
                backgroundColor: insight.severity === 'critical' ? '#fef2f2' : insight.severity === 'high' ? '#fef3c7' : '#f0f9ff',
                border: `2px solid ${insight.severity === 'critical' ? '#fecaca' : insight.severity === 'high' ? '#fed7aa' : '#bae6fd'}`,
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px', marginRight: '8px' }}>{insight.icon}</span>
                      <h3 style={{ 
                        fontSize: '16px', 
                        fontWeight: '700', 
                        margin: 0,
                        color: insight.severity === 'critical' ? '#dc2626' : insight.severity === 'high' ? '#d97706' : '#0369a1'
                      }}>
                        {insight.title}
                      </h3>
                    </div>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#4b5563', 
                      margin: '0 0 8px 0',
                      lineHeight: '1.5'
                    }}>
                      {insight.description}
                    </p>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: '600',
                      color: insight.severity === 'critical' ? '#b91c1c' : insight.severity === 'high' ? '#b45309' : '#075985'
                    }}>
                      Impact: {insight.impact}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (insight.action === 'competitor_analysis') {
                        triggerCompetitorAnalysis();
                      }
                    }}
                    disabled={loading}
                    style={{
                      backgroundColor: insight.severity === 'critical' ? '#dc2626' : insight.severity === 'high' ? '#d97706' : '#0369a1',
                      color: 'white',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      marginLeft: '16px'
                    }}
                  >
                    {loading ? 'Analyzing...' : insight.actionLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        {aiRecommendations.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1e293b' }}>
              💡 Optimization Recommendations
            </h2>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              {aiRecommendations.map((rec, index) => (
                <div key={index} style={{
                  padding: '20px',
                  backgroundColor: 'white',
                  border: `2px solid ${rec.priority === 'critical' ? '#fecaca' : rec.priority === 'high' ? '#fed7aa' : '#e2e8f0'}`,
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: rec.priority === 'critical' ? '#fef2f2' : rec.priority === 'high' ? '#fef3c7' : '#f0f9ff',
                          color: rec.priority === 'critical' ? '#dc2626' : rec.priority === 'high' ? '#d97706' : '#0369a1',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          marginRight: '12px'
                        }}>
                          {rec.priority.toUpperCase()}
                        </span>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#1e293b' }}>
                          {rec.title}
                        </h3>
                      </div>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#4b5563', 
                        margin: '0 0 12px 0',
                        lineHeight: '1.5'
                      }}>
                        {rec.description}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                        <span><strong>Effort:</strong> {rec.effort}</span>
                        <span><strong>Impact:</strong> {rec.impact}</span>
                        <span><strong>Timeline:</strong> {rec.timeline}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => executeRecommendation(rec)}
                      disabled={loading}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        marginLeft: '16px'
                      }}
                    >
                      {loading ? 'Implementing...' : 'Apply Fix'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Competitor Analysis Modal */}
      {showCompetitorAnalysis && competitorData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#1e293b' }}>
                🔍 Competitor Analysis Results
              </h2>
              <button 
                onClick={() => setShowCompetitorAnalysis(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{
                padding: '16px',
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                border: '1px solid #bae6fd',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '14px', color: '#0c4a6e', fontWeight: '600' }}>
                  Analysis completed: {competitorData.competitors_analyzed} competitors analyzed
                </div>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>
                Key Market Trends
              </h3>
              <ul style={{ fontSize: '14px', color: '#4b5563', paddingLeft: '16px', marginBottom: '24px' }}>
                {competitorData.key_findings.market_trends.map((trend, index) => (
                  <li key={index} style={{ marginBottom: '8px', lineHeight: '1.5' }}>{trend}</li>
                ))}
              </ul>

              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>
                Winning Strategies to Adopt
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {competitorData.key_findings.winning_strategies.map((strategy, index) => (
                  <div key={index} style={{
                    padding: '16px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#065f46', marginBottom: '4px' }}>
                      {strategy.competitor}: {strategy.strategy}
                    </div>
                    <div style={{ fontSize: '13px', color: '#047857', marginBottom: '8px' }}>
                      Performance: {strategy.performance}
                    </div>
                    <div style={{ fontSize: '13px', color: '#059669', fontWeight: '500' }}>
                      💡 Alumni Adaptation: {strategy.adaptation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => setShowCompetitorAnalysis(false)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Apply Insights to Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}