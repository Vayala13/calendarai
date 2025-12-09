import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface Props {
  isDark: boolean;
  onClose: () => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? '#1f2937' : 'white'};
  border-radius: 20px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const Title = styled.h2<{ isDark: boolean }>`
  color: ${props => props.isDark ? '#60a5fa' : '#1d4ed8'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.4rem;
`;

const CloseButton = styled.button<{ isDark: boolean }>`
  background: ${props => props.isDark ? '#374151' : '#f0f0f0'};
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.isDark ? '#4b5563' : '#e0e0e0'};
  }
`;

const StatusSection = styled.div<{ isDark: boolean; connected: boolean }>`
  background: ${props => {
    if (props.connected) return props.isDark ? '#064e3b' : '#d1fae5';
    return props.isDark ? '#374151' : '#f3f4f6';
  }};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const StatusIcon = styled.div<{ connected: boolean }>`
  font-size: 2rem;
`;

const StatusText = styled.div`
  flex: 1;
  
  h4 {
    margin: 0 0 5px 0;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

const GoogleButton = styled.button<{ isDark: boolean; variant?: 'connect' | 'disconnect' }>`
  width: 100%;
  padding: 15px 25px;
  border-radius: 12px;
  border: ${props => props.variant === 'disconnect' 
    ? `2px solid ${props.isDark ? '#ef4444' : '#dc2626'}` 
    : 'none'};
  background: ${props => props.variant === 'disconnect' 
    ? 'transparent' 
    : 'white'};
  color: ${props => props.variant === 'disconnect' 
    ? (props.isDark ? '#ef4444' : '#dc2626') 
    : '#333'};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s;
  box-shadow: ${props => props.variant === 'disconnect' 
    ? 'none' 
    : '0 2px 10px rgba(0,0,0,0.1)'};
  margin-bottom: 15px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  img {
    width: 24px;
    height: 24px;
  }
`;

const SyncOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
`;

const SyncButton = styled.button<{ isDark: boolean }>`
  padding: 12px 20px;
  border-radius: 10px;
  border: 2px solid ${props => props.isDark ? '#3b82f6' : '#2563eb'};
  background: transparent;
  color: ${props => props.isDark ? '#60a5fa' : '#2563eb'};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.isDark ? '#1e3a8a' : '#dbeafe'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ type: 'success' | 'error' }>`
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  background: ${props => props.type === 'success' ? '#d1fae5' : '#fee2e2'};
  color: ${props => props.type === 'success' ? '#065f46' : '#991b1b'};
  font-size: 0.9rem;
`;

const InfoBox = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? '#1e3a8a' : '#dbeafe'};
  border-radius: 10px;
  padding: 15px;
  margin-top: 20px;
  font-size: 0.85rem;
  color: ${props => props.isDark ? '#93c5fd' : '#1e40af'};
  
  strong {
    display: block;
    margin-bottom: 8px;
  }
`;

const GoogleCalendarSync: React.FC<Props> = ({ isDark, onClose }) => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkConnection();
    
    // Check URL params for OAuth result
    const params = new URLSearchParams(window.location.search);
    if (params.get('google') === 'connected') {
      setMessage({ type: 'success', text: 'Google Calendar connected successfully!' });
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('error')) {
      setMessage({ type: 'error', text: 'Failed to connect Google Calendar. Please try again.' });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const checkConnection = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/google/status', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setConnected(data.connected);
    } catch (error) {
      console.error('Failed to check Google connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/google/auth-url', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to start Google connection' });
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect Google Calendar? This will not delete any events.')) {
      return;
    }
    
    try {
      await fetch('http://localhost:3001/api/google/disconnect', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      setConnected(false);
      setMessage({ type: 'success', text: 'Google Calendar disconnected' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disconnect' });
    }
  };

  const handleSyncToGoogle = async () => {
    setSyncing(true);
    try {
      const response = await fetch('http://localhost:3001/api/google/sync-to-google', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setMessage({ type: 'success', text: data.message });
    } catch (error) {
      setMessage({ type: 'error', text: 'Sync failed. Please try again.' });
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncFromGoogle = async () => {
    setSyncing(true);
    try {
      const response = await fetch('http://localhost:3001/api/google/sync-from-google', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setMessage({ type: 'success', text: data.message });
      // Reload the page to show new events
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Import failed. Please try again.' });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <ModalOverlay onClick={onClose}>
        <Modal isDark={isDark} onClick={e => e.stopPropagation()}>
          <Title isDark={isDark}>Loading...</Title>
        </Modal>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay onClick={onClose}>
      <Modal isDark={isDark} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <Title isDark={isDark}>
            📅 Google Calendar
          </Title>
          <CloseButton isDark={isDark} onClick={onClose}>✕</CloseButton>
        </ModalHeader>

        {message && (
          <Message type={message.type}>{message.text}</Message>
        )}

        <StatusSection isDark={isDark} connected={connected}>
          <StatusIcon connected={connected}>
            {connected ? '✅' : '🔗'}
          </StatusIcon>
          <StatusText style={{ color: isDark ? '#e5e7eb' : '#1f2937' }}>
            <h4>{connected ? 'Connected' : 'Not Connected'}</h4>
            <p>
              {connected 
                ? 'Your Google Calendar is synced with CalendarAI' 
                : 'Connect to sync events with Google Calendar'}
            </p>
          </StatusText>
        </StatusSection>

        {!connected ? (
          <>
            <GoogleButton isDark={isDark} onClick={handleConnect}>
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
              />
              Sign in with Google
            </GoogleButton>
            
            <InfoBox isDark={isDark}>
              <strong>🔒 Privacy Note</strong>
              CalendarAI only accesses your calendar events. We never read your emails or other data.
            </InfoBox>
          </>
        ) : (
          <>
            <SyncOptions>
              <SyncButton isDark={isDark} onClick={handleSyncToGoogle} disabled={syncing}>
                ⬆️ {syncing ? 'Syncing...' : 'Push Events to Google Calendar'}
              </SyncButton>
              <SyncButton isDark={isDark} onClick={handleSyncFromGoogle} disabled={syncing}>
                ⬇️ {syncing ? 'Importing...' : 'Import Events from Google Calendar'}
              </SyncButton>
            </SyncOptions>
            
            <GoogleButton 
              isDark={isDark} 
              variant="disconnect" 
              onClick={handleDisconnect}
              style={{ marginTop: '25px' }}
            >
              Disconnect Google Calendar
            </GoogleButton>
          </>
        )}
      </Modal>
    </ModalOverlay>
  );
};

export default GoogleCalendarSync;

