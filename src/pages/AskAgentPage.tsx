import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../context/ThemeContext';
import ChatSidebar from '../components/ChatSidebar';

// ============ ANIMATIONS ============

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

// ============ THEME ============

const colors = {
  light: {
    bg: '#FAFAF9',
    bgCard: '#FFFFFF',
    text: '#1C1917',
    textSecondary: '#57534E',
    textMuted: '#A8A29E',
    accent: '#D97757',
    accentLight: '#FDEBE6',
    border: '#E7E5E4',
    success: '#22C55E',
    successLight: '#DCFCE7',
  },
  dark: {
    bg: '#0C0C0C',
    bgCard: '#1A1A1A',
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    accent: '#D97757',
    accentLight: '#2D1F1A',
    border: '#2A2A2A',
    success: '#22C55E',
    successLight: '#14532D',
  }
};

// ============ STYLED COMPONENTS ============

const PageContainer = styled.div<{ isDark: boolean }>`
  min-height: 100vh;
  background: ${props => props.isDark ? colors.dark.bg : colors.light.bg};
  padding: 40px 20px;
  transition: background 0.3s;
`;

const ContentContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  animation: ${fadeIn} 0.5s ease;
`;

const BackButton = styled(Link)<{ isDark: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.isDark ? colors.dark.textSecondary : colors.light.textSecondary};
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 20px;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.isDark ? colors.dark.bgCard : colors.light.bgCard};
    color: ${props => props.isDark ? colors.dark.text : colors.light.text};
  }
`;

const Title = styled.h1<{ isDark: boolean }>`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.isDark ? colors.dark.text : colors.light.text};
  margin: 0 0 12px 0;
  letter-spacing: -0.03em;
  
  span {
    background: linear-gradient(135deg, #D97757, #E8927A);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Subtitle = styled.p<{ isDark: boolean }>`
  font-size: 1.1rem;
  color: ${props => props.isDark ? colors.dark.textSecondary : colors.light.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

const InputSection = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? colors.dark.bgCard : colors.light.bgCard};
  border: 1px solid ${props => props.isDark ? colors.dark.border : colors.light.border};
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  animation: ${fadeIn} 0.5s ease 0.1s both;
`;

const TextArea = styled.textarea<{ isDark: boolean }>`
  width: 100%;
  min-height: 150px;
  padding: 20px;
  border: 2px solid ${props => props.isDark ? colors.dark.border : colors.light.border};
  border-radius: 16px;
  font-size: 1rem;
  line-height: 1.7;
  resize: vertical;
  background: ${props => props.isDark ? colors.dark.bg : colors.light.bg};
  color: ${props => props.isDark ? colors.dark.text : colors.light.text};
  font-family: inherit;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${colors.light.accent};
    box-shadow: 0 0 0 3px ${props => props.isDark ? 'rgba(217, 119, 87, 0.2)' : 'rgba(217, 119, 87, 0.1)'};
  }
  
  &::placeholder {
    color: ${props => props.isDark ? colors.dark.textMuted : colors.light.textMuted};
  }
`;

const ExamplePrompts = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
`;

const ExamplePrompt = styled.button<{ isDark: boolean }>`
  background: ${props => props.isDark ? colors.dark.accentLight : colors.light.accentLight};
  color: ${props => props.isDark ? '#E8927A' : colors.light.accent};
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(217, 119, 87, 0.2);
  }
`;

const GenerateButton = styled.button<{ isDark: boolean; isLoading: boolean }>`
  width: 100%;
  padding: 18px 30px;
  background: ${props => props.isLoading 
    ? `linear-gradient(90deg, ${colors.light.accent}, #E8927A, ${colors.light.accent})`
    : `linear-gradient(135deg, ${colors.light.accent}, #C4593D)`};
  background-size: ${props => props.isLoading ? '200% 100%' : '100% 100%'};
  animation: ${props => props.isLoading ? shimmer : 'none'} 1.5s infinite;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: ${props => props.isLoading ? 'wait' : 'pointer'};
  transition: all 0.2s;
  margin-top: 20px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(217, 119, 87, 0.35);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResultSection = styled.div<{ isDark: boolean }>`
  animation: ${fadeIn} 0.5s ease;
`;

const UnderstandingCard = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? colors.dark.bgCard : colors.light.bgCard};
  border: 1px solid ${props => props.isDark ? colors.dark.border : colors.light.border};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  
  h3 {
    font-size: 1rem;
    color: ${props => props.isDark ? colors.dark.textSecondary : colors.light.textSecondary};
    margin: 0 0 12px 0;
    font-weight: 600;
  }
  
  p {
    font-size: 1.05rem;
    color: ${props => props.isDark ? colors.dark.text : colors.light.text};
    margin: 0;
    line-height: 1.6;
  }
`;

const SectionTitle = styled.h2<{ isDark: boolean }>`
  font-size: 1.2rem;
  color: ${props => props.isDark ? colors.dark.text : colors.light.text};
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PrioritiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 30px;
`;

const PriorityCard = styled.div<{ color: string; isDark: boolean }>`
  background: ${props => props.isDark ? colors.dark.bgCard : colors.light.bgCard};
  border: 1px solid ${props => props.isDark ? colors.dark.border : colors.light.border};
  border-left: 4px solid ${props => props.color};
  border-radius: 12px;
  padding: 16px;
  
  .name {
    font-weight: 600;
    color: ${props => props.isDark ? colors.dark.text : colors.light.text};
    margin-bottom: 6px;
  }
  
  .hours {
    font-size: 0.85rem;
    color: ${props => props.isDark ? colors.dark.textSecondary : colors.light.textSecondary};
  }
  
  .rank {
    font-size: 0.75rem;
    color: ${props => props.isDark ? colors.dark.textMuted : colors.light.textMuted};
    margin-top: 4px;
  }
`;

const SchedulePreview = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? colors.dark.bgCard : colors.light.bgCard};
  border: 1px solid ${props => props.isDark ? colors.dark.border : colors.light.border};
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
`;

const DaySection = styled.div<{ isDark: boolean }>`
  border-bottom: 1px solid ${props => props.isDark ? colors.dark.border : colors.light.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const DayHeader = styled.div<{ isDark: boolean }>`
  padding: 14px 20px;
  background: ${props => props.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
  font-weight: 600;
  color: ${props => props.isDark ? colors.dark.text : colors.light.text};
  font-size: 0.95rem;
`;

const EventsList = styled.div`
  padding: 12px 20px;
`;

const EventItem = styled.div<{ color: string; isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid ${props => props.isDark ? colors.dark.border : colors.light.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  .color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => props.color};
    flex-shrink: 0;
  }
  
  .time {
    font-size: 0.85rem;
    color: ${props => props.isDark ? colors.dark.textMuted : colors.light.textMuted};
    min-width: 110px;
  }
  
  .title {
    flex: 1;
    color: ${props => props.isDark ? colors.dark.text : colors.light.text};
    font-weight: 500;
  }
`;

const ModifySection = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? colors.dark.bgCard : colors.light.bgCard};
  border: 1px solid ${props => props.isDark ? colors.dark.border : colors.light.border};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
`;

const ModifyInput = styled.input<{ isDark: boolean }>`
  width: 100%;
  padding: 14px 18px;
  border: 2px solid ${props => props.isDark ? colors.dark.border : colors.light.border};
  border-radius: 12px;
  font-size: 0.95rem;
  background: ${props => props.isDark ? colors.dark.bg : colors.light.bg};
  color: ${props => props.isDark ? colors.dark.text : colors.light.text};
  
  &:focus {
    outline: none;
    border-color: ${colors.light.accent};
  }
  
  &::placeholder {
    color: ${props => props.isDark ? colors.dark.textMuted : colors.light.textMuted};
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant: 'primary' | 'secondary' | 'success'; isDark: boolean }>`
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${props => {
    switch (props.variant) {
      case 'success':
        return `
          background: linear-gradient(135deg, #22C55E, #16A34A);
          color: white;
          &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3); }
        `;
      case 'secondary':
        return `
          background: ${props.isDark ? colors.dark.bgCard : colors.light.bgCard};
          color: ${props.isDark ? colors.dark.text : colors.light.text};
          border: 2px solid ${props.isDark ? colors.dark.border : colors.light.border};
          &:hover { border-color: ${colors.light.accent}; }
        `;
      default:
        return `
          background: linear-gradient(135deg, ${colors.light.accent}, #C4593D);
          color: white;
          &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(217, 119, 87, 0.3); }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? colors.dark.successLight : colors.light.successLight};
  border: 1px solid ${colors.light.success};
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  animation: ${pulse} 0.5s ease;
  
  h3 {
    color: ${colors.light.success};
    margin: 0 0 12px 0;
    font-size: 1.3rem;
  }
  
  p {
    color: ${props => props.isDark ? colors.dark.textSecondary : colors.light.textSecondary};
    margin: 0 0 20px 0;
  }
`;

const LoadingState = styled.div<{ isDark: boolean }>`
  text-align: center;
  padding: 60px 20px;
  
  .icon {
    font-size: 3rem;
    margin-bottom: 20px;
    animation: ${pulse} 1.5s ease infinite;
  }
  
  p {
    color: ${props => props.isDark ? colors.dark.textSecondary : colors.light.textSecondary};
    font-size: 1.1rem;
  }
`;

// ============ INTERFACES ============

interface Priority {
  name: string;
  rank: number;
  hours_per_week: number;
  color: string;
  description?: string;
}

interface ScheduleEvent {
  title: string;
  priority_name: string;
  day: string;
  start_time: string;
  end_time: string;
  start_datetime: string;
  end_datetime: string;
  description?: string;
}

interface GeneratedSchedule {
  understood: string;
  priorities: Priority[];
  events: ScheduleEvent[];
  suggestions: string[];
  weekStart: string;
}

// ============ COMPONENT ============

const AskAgentPage: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
  const [modification, setModification] = useState('');
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const examplePrompts = [
    "I'm starting a 9-5 job with 30min commute, want to workout 3x/week",
    "College student with classes MWF, need study time and gym",
    "Remote worker, want work-life balance with family time",
    "Freelancer with flexible hours, need structure for productivity"
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const handleGenerate = async () => {
    if (!description.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setSchedule(null);
    setApplied(false);

    try {
      const response = await fetch('http://localhost:3001/api/agent/generate-schedule', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ description })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate schedule');
      }

      setSchedule(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModify = async () => {
    if (!modification.trim() || !schedule) return;
    
    setIsModifying(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/agent/modify-schedule', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentSchedule: schedule,
          modification
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to modify schedule');
      }

      setSchedule(data);
      setModification('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsModifying(false);
    }
  };

  const handleApply = async (clearExisting: boolean) => {
    if (!schedule) return;
    
    setIsApplying(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/agent/apply-schedule', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          priorities: schedule.priorities,
          events: schedule.events,
          clearExisting
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply schedule');
      }

      setApplied(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsApplying(false);
    }
  };

  const getPriorityColor = (priorityName: string) => {
    const priority = schedule?.priorities.find(p => p.name === priorityName);
    return priority?.color || '#9CA3AF';
  };

  // Group events by day
  const eventsByDay = schedule?.events.reduce((acc, event) => {
    if (!acc[event.day]) acc[event.day] = [];
    acc[event.day].push(event);
    return acc;
  }, {} as Record<string, ScheduleEvent[]>) || {};

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const formatTime = (time: string) => {
    const [hour, min] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${min.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <PageContainer isDark={isDark}>
      <ContentContainer>
        <Header>
          <BackButton to="/dashboard" isDark={isDark}>← Back to Dashboard</BackButton>
          <Title isDark={isDark}>
            ✨ Ask <span>Agent Mode</span>
          </Title>
          <Subtitle isDark={isDark}>
            Describe your life situation and let AI create your perfect schedule
          </Subtitle>
        </Header>

        {!schedule && !isGenerating && (
          <InputSection isDark={isDark}>
            <TextArea
              isDark={isDark}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your schedule, work, commitments, and goals...

Example: I just finished school and I'm starting a new job next week. I'll be working Monday to Friday, 9 AM to 5 PM. My commute is about 30 minutes each way. I want to workout at the gym 3 times a week, preferably in the mornings. I also want to read for at least 30 minutes each day before bed."
            />
            <ExamplePrompts>
              {examplePrompts.map((prompt, i) => (
                <ExamplePrompt
                  key={i}
                  isDark={isDark}
                  onClick={() => setDescription(prompt)}
                >
                  {prompt}
                </ExamplePrompt>
              ))}
            </ExamplePrompts>
            <GenerateButton
              isDark={isDark}
              isLoading={false}
              onClick={handleGenerate}
              disabled={!description.trim()}
            >
              ✨ Generate My Schedule
            </GenerateButton>
          </InputSection>
        )}

        {isGenerating && (
          <LoadingState isDark={isDark}>
            <div className="icon">🧠</div>
            <p>Claude is analyzing your life and creating the perfect schedule...</p>
          </LoadingState>
        )}

        {error && (
          <UnderstandingCard isDark={isDark} style={{ borderColor: '#EF4444' }}>
            <h3 style={{ color: '#EF4444' }}>⚠️ Error</h3>
            <p>{error}</p>
            <ActionButton
              variant="secondary"
              isDark={isDark}
              onClick={() => { setError(null); setSchedule(null); }}
              style={{ marginTop: '12px' }}
            >
              Try Again
            </ActionButton>
          </UnderstandingCard>
        )}

        {schedule && !applied && (
          <ResultSection isDark={isDark}>
            <UnderstandingCard isDark={isDark}>
              <h3>🧠 I understood:</h3>
              <p>{schedule.understood}</p>
            </UnderstandingCard>

            <SectionTitle isDark={isDark}>🎯 Your Priorities</SectionTitle>
            <PrioritiesGrid>
              {schedule.priorities.map((priority, i) => (
                <PriorityCard key={i} color={priority.color} isDark={isDark}>
                  <div className="name">{priority.name}</div>
                  <div className="hours">{priority.hours_per_week}h / week</div>
                  <div className="rank">Rank #{priority.rank}</div>
                </PriorityCard>
              ))}
            </PrioritiesGrid>

            <SectionTitle isDark={isDark}>📅 Your Week</SectionTitle>
            <SchedulePreview isDark={isDark}>
              {dayOrder.map(day => eventsByDay[day] && (
                <DaySection key={day} isDark={isDark}>
                  <DayHeader isDark={isDark}>{day}</DayHeader>
                  <EventsList>
                    {eventsByDay[day]
                      .sort((a, b) => a.start_time.localeCompare(b.start_time))
                      .map((event, i) => (
                        <EventItem key={i} color={getPriorityColor(event.priority_name)} isDark={isDark}>
                          <div className="color-dot" />
                          <div className="time">{formatTime(event.start_time)} - {formatTime(event.end_time)}</div>
                          <div className="title">{event.title}</div>
                        </EventItem>
                      ))}
                  </EventsList>
                </DaySection>
              ))}
            </SchedulePreview>

            <ModifySection isDark={isDark}>
              <SectionTitle isDark={isDark}>🔄 Want to change something?</SectionTitle>
              <ModifyInput
                isDark={isDark}
                value={modification}
                onChange={(e) => setModification(e.target.value)}
                placeholder="e.g., Move workouts to evenings, add lunch break, remove Saturday..."
                onKeyPress={(e) => e.key === 'Enter' && handleModify()}
              />
              <ButtonRow>
                <ActionButton
                  variant="secondary"
                  isDark={isDark}
                  onClick={handleModify}
                  disabled={!modification.trim() || isModifying}
                >
                  {isModifying ? '🔄 Updating...' : '🔄 Update Schedule'}
                </ActionButton>
              </ButtonRow>
            </ModifySection>

            <ButtonRow>
              <ActionButton
                variant="success"
                isDark={isDark}
                onClick={() => handleApply(false)}
                disabled={isApplying}
              >
                {isApplying ? '⏳ Applying...' : '✅ Add to My Calendar'}
              </ActionButton>
              <ActionButton
                variant="primary"
                isDark={isDark}
                onClick={() => handleApply(true)}
                disabled={isApplying}
              >
                🔄 Replace Everything
              </ActionButton>
              <ActionButton
                variant="secondary"
                isDark={isDark}
                onClick={() => { setSchedule(null); setDescription(''); }}
              >
                Start Over
              </ActionButton>
            </ButtonRow>
          </ResultSection>
        )}

        {applied && (
          <SuccessMessage isDark={isDark}>
            <h3>🎉 Schedule Applied!</h3>
            <p>Your priorities and events have been created.</p>
            <ButtonRow style={{ justifyContent: 'center' }}>
              <ActionButton variant="primary" isDark={isDark} onClick={() => navigate('/calendar')}>
                📅 View Calendar
              </ActionButton>
              <ActionButton variant="secondary" isDark={isDark} onClick={() => { setApplied(false); setSchedule(null); setDescription(''); }}>
                Create Another
              </ActionButton>
            </ButtonRow>
          </SuccessMessage>
        )}
      </ContentContainer>
      
      <ChatSidebar isDark={isDark} />
    </PageContainer>
  );
};

export default AskAgentPage;

