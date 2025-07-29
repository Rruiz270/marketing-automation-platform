import { useState, useEffect } from 'react';

export default function AiServiceSelector({ 
  isOpen, 
  onClose, 
  onSelect, 
  availableServices = [], 
  defaultService = null,
  taskDescription = "AI task",
  allowSkip = true 
}) {
  const [selectedService, setSelectedService] = useState(defaultService?.service || '');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (isOpen && allowSkip) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Auto-select default service when countdown reaches 0
            if (defaultService) {
              onSelect(defaultService);
            }
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, allowSkip, defaultService, onSelect, onClose]);

  useEffect(() => {
    if (defaultService) {
      setSelectedService(defaultService.service);
    }
  }, [defaultService]);

  const handleSelect = () => {
    const service = availableServices.find(s => s.service === selectedService);
    if (service) {
      onSelect(service);
    }
    onClose();
  };

  const handleSkip = () => {
    if (defaultService) {
      onSelect(defaultService);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            margin: '0 0 8px 0',
            color: '#1e293b'
          }}>
            Choose AI Service
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: '#64748b',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Select which AI service to use for: <strong>{taskDescription}</strong>
          </p>
        </div>

        {/* Auto-select countdown */}
        {allowSkip && defaultService && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#f0f9ff',
            borderRadius: '12px',
            border: '1px solid #bae6fd',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#0369a1', fontWeight: '600' }}>
              Auto-selecting default service in {countdown} seconds
            </div>
            <div style={{ fontSize: '12px', color: '#0c4a6e', marginTop: '4px' }}>
              Default: {defaultService.service_name}
            </div>
          </div>
        )}

        {/* Service Selection */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {availableServices.map(service => (
              <div
                key={service.service}
                onClick={() => setSelectedService(service.service)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  border: selectedService === service.service ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: selectedService === service.service ? '#eff6ff' : 'white',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedService !== service.service) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedService !== service.service) {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: selectedService === service.service ? '2px solid #3b82f6' : '2px solid #d1d5db',
                  backgroundColor: selectedService === service.service ? '#3b82f6' : 'white',
                  marginRight: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedService === service.service && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'white'
                    }} />
                  )}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                      {service.service_name}
                    </span>
                    {service.is_default && (
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#d97706',
                        backgroundColor: '#fef3c7',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        border: '1px solid #fed7aa'
                      }}>
                        🌟 DEFAULT
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    Status: {service.status === 'active' ? '✅ Active' : '❌ Inactive'} • 
                    Category: {service.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0'
        }}>
          {allowSkip && (
            <button
              onClick={handleSkip}
              style={{
                backgroundColor: 'white',
                color: '#64748b',
                border: '2px solid #e2e8f0',
                padding: '12px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.color = '#475569';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.color = '#64748b';
              }}
            >
              Skip (Use Default)
            </button>
          )}
          
          <button
            onClick={handleSelect}
            disabled={!selectedService}
            style={{
              backgroundColor: selectedService ? '#3b82f6' : '#9ca3af',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: selectedService ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              boxShadow: selectedService ? '0 4px 12px -4px rgba(59, 130, 246, 0.4)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (selectedService) {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedService) {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'none';
              }
            }}
          >
            Use Selected Service
          </button>
        </div>
      </div>
    </div>
  );
}