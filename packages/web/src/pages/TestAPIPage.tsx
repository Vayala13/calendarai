import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme, themes } from '../context/ThemeContext';

const PageContainer = styled.div<{ isDark: boolean }>`
  min-height: 100vh;
  background: ${props => props.isDark 
    ? themes.dark.bgPrimary 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  padding: 40px 20px;
  transition: background 0.3s ease;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: white;
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 40px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

const StatusBadge = styled.div<{ connected: boolean }>`
  display: inline-block;
  padding: 10px 20px;
  border-radius: 20px;
  background: ${props => props.connected ? '#4CAF50' : '#f44336'};
  color: white;
  font-weight: 600;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
`;

const Section = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? themes.dark.bgCard : 'rgba(255, 255, 255, 0.95)'};
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: ${props => props.isDark ? themes.dark.shadow : '0 10px 30px rgba(0,0,0,0.3)'};
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
  transition: all 0.3s ease;
`;

const SectionTitle = styled.h2<{ isDark: boolean }>`
  color: ${props => props.isDark ? themes.dark.primary : '#667eea'};
  margin-bottom: 20px;
  font-size: 1.8rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const Card = styled.div<{ color?: string; isDark?: boolean }>`
  background: ${props => props.color || (props.isDark ? themes.dark.bgSecondary : '#f5f7fa')};
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0,0,0,0.15);
  }
`;

const EventCard = styled(Card)<{ isDark: boolean }>`
  background: ${props => props.isDark ? themes.dark.bgSecondary : 'white'};
  border-left: 4px solid ${props => props.color || '#667eea'};
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
  border-left: 4px solid ${props => props.color || (props.isDark ? themes.dark.primary : '#667eea')};
`;

const PriorityCard = styled(Card)`
  color: white;
`;

const CardTitle = styled.h3<{ isDark?: boolean }>`
  margin: 0 0 10px 0;
  font-size: 1.3rem;
  color: ${props => props.isDark ? themes.dark.textPrimary : '#333'};
`;

const CardText = styled.p<{ isDark?: boolean }>`
  margin: 5px 0;
  opacity: 0.9;
  color: ${props => props.isDark ? themes.dark.textSecondary : '#666'};
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
  color: white;
`;

const ErrorMessage = styled.div`
  background: #f44336;
  color: white;
  padding: 20px;
  border-radius: 10px;
  margin: 20px 0;
`;

const UserInfo = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? themes.dark.bgCard : 'rgba(255, 255, 255, 0.95)'};
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: ${props => props.isDark ? themes.dark.shadow : '0 10px 30px rgba(0,0,0,0.3)'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
  transition: all 0.3s ease;
`;

const UserDetails = styled.div<{ isDark: boolean }>`
  h3 {
    color: ${props => props.isDark ? themes.dark.primary : '#667eea'};
    margin: 0 0 5px 0;
  }
  p {
    color: ${props => props.isDark ? themes.dark.textSecondary : '#666'};
    margin: 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
`;

const ThemeToggle = styled.button<{ isDark: boolean }>`
  background: ${props => props.isDark ? themes.dark.bgHover : '#667eea'};
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: rotate(20deg) scale(1.1);
    background: ${props => props.isDark ? '#4c1d95' : '#5a6fd6'};
  }
`;

const LogoutButton = styled(Button)<{ isDark: boolean }>`
  background: ${props => props.isDark ? themes.dark.danger : '#f44336'};
  color: white;
`;

const HomeButton = styled(Link)<{ isDark: boolean }>`
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background: ${props => props.isDark ? themes.dark.primary : '#667eea'};
  color: white;
  text-decoration: none;
  display: inline-block;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    background: ${props => props.isDark ? themes.dark.primaryHover : '#5a6fd6'};
  }
`;

const DashboardButton = styled(Link)<{ isDark: boolean }>`
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background: ${props => props.isDark ? themes.dark.success : '#4CAF50'};
  color: white;
  text-decoration: none;
  display: inline-block;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
`;

interface Event {
  event_id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  priority_name: string;
  priority_color: string;
}

interface Priority {
  priority_id: number;
  name: string;
  rank: number;
  hours_per_week: string;
  color: string;
}

const API_URL = 'http://localhost:3001/api';

const TestAPIPage: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userStr));
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const healthResponse = await fetch(`${API_URL}/health`);
      if (!healthResponse.ok) throw new Error('Server not responding');
      setConnected(true);

      const eventsResponse = await fetch(`${API_URL}/events`, { headers });
      if (eventsResponse.status === 401 || eventsResponse.status === 403) {
        localStorage.clear();
        navigate('/login');
        return;
      }
      if (!eventsResponse.ok) throw new Error('Failed to fetch events');
      const eventsData = await eventsResponse.json();
      setEvents(eventsData);

      const prioritiesResponse = await fetch(`${API_URL}/priorities`, { headers });
      if (!prioritiesResponse.ok) throw new Error('Failed to fetch priorities');
      const prioritiesData = await prioritiesResponse.json();
      setPriorities(prioritiesData);

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
      setConnected(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <PageContainer isDark={isDark}>
      <ContentContainer>
        <Title>🎯 Backend API Test</Title>
        
        {user && (
          <UserInfo isDark={isDark}>
            <UserDetails isDark={isDark}>
              <h3>👋 Welcome, {user.username}!</h3>
              <p>📧 {user.email}</p>
              <p style={{ fontSize: '0.85rem', marginTop: '5px', color: isDark ? themes.dark.textMuted : '#999' }}>
                🆔 User ID: {user.user_id}
              </p>
            </UserDetails>
            <ButtonGroup>
              <ThemeToggle isDark={isDark} onClick={toggleTheme} title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
                {isDark ? '☀️' : '🌙'}
              </ThemeToggle>
              <DashboardButton to="/dashboard" isDark={isDark}>📊 Dashboard</DashboardButton>
              <HomeButton to="/" isDark={isDark}>🏠 Home</HomeButton>
              <LogoutButton isDark={isDark} onClick={handleLogout}>🚪 Logout</LogoutButton>
            </ButtonGroup>
          </UserInfo>
        )}
        
        <div style={{ textAlign: 'center' }}>
          <StatusBadge connected={connected}>
            {connected ? '✅ Backend Connected' : '❌ Backend Disconnected'}
          </StatusBadge>
        </div>

        {loading && <LoadingSpinner>⏳ Loading data from API...</LoadingSpinner>}

        {error && (
          <ErrorMessage>
            ❌ Error: {error}
            <br />
            <small>Make sure the backend is running on http://localhost:3001 and you're logged in</small>
          </ErrorMessage>
        )}

        {!loading && !error && (
          <>
            <Section isDark={isDark}>
              <SectionTitle isDark={isDark}>📊 Priorities ({priorities.length})</SectionTitle>
              <Grid>
                {priorities.map((priority) => (
                  <PriorityCard key={priority.priority_id} color={priority.color}>
                    <CardTitle style={{ color: 'white' }}>{priority.name}</CardTitle>
                    <CardText style={{ color: 'rgba(255,255,255,0.9)' }}>Rank: {priority.rank}</CardText>
                    <CardText style={{ color: 'rgba(255,255,255,0.9)' }}>📅 {priority.hours_per_week} hours/week</CardText>
                  </PriorityCard>
                ))}
              </Grid>
            </Section>

            <Section isDark={isDark}>
              <SectionTitle isDark={isDark}>📅 Events ({events.length})</SectionTitle>
              <Grid>
                {events.map((event) => (
                  <EventCard key={event.event_id} color={event.priority_color} isDark={isDark}>
                    <CardTitle isDark={isDark}>{event.title}</CardTitle>
                    <CardText isDark={isDark}>{event.description}</CardText>
                    <CardText style={{ color: isDark ? themes.dark.textMuted : '#999', fontSize: '0.9rem' }}>
                      🕐 {formatDate(event.start_time)}
                    </CardText>
                    <CardText style={{ 
                      color: event.priority_color, 
                      fontWeight: 600,
                      marginTop: '10px'
                    }}>
                      🏷️ {event.priority_name}
                    </CardText>
                  </EventCard>
                ))}
              </Grid>
            </Section>

            <Section isDark={isDark} style={{ 
              textAlign: 'center', 
              background: isDark 
                ? 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}>
              <h3 style={{ color: 'white', marginBottom: '15px' }}>🎉 Authenticated Backend Working!</h3>
              <p style={{ color: 'white', opacity: 0.9 }}>
                🔐 Your API is successfully fetching YOUR data from MySQL with JWT authentication
              </p>
              <p style={{ color: 'white', opacity: 0.7, fontSize: '0.9rem', marginTop: '10px' }}>
                All requests include your JWT token in the Authorization header
              </p>
              <button 
                onClick={fetchData}
                style={{
                  marginTop: '20px',
                  padding: '12px 30px',
                  background: 'white',
                  color: isDark ? '#4c1d95' : '#667eea',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                }}
              >
                🔄 Refresh Data
              </button>
            </Section>
          </>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default TestAPIPage;
