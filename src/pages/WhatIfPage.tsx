import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { format, parseISO } from 'date-fns';
import { useTheme, themes } from '../context/ThemeContext';

// ============ STYLED COMPONENTS ============

const PageContainer = styled.div<{ isDark: boolean }>`
  min-height: 100vh;
  background: ${props => props.isDark ? themes.dark.bgPrimary : '#f0f2f5'};
  padding: 20px;
  transition: background 0.3s ease;
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, #0369a1 0%, #0891b2 50%, #06b6d4 100%)' 
    : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'};
  border-radius: 15px;
  padding: 20px 30px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  box-shadow: ${props => props.isDark ? themes.dark.shadow : '0 4px 15px rgba(79, 172, 254, 0.4)'};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Title = styled.h1`
  color: white;
  margin: 0;
  font-size: 1.8rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const Subtitle = styled.p`
  color: rgba(255,255,255,0.9);
  margin: 5px 0 0 0;
  font-size: 0.95rem;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const ThemeToggle = styled.button<{ isDark: boolean }>`
  background: rgba(255, 255, 255, 0.2);
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
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(20deg) scale(1.1);
  }
`;

const HeaderButton = styled(Link)<{ isDark: boolean }>`
  background: ${props => props.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.95)'};
  color: ${props => props.isDark ? 'white' : '#0891b2'};
  padding: 10px 20px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
  border: ${props => props.isDark ? '1px solid rgba(255,255,255,0.2)' : 'none'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    background: ${props => props.isDark ? 'rgba(255, 255, 255, 0.25)' : 'white'};
  }
`;

const AddButton = styled.button<{ isDark: boolean }>`
  background: white;
  color: ${props => props.isDark ? '#0369a1' : '#0891b2'};
  padding: 10px 20px;
  border-radius: 25px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
`;

const InfoBanner = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)' 
    : 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)'};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  border: 1px solid ${props => props.isDark ? '#1e40af' : '#93c5fd'};
  
  h3 {
    margin: 0 0 10px 0;
    color: ${props => props.isDark ? '#60a5fa' : '#1d4ed8'};
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  p {
    margin: 0;
    color: ${props => props.isDark ? themes.dark.textSecondary : '#1e40af'};
    line-height: 1.6;
  }
`;

const ScenarioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
`;

const ScenarioCard = styled.div<{ isDark: boolean; isApplied?: boolean }>`
  background: ${props => props.isDark ? themes.dark.bgCard : 'white'};
  border-radius: 15px;
  overflow: hidden;
  box-shadow: ${props => props.isDark ? themes.dark.shadow : '0 4px 15px rgba(0,0,0,0.1)'};
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
  transition: all 0.3s ease;
  opacity: ${props => props.isApplied ? 0.7 : 1};
  
  &:hover {
    transform: ${props => props.isApplied ? 'none' : 'translateY(-5px)'};
    box-shadow: ${props => props.isApplied ? props.isDark ? themes.dark.shadow : '0 4px 15px rgba(0,0,0,0.1)' : props.isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 25px rgba(0,0,0,0.15)'};
  }
`;

const CardHeader = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, #0369a1 0%, #0891b2 100%)' 
    : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'};
  padding: 20px;
  color: white;
`;

const ScenarioName = styled.h3`
  margin: 0 0 5px 0;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ScenarioDate = styled.p`
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.9;
`;

const CardContent = styled.div`
  padding: 20px;
`;

const ScenarioDescription = styled.p<{ isDark: boolean }>`
  color: ${props => props.isDark ? themes.dark.textSecondary : '#666'};
  margin: 0 0 15px 0;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const ScenarioStats = styled.div<{ isDark: boolean }>`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
`;

const StatBadge = styled.div<{ isDark: boolean; color?: string }>`
  background: ${props => props.isDark ? themes.dark.bgSecondary : '#f0f9ff'};
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.85rem;
  color: ${props => props.color || (props.isDark ? themes.dark.primary : '#0891b2')};
  font-weight: 600;
`;

const AppliedBadge = styled.div`
  background: #dcfce7;
  color: #16a34a;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

const CardActions = styled.div<{ isDark: boolean }>`
  display: flex;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid ${props => props.isDark ? themes.dark.borderColor : '#eee'};
`;

const ActionButton = styled.button<{ variant?: 'apply' | 'delete' | 'view'; isDark: boolean }>`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    switch (props.variant) {
      case 'apply':
        return `
          background: ${props.isDark ? '#166534' : '#dcfce7'};
          color: ${props.isDark ? '#86efac' : '#16a34a'};
          &:hover { background: ${props.isDark ? '#15803d' : '#bbf7d0'}; }
        `;
      case 'delete':
        return `
          background: ${props.isDark ? '#7f1d1d' : '#fee2e2'};
          color: ${props.isDark ? '#fca5a5' : '#dc2626'};
          &:hover { background: ${props.isDark ? '#991b1b' : '#fecaca'}; }
        `;
      default:
        return `
          background: ${props.isDark ? themes.dark.bgHover : '#f0f0f0'};
          color: ${props.isDark ? themes.dark.textPrimary : '#333'};
          &:hover { background: ${props.isDark ? '#0369a1' : '#e0e0e0'}; color: ${props.isDark ? 'white' : '#333'}; }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div<{ isDark: boolean }>`
  text-align: center;
  padding: 60px 20px;
  background: ${props => props.isDark ? themes.dark.bgCard : 'white'};
  border-radius: 15px;
  box-shadow: ${props => props.isDark ? themes.dark.shadow : '0 4px 15px rgba(0,0,0,0.1)'};
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
  
  h3 {
    color: ${props => props.isDark ? themes.dark.textPrimary : '#333'};
    margin: 20px 0 10px 0;
  }
  
  p {
    color: ${props => props.isDark ? themes.dark.textSecondary : '#666'};
    margin-bottom: 20px;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  opacity: 0.5;
`;

// Modal Styles
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
  background: ${props => props.isDark ? themes.dark.bgCard : 'white'};
  border-radius: 15px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${props => props.isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 10px 40px rgba(0,0,0,0.3)'};
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
`;

const ModalTitle = styled.h2<{ isDark: boolean }>`
  color: ${props => props.isDark ? '#60a5fa' : '#0891b2'};
  margin: 0 0 25px 0;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label<{ isDark: boolean }>`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: ${props => props.isDark ? themes.dark.textPrimary : '#333'};
`;

const Input = styled.input<{ isDark: boolean }>`
  width: 100%;
  padding: 12px;
  border: 2px solid ${props => props.isDark ? themes.dark.borderColor : '#e0e0e0'};
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: all 0.2s;
  background: ${props => props.isDark ? themes.dark.bgSecondary : 'white'};
  color: ${props => props.isDark ? themes.dark.textPrimary : '#333'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.isDark ? '#60a5fa' : '#0891b2'};
  }
  
  &::placeholder {
    color: ${props => props.isDark ? themes.dark.textMuted : '#999'};
  }
`;

const TextArea = styled.textarea<{ isDark: boolean }>`
  width: 100%;
  padding: 12px;
  border: 2px solid ${props => props.isDark ? themes.dark.borderColor : '#e0e0e0'};
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s;
  background: ${props => props.isDark ? themes.dark.bgSecondary : 'white'};
  color: ${props => props.isDark ? themes.dark.textPrimary : '#333'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.isDark ? '#60a5fa' : '#0891b2'};
  }
  
  &::placeholder {
    color: ${props => props.isDark ? themes.dark.textMuted : '#999'};
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 25px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary'; isDark?: boolean }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${props => props.variant === 'secondary' ? `
    background: ${props.isDark ? themes.dark.bgHover : '#e0e0e0'};
    color: ${props.isDark ? themes.dark.textPrimary : '#333'};
    &:hover { background: ${props.isDark ? '#3f3f46' : '#d0d0d0'}; }
  ` : `
    background: ${props.isDark ? '#0891b2' : '#0891b2'};
    color: white;
    &:hover { background: ${props.isDark ? '#0369a1' : '#0369a1'}; }
  `}
`;

const ErrorMessage = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? '#7f1d1d' : '#fee2e2'};
  color: ${props => props.isDark ? '#fca5a5' : '#dc2626'};
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid ${props => props.isDark ? '#991b1b' : '#fecaca'};
`;

// ============ INTERFACES ============

interface Scenario {
  scenario_id: number;
  name: string;
  description: string | null;
  created_at: string;
  is_applied: boolean;
  event_count: number;
}

// ============ COMPONENT ============

const WhatIfPage: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchScenarios();
  }, [navigate]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchScenarios = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/scenarios', {
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setScenarios(data);
      }
    } catch (error) {
      console.error('Failed to fetch scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Scenario name is required');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/scenarios', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create scenario');
      }

      setShowModal(false);
      setFormData({ name: '', description: '' });
      fetchScenarios();
    } catch (error) {
      setFormError('Failed to create scenario. Please try again.');
    }
  };

  const handleApplyScenario = async (scenario: Scenario) => {
    if (!window.confirm(`Are you sure you want to apply "${scenario.name}"? This will make all changes permanent.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/scenarios/${scenario.scenario_id}/apply`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to apply scenario');
      }

      alert('Scenario applied successfully! Your calendar has been updated.');
      fetchScenarios();
    } catch (error) {
      alert('Failed to apply scenario. Please try again.');
    }
  };

  const handleDeleteScenario = async (scenario: Scenario) => {
    if (!window.confirm(`Are you sure you want to delete "${scenario.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/scenarios/${scenario.scenario_id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete scenario');
      }

      fetchScenarios();
    } catch (error) {
      alert('Failed to delete scenario. Please try again.');
    }
  };

  const activeScenarios = scenarios.filter(s => !s.is_applied);
  const appliedScenarios = scenarios.filter(s => s.is_applied);

  if (loading) {
    return (
      <PageContainer isDark={isDark}>
        <ContentContainer>
          <div style={{ 
            textAlign: 'center', 
            padding: '100px', 
            color: isDark ? '#60a5fa' : '#0891b2', 
            fontSize: '1.5rem' 
          }}>
            ⏳ Loading scenarios...
          </div>
        </ContentContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer isDark={isDark}>
      <ContentContainer>
        <Header isDark={isDark}>
          <HeaderLeft>
            <div>
              <Title>🤔 What-If Mode</Title>
              <Subtitle>Explore scheduling scenarios without committing changes</Subtitle>
            </div>
          </HeaderLeft>
          <HeaderRight>
            <ThemeToggle isDark={isDark} onClick={toggleTheme} title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
              {isDark ? '☀️' : '🌙'}
            </ThemeToggle>
            <AddButton isDark={isDark} onClick={() => setShowModal(true)}>
              ➕ New Scenario
            </AddButton>
            <HeaderButton to="/dashboard" isDark={isDark}>📊 Dashboard</HeaderButton>
            <HeaderButton to="/calendar" isDark={isDark}>📅 Calendar</HeaderButton>
          </HeaderRight>
        </Header>

        <InfoBanner isDark={isDark}>
          <h3>💡 How What-If Mode Works</h3>
          <p>
            Create scenarios to test different scheduling arrangements without affecting your actual calendar. 
            Make changes, see how they'd look, and when you're satisfied, apply them permanently — or simply discard them. 
            It's like a sandbox for your schedule!
          </p>
        </InfoBanner>

        {scenarios.length === 0 ? (
          <EmptyState isDark={isDark}>
            <EmptyIcon>🤔</EmptyIcon>
            <h3>No Scenarios Yet</h3>
            <p>
              Create your first What-If scenario to start exploring different ways to organize your schedule 
              without making permanent changes.
            </p>
            <Button variant="primary" isDark={isDark} onClick={() => setShowModal(true)}>
              ➕ Create Your First Scenario
            </Button>
          </EmptyState>
        ) : (
          <>
            {activeScenarios.length > 0 && (
              <>
                <h2 style={{ color: isDark ? themes.dark.textPrimary : '#333', marginBottom: '20px' }}>
                  🔄 Active Scenarios ({activeScenarios.length})
                </h2>
                <ScenarioGrid>
                  {activeScenarios.map((scenario) => (
                    <ScenarioCard key={scenario.scenario_id} isDark={isDark}>
                      <CardHeader isDark={isDark}>
                        <ScenarioName>
                          🤔 {scenario.name}
                        </ScenarioName>
                        <ScenarioDate>
                          Created {format(parseISO(scenario.created_at), 'MMM d, yyyy h:mm a')}
                        </ScenarioDate>
                      </CardHeader>
                      <CardContent>
                        {scenario.description && (
                          <ScenarioDescription isDark={isDark}>
                            {scenario.description}
                          </ScenarioDescription>
                        )}
                        <ScenarioStats isDark={isDark}>
                          <StatBadge isDark={isDark}>
                            📝 {scenario.event_count} event changes
                          </StatBadge>
                        </ScenarioStats>
                        <CardActions isDark={isDark}>
                          <ActionButton 
                            as={Link} 
                            to={`/whatif/${scenario.scenario_id}`}
                            variant="view" 
                            isDark={isDark}
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            ✏️ Edit
                          </ActionButton>
                          <ActionButton 
                            variant="apply" 
                            isDark={isDark} 
                            onClick={() => handleApplyScenario(scenario)}
                            disabled={scenario.event_count === 0}
                          >
                            ✅ Apply
                          </ActionButton>
                          <ActionButton variant="delete" isDark={isDark} onClick={() => handleDeleteScenario(scenario)}>
                            🗑️ Discard
                          </ActionButton>
                        </CardActions>
                      </CardContent>
                    </ScenarioCard>
                  ))}
                </ScenarioGrid>
              </>
            )}

            {appliedScenarios.length > 0 && (
              <>
                <h2 style={{ color: isDark ? themes.dark.textPrimary : '#333', margin: '40px 0 20px 0' }}>
                  ✅ Applied Scenarios ({appliedScenarios.length})
                </h2>
                <ScenarioGrid>
                  {appliedScenarios.map((scenario) => (
                    <ScenarioCard key={scenario.scenario_id} isDark={isDark} isApplied>
                      <CardHeader isDark={isDark}>
                        <ScenarioName>
                          ✅ {scenario.name}
                          <AppliedBadge>Applied</AppliedBadge>
                        </ScenarioName>
                        <ScenarioDate>
                          Created {format(parseISO(scenario.created_at), 'MMM d, yyyy')}
                        </ScenarioDate>
                      </CardHeader>
                      <CardContent>
                        {scenario.description && (
                          <ScenarioDescription isDark={isDark}>
                            {scenario.description}
                          </ScenarioDescription>
                        )}
                        <ScenarioStats isDark={isDark}>
                          <StatBadge isDark={isDark} color="#16a34a">
                            📝 {scenario.event_count} events modified
                          </StatBadge>
                        </ScenarioStats>
                        <CardActions isDark={isDark}>
                          <ActionButton variant="delete" isDark={isDark} onClick={() => handleDeleteScenario(scenario)}>
                            🗑️ Delete Record
                          </ActionButton>
                        </CardActions>
                      </CardContent>
                    </ScenarioCard>
                  ))}
                </ScenarioGrid>
              </>
            )}
          </>
        )}
      </ContentContainer>

      {/* Create Scenario Modal */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal isDark={isDark} onClick={e => e.stopPropagation()}>
            <ModalTitle isDark={isDark}>➕ Create New Scenario</ModalTitle>

            {formError && <ErrorMessage isDark={isDark}>{formError}</ErrorMessage>}

            <form onSubmit={handleCreateScenario}>
              <FormGroup>
                <Label isDark={isDark}>Scenario Name *</Label>
                <Input
                  isDark={isDark}
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Try morning workouts, Move meetings to afternoons"
                  autoFocus
                />
              </FormGroup>

              <FormGroup>
                <Label isDark={isDark}>Description (optional)</Label>
                <TextArea
                  isDark={isDark}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what you want to try in this scenario..."
                />
              </FormGroup>

              <ButtonRow>
                <Button type="button" variant="secondary" isDark={isDark} onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isDark={isDark}>
                  ➕ Create Scenario
                </Button>
              </ButtonRow>
            </form>
          </Modal>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default WhatIfPage;

