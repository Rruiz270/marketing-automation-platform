import { useState, useEffect } from 'react';

export default function CompanyRegistration({ userId, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingData, setExistingData] = useState(null);
  const [formData, setFormData] = useState({
    // Company basics
    companyName: '',
    industry: '',
    targetPublic: '',
    geolocation: '',
    geolocationDetails: '',
    
    // Products & pricing
    products: [{ name: '', description: '', averageTicket: '' }],
    generalAverageTicket: '',
    
    // Competition
    competitors: ['', '', ''],
    differentials: '',
    
    // Marketing info
    marketingChallenges: '',
    currentChannels: [],
    currentCAC: '',
    expectedCAC: '',
    monthlyBudget: '',
    marketingObjectives: ''
  });

  const channels = [
    'Google Ads', 'Facebook Ads', 'Instagram Ads', 'LinkedIn Ads',
    'TikTok Ads', 'YouTube Ads', 'Email Marketing', 'SEO',
    'Content Marketing', 'Influencer Marketing', 'Affiliate Marketing'
  ];

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/company-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get',
          user_id: userId
        })
      });
      
      const data = await response.json();
      if (data.success && data.data) {
        setExistingData(data.data);
        setFormData(data.data);
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    }
    setLoading(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      products: updatedProducts
    }));
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { name: '', description: '', averageTicket: '' }]
    }));
  };

  const removeProduct = (index) => {
    if (formData.products.length > 1) {
      setFormData(prev => ({
        ...prev,
        products: prev.products.filter((_, i) => i !== index)
      }));
    }
  };

  const handleCompetitorChange = (index, value) => {
    const updatedCompetitors = [...formData.competitors];
    updatedCompetitors[index] = value;
    setFormData(prev => ({
      ...prev,
      competitors: updatedCompetitors
    }));
  };

  const handleChannelToggle = (channel) => {
    setFormData(prev => ({
      ...prev,
      currentChannels: prev.currentChannels.includes(channel)
        ? prev.currentChannels.filter(c => c !== channel)
        : [...prev.currentChannels, channel]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch('/api/company-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          user_id: userId,
          data: formData
        })
      });
      
      const result = await response.json();
      if (result.success) {
        if (onComplete) {
          onComplete(formData);
        }
      }
    } catch (error) {
      console.error('Error saving company data:', error);
    }
    
    setSaving(false);
  };

  const isFormValid = () => {
    return formData.companyName && 
           formData.industry && 
           formData.targetPublic && 
           formData.geolocation &&
           formData.monthlyBudget &&
           formData.marketingObjectives;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
        <div>Loading company information...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
          {existingData ? 'Update Company Profile' : 'Register Your Company'}
        </h2>
        <p style={{ fontSize: '16px', color: '#64748b' }}>
          This information helps our AI create personalized marketing strategies
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Company Basics */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>
            🏢 Company Information
          </h3>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="Alumni English School"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Industry *
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="Education / Language School"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Target Public *
                </label>
                <input
                  type="text"
                  value={formData.targetPublic}
                  onChange={(e) => handleChange('targetPublic', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="Professionals 25-45, Corporate teams"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Geolocation *
              </label>
              <input
                type="text"
                value={formData.geolocation}
                onChange={(e) => handleChange('geolocation', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '12px'
                }}
                placeholder="São Paulo, Brazil"
              />
              <textarea
                value={formData.geolocationDetails}
                onChange={(e) => handleChange('geolocationDetails', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  minHeight: '80px'
                }}
                placeholder="Detailed description: neighborhoods, regions, demographics..."
              />
            </div>
          </div>
        </div>

        {/* Products & Pricing */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>
            📦 Products & Pricing
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              General Average Ticket (R$)
            </label>
            <input
              type="number"
              value={formData.generalAverageTicket}
              onChange={(e) => handleChange('generalAverageTicket', e.target.value)}
              style={{
                width: '200px',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              placeholder="500"
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Products/Services</label>
              <button
                type="button"
                onClick={addProduct}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                + Add Product
              </button>
            </div>

            {formData.products.map((product, index) => (
              <div key={index} style={{ 
                padding: '16px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '8px', 
                marginBottom: '12px' 
              }}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px auto', gap: '12px', alignItems: 'end' }}>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                      placeholder="Product name"
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <input
                      type="number"
                      value={product.averageTicket}
                      onChange={(e) => handleProductChange(index, 'averageTicket', e.target.value)}
                      placeholder="Ticket (R$)"
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {formData.products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          width: '32px',
                          height: '32px'
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <textarea
                    value={product.description}
                    onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                    placeholder="Product description..."
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      minHeight: '60px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Competition */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>
            🎯 Competition Analysis
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>
              Three Main Competitors
            </label>
            {formData.competitors.map((competitor, index) => (
              <input
                key={index}
                type="text"
                value={competitor}
                onChange={(e) => handleCompetitorChange(index, e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '8px'
                }}
                placeholder={`Competitor ${index + 1}`}
              />
            ))}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              Your Differentials
            </label>
            <textarea
              value={formData.differentials}
              onChange={(e) => handleChange('differentials', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                minHeight: '100px'
              }}
              placeholder="What makes your company unique compared to competitors?"
            />
          </div>
        </div>

        {/* Marketing Info */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>
            📈 Marketing Information
          </h3>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Marketing Challenges
              </label>
              <textarea
                value={formData.marketingChallenges}
                onChange={(e) => handleChange('marketingChallenges', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  minHeight: '100px'
                }}
                placeholder="What are your main marketing challenges?"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>
                Current Acquisition Channels
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                {channels.map(channel => (
                  <label key={channel} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '8px',
                    backgroundColor: formData.currentChannels.includes(channel) ? '#e0e7ff' : '#f8fafc',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.currentChannels.includes(channel)}
                      onChange={() => handleChannelToggle(channel)}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ fontSize: '14px' }}>{channel}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Current CAC (R$)
                </label>
                <input
                  type="number"
                  value={formData.currentCAC}
                  onChange={(e) => handleChange('currentCAC', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="150"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Expected CAC (R$)
                </label>
                <input
                  type="number"
                  value={formData.expectedCAC}
                  onChange={(e) => handleChange('expectedCAC', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="100"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Monthly Budget (R$) *
                </label>
                <input
                  type="number"
                  value={formData.monthlyBudget}
                  onChange={(e) => handleChange('monthlyBudget', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="10000"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Marketing Objectives *
              </label>
              <textarea
                value={formData.marketingObjectives}
                onChange={(e) => handleChange('marketingObjectives', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  minHeight: '100px'
                }}
                placeholder="What are your main marketing goals? (e.g., increase enrollments by 30%, reduce CAC by 25%, expand to new segments)"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <button
            type="submit"
            disabled={!isFormValid() || saving}
            style={{
              padding: '16px 48px',
              backgroundColor: isFormValid() ? '#3b82f6' : '#94a3b8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isFormValid() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {saving ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                Saving...
              </>
            ) : (
              <>
                💾 {existingData ? 'Update Company Profile' : 'Save Company Profile'}
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}