import React from 'react';
import styled from 'styled-components';

const HomeContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  max-width: 600px;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
  max-width: 800px;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #fff;
`;

const FeatureDescription = styled.p`
  font-size: 1rem;
  opacity: 0.8;
  line-height: 1.5;
`;

const ComingSoon = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
  border-radius: 50px;
  margin-top: 2rem;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const HomePage: React.FC = () => {
  return (
    <HomeContainer>
      <Title>📅 CalendarAI</Title>
      <Subtitle>
        Dynamic calendar with AI-powered scheduling and priority management
      </Subtitle>
      
      <FeatureGrid>
        <FeatureCard>
          <FeatureTitle>🤔 What-If Mode</FeatureTitle>
          <FeatureDescription>
            Explore scheduling scenarios without committing to changes, just like Cursor's Ask mode.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureTitle>🤖 Agent Mode</FeatureTitle>
          <FeatureDescription>
            Let AI make permanent changes to your calendar based on your priorities and preferences.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureTitle>📊 Priority Management</FeatureTitle>
          <FeatureDescription>
            Rank your life's responsibilities and let AI allocate time based on what matters most to you.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureTitle>📥 Export to Google</FeatureTitle>
          <FeatureDescription>
            Download .ics files to seamlessly import your AI-optimized schedule into Google Calendar.
          </FeatureDescription>
        </FeatureCard>
      </FeatureGrid>
      
      <ComingSoon>🚀 Setup Complete - Ready for Development!</ComingSoon>
    </HomeContainer>
  );
};

export default HomePage;
