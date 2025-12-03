import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme, themes } from '../context/ThemeContext';

const HomeContainer = styled.div<{ isDark: boolean }>`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.isDark 
    ? themes.dark.bgPrimary 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  text-align: center;
  padding: 20px;
  transition: background 0.3s ease;
  position: relative;
`;

const ThemeToggleWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
`;

const ThemeToggle = styled.button<{ isDark: boolean }>`
  background: ${props => props.isDark ? themes.dark.bgCard : 'rgba(255, 255, 255, 0.2)'};
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : '1px solid rgba(255,255,255,0.3)'};
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: rotate(20deg) scale(1.1);
    background: ${props => props.isDark ? '#4c1d95' : 'rgba(255, 255, 255, 0.3)'};
  }
`;

const Title = styled.h1<{ isDark: boolean }>`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: ${props => props.isDark ? '0 2px 10px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.3)'};
  color: ${props => props.isDark ? themes.dark.textPrimary : 'white'};
`;

const Subtitle = styled.p<{ isDark: boolean }>`
  font-size: 1.5rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  max-width: 600px;
  color: ${props => props.isDark ? themes.dark.textSecondary : 'white'};
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
  max-width: 800px;
`;

const FeatureCard = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark 
    ? themes.dark.bgCard 
    : 'rgba(255, 255, 255, 0.15)'};
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 15px;
  border: 1px solid ${props => props.isDark ? themes.dark.borderColor : 'rgba(255, 255, 255, 0.2)'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.isDark 
      ? '0 10px 30px rgba(0,0,0,0.4)' 
      : '0 10px 30px rgba(0,0,0,0.2)'};
  }
`;

const FeatureTitle = styled.h3<{ isDark: boolean }>`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: ${props => props.isDark ? themes.dark.textPrimary : '#fff'};
`;

const FeatureDescription = styled.p<{ isDark: boolean }>`
  font-size: 1rem;
  opacity: 0.8;
  line-height: 1.5;
  color: ${props => props.isDark ? themes.dark.textSecondary : 'white'};
`;

const ComingSoon = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)' 
    : 'rgba(255, 255, 255, 0.2)'};
  padding: 1rem 2rem;
  border-radius: 50px;
  margin-top: 2rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: white;
  border: ${props => props.isDark ? '1px solid rgba(139, 92, 246, 0.3)' : 'none'};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const PrimaryButton = styled(Link)<{ isDark: boolean }>`
  display: inline-block;
  padding: 1rem 2.5rem;
  background: ${props => props.isDark ? themes.dark.primary : 'rgba(255, 255, 255, 0.95)'};
  color: ${props => props.isDark ? 'white' : '#667eea'};
  text-decoration: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.4);
    background: ${props => props.isDark ? themes.dark.primaryHover : 'white'};
  }
`;

const SecondaryButton = styled(Link)<{ isDark: boolean }>`
  display: inline-block;
  padding: 1rem 2.5rem;
  background: transparent;
  color: ${props => props.isDark ? themes.dark.textPrimary : 'white'};
  text-decoration: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1rem;
  border: 2px solid ${props => props.isDark ? themes.dark.borderColor : 'rgba(255, 255, 255, 0.8)'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    background: ${props => props.isDark ? themes.dark.bgCard : 'rgba(255, 255, 255, 0.1)'};
    border-color: ${props => props.isDark ? themes.dark.primary : 'white'};
  }
`;

const TestButton = styled(Link)<{ isDark: boolean }>`
  display: inline-block;
  margin-top: 2rem;
  padding: 1rem 2.5rem;
  background: ${props => props.isDark ? themes.dark.bgCard : 'rgba(255, 255, 255, 0.95)'};
  color: ${props => props.isDark ? themes.dark.primary : '#667eea'};
  text-decoration: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.4);
    background: ${props => props.isDark ? themes.dark.bgHover : 'white'};
  }
`;

const HomePage: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <HomeContainer isDark={isDark}>
      <ThemeToggleWrapper>
        <ThemeToggle isDark={isDark} onClick={toggleTheme} title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
          {isDark ? '☀️' : '🌙'}
        </ThemeToggle>
      </ThemeToggleWrapper>
      
      <Title isDark={isDark}>📅 CalendarAI</Title>
      <Subtitle isDark={isDark}>
        Dynamic calendar with AI-powered scheduling and priority management
      </Subtitle>
      
      <FeatureGrid>
        <FeatureCard isDark={isDark}>
          <FeatureTitle isDark={isDark}>🤔 What-If Mode</FeatureTitle>
          <FeatureDescription isDark={isDark}>
            Explore scheduling scenarios without committing to changes, just like Cursor's Ask mode.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard isDark={isDark}>
          <FeatureTitle isDark={isDark}>🤖 Agent Mode</FeatureTitle>
          <FeatureDescription isDark={isDark}>
            Let AI make permanent changes to your calendar based on your priorities and preferences.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard isDark={isDark}>
          <FeatureTitle isDark={isDark}>📊 Priority Management</FeatureTitle>
          <FeatureDescription isDark={isDark}>
            Rank your life's responsibilities and let AI allocate time based on what matters most to you.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard isDark={isDark}>
          <FeatureTitle isDark={isDark}>📥 Export to Google</FeatureTitle>
          <FeatureDescription isDark={isDark}>
            Download .ics files to seamlessly import your AI-optimized schedule into Google Calendar.
          </FeatureDescription>
        </FeatureCard>
      </FeatureGrid>
      
      <ComingSoon isDark={isDark}>🚀 Full-Stack App with Authentication!</ComingSoon>
      
      <ButtonGroup>
        <PrimaryButton to="/login" isDark={isDark}>
          🔐 Login
        </PrimaryButton>
        <SecondaryButton to="/register" isDark={isDark}>
          ✨ Register
        </SecondaryButton>
      </ButtonGroup>

      <TestButton to="/calendar" isDark={isDark}>
        📅 Go to Calendar
      </TestButton>
    </HomeContainer>
  );
};

export default HomePage;
