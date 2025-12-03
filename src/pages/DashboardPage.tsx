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

const Header = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? themes.dark.bgCard : 'rgba(255, 255, 255, 0.95)'};
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: ${props => props.isDark ? themes.dark.shadow : '0 10px 30px rgba(0,0,0,0.3)'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
  transition: all 0.3s ease;
`;

const WelcomeSection = styled.div<{ isDark: boolean }>`
  h1 {
    color: ${props => props.isDark ? themes.dark.primary : '#667eea'};
    margin: 0 0 10px 0;
    font-size: 2.5rem;
  }
  p {
    color: ${props => props.isDark ? themes.dark.textSecondary : '#666'};
    margin: 0;
    font-size: 1.1rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
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

const NavButton = styled(Link)<{ isDark: boolean }>`
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
  text-decoration: none;
  display: inline-block;
  background: ${props => props.isDark ? themes.dark.primary : '#667eea'};
  color: white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    background: ${props => props.isDark ? themes.dark.primaryHover : '#5568d3'};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div<{ color: string; isDark: boolean }>`
  background: ${props => props.color};
  border-radius: 15px;
  padding: 30px;
  color: white;
  box-shadow: ${props => props.isDark ? themes.dark.shadow : '0 10px 30px rgba(0,0,0,0.3)'};
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 3rem;
    font-weight: 700;
  }
  
  p {
    margin: 0;
    opacity: 0.9;
    font-size: 1.1rem;
  }
`;

const QuickActions = styled.div<{ isDark: boolean }>`
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
  margin: 0 0 20px 0;
  font-size: 1.8rem;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
`;

const ActionCard = styled(Link)<{ isDark: boolean }>`
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  border-radius: 10px;
  padding: 25px;
  text-align: center;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0,0,0,0.2);
  }
  
  div {
    font-size: 2rem;
    margin-bottom: 10px;
  }
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
  }
`;

const InfoSection = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? themes.dark.bgCard : 'rgba(255, 255, 255, 0.95)'};
  border-radius: 15px;
  padding: 30px;
  box-shadow: ${props => props.isDark ? themes.dark.shadow : '0 10px 30px rgba(0,0,0,0.3)'};
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
  transition: all 0.3s ease;
`;

const FeatureList = styled.ul<{ isDark: boolean }>`
  list-style: none;
  padding: 0;
  margin: 20px 0 0 0;
  
  li {
    padding: 15px;
    margin-bottom: 10px;
    background: ${props => props.isDark ? themes.dark.bgSecondary : '#f5f7fa'};
    border-radius: 8px;
    color: ${props => props.isDark ? themes.dark.textPrimary : '#333'};
    border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
    
    strong {
      color: ${props => props.isDark ? themes.dark.primary : '#667eea'};
    }
  }
`;

interface User {
  user_id: number;
  username: string;
  email: string;
}

const DashboardPage: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({ events: 0, priorities: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userStr));
    fetchStats(token);
  }, [navigate]);

  const fetchStats = async (token: string) => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [eventsRes, prioritiesRes] = await Promise.all([
        fetch('http://localhost:3001/api/events', { headers }),
        fetch('http://localhost:3001/api/priorities', { headers })
      ]);

      if (eventsRes.ok && prioritiesRes.ok) {
        const eventsData = await eventsRes.json();
        const prioritiesData = await prioritiesRes.json();
        
        setStats({
          events: eventsData.length,
          priorities: prioritiesData.length
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <PageContainer isDark={isDark}>
      <ContentContainer>
        <Header isDark={isDark}>
          <WelcomeSection isDark={isDark}>
            <h1>👋 Welcome back, {user.username}!</h1>
            <p>📧 {user.email}</p>
          </WelcomeSection>
          <ButtonGroup>
            <ThemeToggle isDark={isDark} onClick={toggleTheme} title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
              {isDark ? '☀️' : '🌙'}
            </ThemeToggle>
            <NavButton to="/" isDark={isDark}>🏠 Home</NavButton>
            <LogoutButton isDark={isDark} onClick={handleLogout}>🚪 Logout</LogoutButton>
          </ButtonGroup>
        </Header>

        <StatsGrid>
          <StatCard isDark={isDark} color={isDark 
            ? 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)' 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}>
            <h3>{loading ? '...' : stats.events}</h3>
            <p>📅 Calendar Events</p>
          </StatCard>
          
          <StatCard isDark={isDark} color={isDark 
            ? 'linear-gradient(135deg, #be185d 0%, #db2777 100%)' 
            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}>
            <h3>{loading ? '...' : stats.priorities}</h3>
            <p>⭐ Life Priorities</p>
          </StatCard>
          
          <StatCard isDark={isDark} color={isDark 
            ? 'linear-gradient(135deg, #0369a1 0%, #0891b2 100%)' 
            : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}>
            <h3>0</h3>
            <p>🤖 AI Scenarios</p>
          </StatCard>
        </StatsGrid>

        <QuickActions isDark={isDark}>
          <SectionTitle isDark={isDark}>🚀 Quick Actions</SectionTitle>
          <ActionGrid>
            <ActionCard to="/test" isDark={isDark}>
              <div>🎯</div>
              <h3>Test API</h3>
            </ActionCard>
            
            <ActionCard to="/calendar" isDark={isDark}>
              <div>📅</div>
              <h3>Calendar</h3>
            </ActionCard>
            
            <ActionCard to="/priorities" isDark={isDark}>
              <div>⭐</div>
              <h3>Priorities</h3>
            </ActionCard>
            
            <ActionCard to="/whatif" isDark={isDark}>
              <div>🤔</div>
              <h3>What-If Mode</h3>
            </ActionCard>
            
            <ActionCard to="/ai-agent" isDark={isDark}>
              <div>🤖</div>
              <h3>AI Agent Mode</h3>
            </ActionCard>
          </ActionGrid>
        </QuickActions>

        <InfoSection isDark={isDark}>
          <SectionTitle isDark={isDark}>✨ What's Next?</SectionTitle>
          <FeatureList isDark={isDark}>
            <li>
              <strong>✅ Phase 1 Complete:</strong> Authentication system is working! You can register, login, and access protected API endpoints.
            </li>
            <li>
              <strong>✅ Phase 2 Complete:</strong> Calendar Page - Full calendar interface with event management
            </li>
            <li>
              <strong>✅ Phase 3 Complete:</strong> Priority Management - Rank and manage your life priorities
            </li>
            <li>
              <strong>✅ Phase 4 Complete:</strong> What-If Mode - Test scheduling scenarios without committing
            </li>
            <li>
              <strong>🔜 Phase 5:</strong> AI Agent Mode - Let AI optimize your schedule automatically
            </li>
          </FeatureList>
        </InfoSection>
      </ContentContainer>
    </PageContainer>
  );
};

export default DashboardPage;
