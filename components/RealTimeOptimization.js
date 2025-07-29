import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export default function RealTimeOptimization({ campaignId, userId }) {
  const [socket, setSocket] = useState(null);
  const [optimizationStatus, setOptimizationStatus] = useState('stopped');
  const [performanceData, setPerformanceData] = useState(null);
  const [recentOptimizations, setRecentOptimizations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize Socket.IO connection
  useEffect(() => {
    const socketConnection = io(process.env.NEXT_PUBLIC_SITE_URL || '', {
      path: '/api/socketio'
    });

    socketConnection.on('connect', () => {
      console.log('Connected to real-time optimization');
      socketConnection.emit('subscribe-campaign', campaignId);
    });

    socketConnection.on('optimization-executed', (data) => {
      setRecentOptimizations(prev => [data, ...prev.slice(0, 9)]); // Keep last 10
      fetchOptimizationStatus();
    });

    socketConnection.on('performance-alert', (alert) => {
      setAlerts(prev => [alert, ...prev.slice(0, 4)]); // Keep last 5
    });

    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, [campaignId]);

  // Fetch initial data
  useEffect(() => {
    fetchOptimizationStatus();
    fetchBudgetAnalysis();
    fetchPerformanceSnapshot();
  }, [campaignId]);

  const fetchOptimizationStatus = async () => {
    try {
      const response = await fetch('/api/optimization/real-time-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-optimization-status',
          campaignId
        })
      });
      const data = await response.json();
      if (data.success) {
        setOptimizationStatus(data.active ? 'running' : 'stopped');
      }
    } catch (error) {
      console.error('Error fetching optimization status:', error);
    }
  };

  const fetchBudgetAnalysis = async () => {
    try {
      const response = await fetch('/api/optimization/budget-rebalancer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze-budget-allocation',
          campaignId
        })
      });
      const data = await response.json();
      if (data.success) {
        setBudgetAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Error fetching budget analysis:', error);
    }
  };

  const fetchPerformanceSnapshot = async () => {
    try {
      const response = await fetch('/api/optimization/performance-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-performance-snapshot',
          campaignId
        })
      });
      const data = await response.json();
      if (data.success) {
        setPerformanceData(data.snapshot);
      }
    } catch (error) {
      console.error('Error fetching performance snapshot:', error);
    }
  };

  const startOptimization = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/optimization/real-time-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start-optimization',
          campaignId
        })
      });
      const data = await response.json();
      if (data.success) {
        setOptimizationStatus('running');
        
        // Start performance monitoring
        await fetch('/api/optimization/performance-monitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start-monitoring',
            campaignId
          })
        });
      }
    } catch (error) {
      console.error('Error starting optimization:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopOptimization = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/optimization/real-time-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stop-optimization',
          campaignId
        })
      });
      const data = await response.json();
      if (data.success) {
        setOptimizationStatus('stopped');
        
        // Stop performance monitoring
        await fetch('/api/optimization/performance-monitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'stop-monitoring',
            campaignId
          })
        });
      }
    } catch (error) {
      console.error('Error stopping optimization:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeRebalance = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/optimization/budget-rebalancer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute-rebalance',
          campaignId
        })
      });
      const data = await response.json();
      if (data.success) {
        // Refresh budget analysis
        await fetchBudgetAnalysis();
        alert(`Rebalance executed! ${data.rebalancing.executed.length} changes applied.`);
      }
    } catch (error) {
      console.error('Error executing rebalance:', error);
      alert('Error executing rebalance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1f2937' }}>
            🤖 Real-Time Optimization
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Autonomous campaign optimization powered by AI
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: optimizationStatus === 'running' ? '#10b981' : '#ef4444'
            }} />
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              {optimizationStatus === 'running' ? 'Active' : 'Stopped'}
            </span>
          </div>
          
          <button
            onClick={optimizationStatus === 'running' ? stopOptimization : startOptimization}
            disabled={loading}
            style={{
              backgroundColor: optimizationStatus === 'running' ? '#ef4444' : '#10b981',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Processing...' : optimizationStatus === 'running' ? 'Stop' : 'Start'} Optimization
          </button>
        </div>
      </div>

      {/* Performance Overview */}
      {performanceData && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>📊 Performance Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {performanceData.score?.toFixed(0) || 'N/A'}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Performance Score</div>
              <div style={{ fontSize: '12px', color: performanceData.trends?.shortTerm === 'improving' ? '#10b981' : '#ef4444', marginTop: '4px' }}>
                {performanceData.trends?.shortTerm === 'improving' ? '↗ Improving' : 
                 performanceData.trends?.shortTerm === 'declining' ? '↘ Declining' : '→ Stable'}
              </div>
            </div>
            
            {performanceData.current && (
              <>
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                    {performanceData.current.roas?.toFixed(2) || 'N/A'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Current ROAS</div>
                  {performanceData.baseline && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      vs {performanceData.baseline.avgROAS?.toFixed(2)} baseline
                    </div>
                  )}
                </div>
                
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                    {(performanceData.current.ctr * 100)?.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Current CTR</div>
                  {performanceData.baseline && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      vs {(performanceData.baseline.avgCTR * 100)?.toFixed(2)}% baseline
                    </div>
                  )}
                </div>
                
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                    ${performanceData.current.cpa?.toFixed(0) || 'N/A'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Cost per Acquisition</div>
                  {performanceData.baseline && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      vs ${performanceData.baseline.avgCPA?.toFixed(0)} baseline
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>🚨 Active Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {alerts.slice(0, 3).map((alert, index) => (
              <div
                key={alert.id || index}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: alert.severity === 'critical' ? '#fef2f2' : '#fef3c7',
                  border: `1px solid ${alert.severity === 'critical' ? '#fecaca' : '#fed7aa'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    {alert.message}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: alert.severity === 'critical' ? '#dc2626' : '#d97706',
                  color: 'white'
                }}>
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Analysis */}
      {budgetAnalysis && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>💰 Budget Optimization</h3>
            {budgetAnalysis.recommendations.length > 0 && (
              <button
                onClick={executeRebalance}
                disabled={loading}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                Execute Rebalance
              </button>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Current Allocation */}
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Current Allocation</h4>
              {budgetAnalysis.current.allocation.map((platform, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#374151' }}>{platform.platform}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>${platform.budget}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>ROAS: {platform.roas}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Recommendations */}
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                Recommendations ({budgetAnalysis.confidence}% confidence)
              </h4>
              {budgetAnalysis.recommendations.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                  No optimizations needed
                </div>
              ) : (
                budgetAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                        {rec.platform}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '500',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        backgroundColor: rec.priority === 'critical' ? '#dc2626' : 
                                       rec.priority === 'high' ? '#d97706' : '#059669',
                        color: 'white'
                      }}>
                        {rec.priority}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      {rec.action}: {rec.change || `$${rec.recommendedBudget}`}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '1px' }}>
                      {rec.reason}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Expected Impact */}
          {budgetAnalysis.expectedImpact && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#ecfdf5', borderRadius: '6px', border: '1px solid #d1fae5' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#065f46', marginBottom: '4px' }}>
                Expected Impact
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#047857' }}>
                <span>ROAS: {budgetAnalysis.expectedImpact.currentROAS} → {budgetAnalysis.expectedImpact.expectedROAS}</span>
                <span>Improvement: {budgetAnalysis.expectedImpact.roasImprovement}</span>
                <span>Revenue: +${budgetAnalysis.expectedImpact.revenueIncrease}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Optimizations */}
      {recentOptimizations.length > 0 && (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>⚡ Recent Optimizations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentOptimizations.slice(0, 5).map((opt, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                      {opt.recommendation?.type || 'Optimization'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      {opt.recommendation?.reason || 'Performance improvement'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      backgroundColor: opt.executed ? '#10b981' : '#ef4444',
                      color: 'white'
                    }}>
                      {opt.executed ? 'Success' : 'Failed'}
                    </span>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                      {new Date(opt.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {optimizationStatus === 'stopped' && (
        <div style={{ 
          marginTop: '24px', 
          padding: '16px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fed7aa',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#92400e', marginBottom: '8px' }}>
            🚀 Ready to Optimize Your Alumni Campaigns?
          </div>
          <div style={{ fontSize: '12px', color: '#d97706' }}>
            Start real-time optimization to automatically improve ROAS, reduce CPA, and maximize conversions
          </div>
        </div>
      )}
    </div>
  );
}