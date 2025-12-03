import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon, FaRobot, FaCalendarPlus, FaChartLine, FaLightbulb, FaCheck, FaTimes } from 'react-icons/fa';

// ============ ANIMATIONS ============

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
  50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// ============ STYLED COMPONENTS ============

const PageContainer = styled.div<{ isDark: boolean }>`
  min-height: 100vh;
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'};
  padding: 20px;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const RobotIcon = styled.div`
  font-size: 3rem;
  animation: ${float} 3s ease-in-out infinite;
`;

const Title = styled.h1`
  color: white;
  margin: 0;
  font-size: 2rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
  
  span {
    background: linear-gradient(90deg, #a78bfa, #f472b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const HeaderButton = styled(Link)`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const ThemeToggle = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(180deg);
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)'};
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)'};
`;

const CardTitle = styled.h2<{ isDark: boolean }>`
  color: ${props => props.isDark ? '#a78bfa' : '#7c3aed'};
  margin: 0 0 20px 0;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AnalysisSection = styled(Card)`
  grid-column: 1 / -1;
`;

const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InsightItem = styled.div<{ type: string; isDark: boolean }>`
  padding: 15px 20px;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: ${props => {
    switch (props.type) {
      case 'critical': return props.isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2';
      case 'warning': return props.isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7';
      case 'success': return props.isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7';
      default: return props.isDark ? 'rgba(139, 92, 246, 0.2)' : '#ede9fe';
    }
  }};
  border-left: 4px solid ${props => {
    switch (props.type) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'success': return '#22c55e';
      default: return '#8b5cf6';
    }
  }};
  
  .message {
    flex: 1;
    color: ${props => props.isDark ? '#e5e7eb' : '#1f2937'};
    font-size: 0.95rem;
    line-height: 1.5;
  }
`;

const PriorityProgress = styled.div<{ isDark: boolean }>`
  margin-bottom: 15px;
  
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    
    .name {
      font-weight: 600;
      color: ${props => props.isDark ? '#e5e7eb' : '#1f2937'};
    }
    
    .stats {
      font-size: 0.85rem;
      color: ${props => props.isDark ? '#9ca3af' : '#6b7280'};
    }
  }
  
  .bar-container {
    height: 8px;
    background: ${props => props.isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'};
    border-radius: 4px;
    overflow: hidden;
  }
  
  .bar {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s ease;
  }
`;

const SuggestionCard = styled.div<{ isDark: boolean; selected: boolean }>`
  background: ${props => props.selected 
    ? (props.isDark ? 'rgba(139, 92, 246, 0.3)' : '#ede9fe')
    : (props.isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb')};
  border: 2px solid ${props => props.selected 
    ? '#8b5cf6' 
    : (props.isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb')};
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    border-color: ${props => props.selected ? '#8b5cf6' : '#a78bfa'};
  }
  
  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .priority-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
  }
  
  .time {
    font-size: 0.85rem;
    color: ${props => props.isDark ? '#9ca3af' : '#6b7280'};
  }
  
  .title {
    font-weight: 600;
    color: ${props => props.isDark ? '#e5e7eb' : '#1f2937'};
    margin-bottom: 5px;
  }
  
  .day {
    font-size: 0.9rem;
    color: ${props => props.isDark ? '#a78bfa' : '#7c3aed'};
  }
  
  .reason {
    font-size: 0.8rem;
    color: ${props => props.isDark ? '#9ca3af' : '#6b7280'};
    margin-top: 8px;
  }
`;

const SuggestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'success'; isDark?: boolean }>`
  padding: 12px 25px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  
  ${props => {
    switch (props.variant) {
      case 'success':
        return `
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          animation: ${glow} 2s ease-in-out infinite;
        `;
      case 'secondary':
        return `
          background: ${props.isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'};
          color: ${props.isDark ? '#e5e7eb' : '#374151'};
        `;
      default:
        return `
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
        `;
    }
  }}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    animation: none;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const QuickActionCard = styled.button<{ isDark: boolean; color: string }>`
  background: ${props => props.isDark ? 'rgba(255,255,255,0.05)' : 'white'};
  border: 2px solid ${props => props.color};
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px ${props => props.color}40;
  }
  
  .icon {
    font-size: 2rem;
    margin-bottom: 10px;
  }
  
  .name {
    font-weight: 700;
    color: ${props => props.isDark ? '#e5e7eb' : '#1f2937'};
    font-size: 1rem;
    margin-bottom: 5px;
  }
  
  .desc {
    font-size: 0.85rem;
    color: ${props => props.isDark ? '#9ca3af' : '#6b7280'};
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  color: white;
  
  .robot {
    font-size: 4rem;
    animation: ${pulse} 1.5s ease-in-out infinite;
  }
  
  .text {
    margin-top: 20px;
    font-size: 1.2rem;
    opacity: 0.8;
  }
`;

const EmptyState = styled.div<{ isDark: boolean }>`
  text-align: center;
  padding: 40px;
  color: ${props => props.isDark ? '#9ca3af' : '#6b7280'};
  
  .icon {
    font-size: 3rem;
    margin-bottom: 15px;
    opacity: 0.5;
  }
`;

const SummaryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 25px;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatBox = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  
  .value {
    font-size: 1.8rem;
    font-weight: 700;
    color: ${props => props.isDark ? '#a78bfa' : '#7c3aed'};
  }
  
  .label {
    font-size: 0.8rem;
    color: ${props => props.isDark ? '#9ca3af' : '#6b7280'};
    margin-top: 5px;
  }
`;

// ============ INTERFACES ============

interface PriorityAnalysis {
  priority_id: number | null;
  name: string;
  color: string;
  rank: number;
  target_hours: number;
  actual_hours: number;
  gap: number;
  percentage: number | null;
  status: string;
}

interface Insight {
  type: string;
  message: string;
  priority?: string;
  action: string | null;
  priority_id?: number;
}

interface Suggestion {
  priority_id: number;
  priority_name: string;
  priority_color: string;
  suggested_title: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  day: string;
  reason: string;
}

interface Analysis {
  summary: {
    total_scheduled_hours: number;
    total_target_hours: number;
    total_events: number;
    priorities_count: number;
  };
  priorities_analysis: PriorityAnalysis[];
  insights: Insight[];
}

// ============ COMPONENT ============

const AIAgentPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAnalysis();
  }, [navigate]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      
      const [analysisRes, suggestionsRes] = await Promise.all([
        fetch('http://localhost:3001/api/ai/analyze', { headers }),
        fetch('http://localhost:3001/api/ai/suggestions', { headers })
      ]);

      if (analysisRes.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (analysisRes.ok) {
        const data = await analysisRes.json();
        setAnalysis(data);
      }

      if (suggestionsRes.ok) {
        const data = await suggestionsRes.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const selectAll = () => {
    if (selectedSuggestions.size === suggestions.length) {
      setSelectedSuggestions(new Set());
    } else {
      setSelectedSuggestions(new Set(suggestions.map((_, i) => i)));
    }
  };

  const handleAutoSchedule = async () => {
    if (selectedSuggestions.size === 0) {
      alert('Please select at least one suggestion to schedule');
      return;
    }

    setScheduling(true);
    try {
      const toSchedule = Array.from(selectedSuggestions).map(i => suggestions[i]);
      
      const response = await fetch('http://localhost:3001/api/ai/auto-schedule', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ suggestions: toSchedule })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`🎉 ${data.message}! Check your calendar.`);
        setSelectedSuggestions(new Set());
        fetchAnalysis(); // Refresh
      } else {
        throw new Error('Failed to schedule');
      }
    } catch (error) {
      alert('Failed to auto-schedule. Please try again.');
    } finally {
      setScheduling(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <PageContainer isDark={isDark}>
        <ContentContainer>
          <LoadingSpinner>
            <div className="robot">🤖</div>
            <div className="text">AI Agent is analyzing your schedule...</div>
          </LoadingSpinner>
        </ContentContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer isDark={isDark}>
      <ContentContainer>
        <Header>
          <TitleArea>
            <RobotIcon>🤖</RobotIcon>
            <Title>
              AI <span>Agent Mode</span>
            </Title>
          </TitleArea>
          <HeaderButtons>
            <ThemeToggle onClick={toggleTheme}>
              {isDark ? <FaSun /> : <FaMoon />}
            </ThemeToggle>
            <HeaderButton to="/calendar">📅 Calendar</HeaderButton>
            <HeaderButton to="/dashboard">🏠 Dashboard</HeaderButton>
          </HeaderButtons>
        </Header>

        {/* Summary Stats */}
        {analysis && (
          <SummaryStats>
            <StatBox isDark={isDark}>
              <div className="value">{analysis.summary.total_scheduled_hours}h</div>
              <div className="label">Scheduled This Week</div>
            </StatBox>
            <StatBox isDark={isDark}>
              <div className="value">{analysis.summary.total_target_hours}h</div>
              <div className="label">Target Hours</div>
            </StatBox>
            <StatBox isDark={isDark}>
              <div className="value">{analysis.summary.total_events}</div>
              <div className="label">Events</div>
            </StatBox>
            <StatBox isDark={isDark}>
              <div className="value">{suggestions.length}</div>
              <div className="label">AI Suggestions</div>
            </StatBox>
          </SummaryStats>
        )}

        {/* Insights Section */}
        {analysis && analysis.insights.length > 0 && (
          <AnalysisSection isDark={isDark}>
            <CardTitle isDark={isDark}>
              <FaLightbulb /> AI Insights
            </CardTitle>
            <InsightsList>
              {analysis.insights.map((insight, index) => (
                <InsightItem key={index} type={insight.type} isDark={isDark}>
                  <div className="message">{insight.message}</div>
                </InsightItem>
              ))}
            </InsightsList>
          </AnalysisSection>
        )}

        <MainGrid>
          {/* Priority Progress */}
          <Card isDark={isDark}>
            <CardTitle isDark={isDark}>
              <FaChartLine /> Priority Progress
            </CardTitle>
            {analysis?.priorities_analysis.filter(p => p.target_hours > 0).map((priority, index) => (
              <PriorityProgress key={index} isDark={isDark}>
                <div className="header">
                  <span className="name">{priority.name}</span>
                  <span className="stats">
                    {priority.actual_hours.toFixed(1)}h / {priority.target_hours}h
                    {priority.percentage !== null && ` (${priority.percentage}%)`}
                  </span>
                </div>
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ 
                      width: `${Math.min(priority.percentage || 0, 100)}%`,
                      background: priority.color || '#8b5cf6'
                    }} 
                  />
                </div>
              </PriorityProgress>
            ))}
            {(!analysis?.priorities_analysis || analysis.priorities_analysis.filter(p => p.target_hours > 0).length === 0) && (
              <EmptyState isDark={isDark}>
                <div className="icon">📊</div>
                <p>Set target hours for your priorities to track progress</p>
                <ActionButton as={Link} to="/priorities" variant="secondary" isDark={isDark} style={{ marginTop: '15px', textDecoration: 'none' }}>
                  Go to Priorities
                </ActionButton>
              </EmptyState>
            )}
          </Card>

          {/* AI Suggestions */}
          <Card isDark={isDark}>
            <CardTitle isDark={isDark}>
              <FaCalendarPlus /> AI Scheduling Suggestions
            </CardTitle>
            {suggestions.length > 0 ? (
              <>
                <SuggestionsList>
                  {suggestions.map((suggestion, index) => (
                    <SuggestionCard 
                      key={index} 
                      isDark={isDark}
                      selected={selectedSuggestions.has(index)}
                      onClick={() => toggleSuggestion(index)}
                    >
                      <div className="top-row">
                        <span 
                          className="priority-badge"
                          style={{ background: suggestion.priority_color || '#8b5cf6' }}
                        >
                          {suggestion.priority_name}
                        </span>
                        <span className="time">
                          {formatTime(suggestion.start_time)} - {formatTime(suggestion.end_time)}
                        </span>
                      </div>
                      <div className="title">{suggestion.suggested_title}</div>
                      <div className="day">{suggestion.day}</div>
                      <div className="reason">{suggestion.reason}</div>
                    </SuggestionCard>
                  ))}
                </SuggestionsList>
                <ButtonRow>
                  <ActionButton variant="secondary" isDark={isDark} onClick={selectAll}>
                    {selectedSuggestions.size === suggestions.length ? <FaTimes /> : <FaCheck />}
                    {selectedSuggestions.size === suggestions.length ? 'Deselect All' : 'Select All'}
                  </ActionButton>
                  <ActionButton 
                    variant="success" 
                    onClick={handleAutoSchedule}
                    disabled={selectedSuggestions.size === 0 || scheduling}
                  >
                    <FaCalendarPlus />
                    {scheduling ? 'Scheduling...' : `Schedule ${selectedSuggestions.size} Events`}
                  </ActionButton>
                </ButtonRow>
              </>
            ) : (
              <EmptyState isDark={isDark}>
                <div className="icon">✨</div>
                <p>You're all caught up! No scheduling suggestions right now.</p>
              </EmptyState>
            )}
          </Card>
        </MainGrid>

        {/* Quick Actions */}
        <Card isDark={isDark} style={{ marginTop: '25px' }}>
          <CardTitle isDark={isDark}>
            <FaRobot /> Quick Actions
          </CardTitle>
          <QuickActions>
            <QuickActionCard isDark={isDark} color="#8b5cf6" onClick={fetchAnalysis}>
              <div className="icon">🔄</div>
              <div className="name">Refresh Analysis</div>
              <div className="desc">Get latest AI insights</div>
            </QuickActionCard>
            <QuickActionCard isDark={isDark} color="#22c55e" as={Link} to="/calendar">
              <div className="icon">📅</div>
              <div className="name">View Calendar</div>
              <div className="desc">See your schedule</div>
            </QuickActionCard>
            <QuickActionCard isDark={isDark} color="#f59e0b" as={Link} to="/priorities">
              <div className="icon">🎯</div>
              <div className="name">Edit Priorities</div>
              <div className="desc">Adjust your goals</div>
            </QuickActionCard>
            <QuickActionCard isDark={isDark} color="#06b6d4" as={Link} to="/whatif">
              <div className="icon">🤔</div>
              <div className="name">What-If Mode</div>
              <div className="desc">Test schedule changes</div>
            </QuickActionCard>
          </QuickActions>
        </Card>
      </ContentContainer>
    </PageContainer>
  );
};

export default AIAgentPage;

