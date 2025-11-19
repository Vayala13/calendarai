import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
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

const Section = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
`;

const SectionTitle = styled.h2`
  color: #667eea;
  margin-bottom: 20px;
  font-size: 1.8rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const Card = styled.div<{ color?: string }>`
  background: ${props => props.color || '#f5f7fa'};
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0,0,0,0.15);
  }
`;

const EventCard = styled(Card)`
  background: white;
  border-left: 4px solid ${props => props.color || '#667eea'};
`;

const PriorityCard = styled(Card)`
  color: white;
`;

const CardTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.3rem;
`;

const CardText = styled.p`
  margin: 5px 0;
  opacity: 0.9;
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
  const [events, setEvents] = useState<Event[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test connection
      const healthResponse = await fetch(`${API_URL}/health`);
      if (!healthResponse.ok) throw new Error('Server not responding');
      setConnected(true);

      // Fetch events
      const eventsResponse = await fetch(`${API_URL}/events?user_id=1`);
      if (!eventsResponse.ok) throw new Error('Failed to fetch events');
      const eventsData = await eventsResponse.json();
      setEvents(eventsData);

      // Fetch priorities
      const prioritiesResponse = await fetch(`${API_URL}/priorities?user_id=1`);
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
    <PageContainer>
      <ContentContainer>
        <Title>🎯 Backend API Test</Title>
        
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
            <small>Make sure the backend is running on http://localhost:3001</small>
          </ErrorMessage>
        )}

        {!loading && !error && (
          <>
            <Section>
              <SectionTitle>📊 Priorities ({priorities.length})</SectionTitle>
              <Grid>
                {priorities.map((priority) => (
                  <PriorityCard key={priority.priority_id} color={priority.color}>
                    <CardTitle>{priority.name}</CardTitle>
                    <CardText>Rank: {priority.rank}</CardText>
                    <CardText>📅 {priority.hours_per_week} hours/week</CardText>
                  </PriorityCard>
                ))}
              </Grid>
            </Section>

            <Section>
              <SectionTitle>📅 Events ({events.length})</SectionTitle>
              <Grid>
                {events.map((event) => (
                  <EventCard key={event.event_id} color={event.priority_color}>
                    <CardTitle style={{ color: '#333' }}>{event.title}</CardTitle>
                    <CardText style={{ color: '#666' }}>{event.description}</CardText>
                    <CardText style={{ color: '#999', fontSize: '0.9rem' }}>
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

            <Section style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)' }}>
              <h3 style={{ color: 'white', marginBottom: '15px' }}>🎉 Backend Working!</h3>
              <p style={{ color: 'white', opacity: 0.9 }}>
                Your API is successfully fetching data from MySQL database
              </p>
              <button 
                onClick={fetchData}
                style={{
                  marginTop: '20px',
                  padding: '12px 30px',
                  background: 'white',
                  color: '#667eea',
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

