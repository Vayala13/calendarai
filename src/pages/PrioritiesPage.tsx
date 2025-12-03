import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme, themes } from '../context/ThemeContext';
import ChatSidebar from '../components/ChatSidebar';

// ============ STYLED COMPONENTS ============

const PageContainer = styled.div<{ isDark: boolean }>`
  min-height: 100vh;
  background: ${props => props.isDark ? themes.dark.bgPrimary : '#f0f2f5'};
  padding: 20px;
  transition: background 0.3s ease;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, #be185d 0%, #db2777 50%, #ec4899 100%)' 
    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'};
  border-radius: 15px;
  padding: 20px 30px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  box-shadow: ${props => props.isDark ? themes.dark.shadow : '0 4px 15px rgba(240, 147, 251, 0.4)'};
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
  color: ${props => props.isDark ? 'white' : '#f5576c'};
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
  color: ${props => props.isDark ? '#be185d' : '#f5576c'};
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

const StatsBar = styled.div<{ isDark: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const StatCard = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? themes.dark.bgCard : 'white'};
  border-radius: 12px;
  padding: 20px;
  box-shadow: ${props => props.isDark ? themes.dark.shadow : '0 2px 10px rgba(0,0,0,0.1)'};
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
  text-align: center;
  
  h3 {
    margin: 0 0 5px 0;
    font-size: 2rem;
    color: ${props => props.isDark ? themes.dark.primary : '#667eea'};
  }
  
  p {
    margin: 0;
    color: ${props => props.isDark ? themes.dark.textSecondary : '#666'};
    font-size: 0.9rem;
  }
`;

const PrioritiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
`;

const PriorityCard = styled.div<{ color: string; isDark: boolean }>`
  background: ${props => props.isDark ? themes.dark.bgCard : 'white'};
  border-radius: 15px;
  overflow: hidden;
  box-shadow: ${props => props.isDark ? themes.dark.shadow : '0 4px 15px rgba(0,0,0,0.1)'};
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 25px rgba(0,0,0,0.15)'};
  }
`;

const ColorBar = styled.div<{ color: string }>`
  height: 8px;
  background: ${props => props.color};
`;

const CardContent = styled.div`
  padding: 20px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const PriorityName = styled.h3<{ isDark: boolean }>`
  margin: 0;
  font-size: 1.4rem;
  color: ${props => props.isDark ? themes.dark.textPrimary : '#333'};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RankBadge = styled.span<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const CardStats = styled.div<{ isDark: boolean }>`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
`;

const Stat = styled.div<{ isDark: boolean }>`
  flex: 1;
  background: ${props => props.isDark ? themes.dark.bgSecondary : '#f8f9fa'};
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  
  span {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: ${props => props.isDark ? themes.dark.textPrimary : '#333'};
  }
  
  label {
    font-size: 0.8rem;
    color: ${props => props.isDark ? themes.dark.textMuted : '#666'};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const ColorPreview = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: ${props => props.color};
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const CardActions = styled.div<{ isDark: boolean }>`
  display: flex;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid ${props => props.isDark ? themes.dark.borderColor : '#eee'};
`;

const ActionButton = styled.button<{ variant?: 'edit' | 'delete'; isDark: boolean }>`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.variant === 'delete' ? `
    background: ${props.isDark ? '#7f1d1d' : '#fee2e2'};
    color: ${props.isDark ? '#fca5a5' : '#dc2626'};
    
    &:hover {
      background: ${props.isDark ? '#991b1b' : '#fecaca'};
    }
  ` : `
    background: ${props.isDark ? themes.dark.bgHover : '#f0f0f0'};
    color: ${props.isDark ? themes.dark.textPrimary : '#333'};
    
    &:hover {
      background: ${props.isDark ? '#4c1d95' : '#e0e0e0'};
      color: ${props.isDark ? 'white' : '#333'};
    }
  `}
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
  color: ${props => props.isDark ? themes.dark.primary : '#f5576c'};
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
    border-color: ${props => props.isDark ? themes.dark.primary : '#f5576c'};
  }
  
  &::placeholder {
    color: ${props => props.isDark ? themes.dark.textMuted : '#999'};
  }
`;

const Select = styled.select<{ isDark: boolean }>`
  width: 100%;
  padding: 12px;
  border: 2px solid ${props => props.isDark ? themes.dark.borderColor : '#e0e0e0'};
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.isDark ? themes.dark.bgSecondary : 'white'};
  color: ${props => props.isDark ? themes.dark.textPrimary : '#333'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.isDark ? themes.dark.primary : '#f5576c'};
  }
`;

const ColorPicker = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
`;

const ColorOption = styled.button<{ color: string; isSelected: boolean }>`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  background: ${props => props.color};
  border: 3px solid ${props => props.isSelected ? 'white' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.isSelected ? '0 0 0 3px #333, 0 4px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)'};
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 25px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger'; isDark?: boolean }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${props => {
    const isDark = props.isDark;
    switch (props.variant) {
      case 'danger':
        return `
          background: ${isDark ? themes.dark.danger : '#f44336'};
          color: white;
          &:hover { background: #dc2626; }
        `;
      case 'secondary':
        return `
          background: ${isDark ? themes.dark.bgHover : '#e0e0e0'};
          color: ${isDark ? themes.dark.textPrimary : '#333'};
          &:hover { background: ${isDark ? '#3f3f46' : '#d0d0d0'}; }
        `;
      default:
        return `
          background: ${isDark ? '#db2777' : '#f5576c'};
          color: white;
          &:hover { background: ${isDark ? '#be185d' : '#e04358'}; }
        `;
    }
  }}
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

interface Priority {
  priority_id: number;
  name: string;
  rank: number;
  hours_per_week: number;
  color: string;
}

interface PriorityFormData {
  name: string;
  rank: string;
  hours_per_week: string;
  color: string;
}

// ============ CONSTANTS ============

const PRESET_COLORS = [
  '#667eea', '#764ba2', '#f093fb', '#f5576c',
  '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
  '#fa709a', '#fee140', '#f6d365', '#fda085',
  '#a8edea', '#fed6e3', '#5ee7df', '#b490ca',
  '#d299c2', '#fef9d7', '#96fbc4', '#f9f586',
  '#667eea', '#30cfd0', '#c471f5', '#fa71cd'
];

// ============ COMPONENT ============

const PrioritiesPage: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(null);
  const [formData, setFormData] = useState<PriorityFormData>({
    name: '',
    rank: '5',
    hours_per_week: '10',
    color: '#667eea'
  });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchPriorities();
  }, [navigate]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchPriorities = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/priorities', {
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setPriorities(data);
      }
    } catch (error) {
      console.error('Failed to fetch priorities:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setSelectedPriority(null);
    setFormData({
      name: '',
      rank: '5',
      hours_per_week: '10',
      color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (priority: Priority) => {
    setSelectedPriority(priority);
    setFormData({
      name: priority.name,
      rank: priority.rank.toString(),
      hours_per_week: priority.hours_per_week.toString(),
      color: priority.color
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Priority name is required');
      return;
    }

    try {
      const headers = getAuthHeaders();
      const priorityData = {
        name: formData.name,
        rank: parseInt(formData.rank),
        hours_per_week: parseFloat(formData.hours_per_week),
        color: formData.color
      };

      let response;
      if (selectedPriority) {
        response = await fetch(`http://localhost:3001/api/priorities/${selectedPriority.priority_id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(priorityData)
        });
      } else {
        response = await fetch('http://localhost:3001/api/priorities', {
          method: 'POST',
          headers,
          body: JSON.stringify(priorityData)
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save priority');
      }

      setShowModal(false);
      fetchPriorities();
    } catch (error) {
      setFormError('Failed to save priority. Please try again.');
    }
  };

  const handleDelete = async (priority: Priority) => {
    if (!window.confirm(`Are you sure you want to delete "${priority.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/priorities/${priority.priority_id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete priority');
      }

      fetchPriorities();
    } catch (error) {
      alert('Failed to delete priority. Please try again.');
    }
  };

  const totalHours = priorities.reduce((sum, p) => sum + Number(p.hours_per_week), 0);

  if (loading) {
    return (
      <PageContainer isDark={isDark}>
        <ContentContainer>
          <div style={{ 
            textAlign: 'center', 
            padding: '100px', 
            color: isDark ? themes.dark.primary : '#f5576c', 
            fontSize: '1.5rem' 
          }}>
            ⏳ Loading priorities...
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
              <Title>⭐ Life Priorities</Title>
              <Subtitle>Rank what matters most and allocate your time wisely</Subtitle>
            </div>
          </HeaderLeft>
          <HeaderRight>
            <ThemeToggle isDark={isDark} onClick={toggleTheme} title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
              {isDark ? '☀️' : '🌙'}
            </ThemeToggle>
            <AddButton isDark={isDark} onClick={openAddModal}>
              ➕ Add Priority
            </AddButton>
            <HeaderButton to="/dashboard" isDark={isDark}>📊 Dashboard</HeaderButton>
            <HeaderButton to="/calendar" isDark={isDark}>📅 Calendar</HeaderButton>
          </HeaderRight>
        </Header>

        <StatsBar isDark={isDark}>
          <StatCard isDark={isDark}>
            <h3>{priorities.length}</h3>
            <p>Total Priorities</p>
          </StatCard>
          <StatCard isDark={isDark}>
            <h3>{totalHours}</h3>
            <p>Hours/Week Allocated</p>
          </StatCard>
          <StatCard isDark={isDark}>
            <h3>{168 - totalHours}</h3>
            <p>Hours/Week Remaining</p>
          </StatCard>
        </StatsBar>

        {priorities.length === 0 ? (
          <EmptyState isDark={isDark}>
            <EmptyIcon>⭐</EmptyIcon>
            <h3>No Priorities Yet</h3>
            <p>Start by adding your first life priority to manage your time better.</p>
            <Button variant="primary" isDark={isDark} onClick={openAddModal}>
              ➕ Add Your First Priority
            </Button>
          </EmptyState>
        ) : (
          <PrioritiesGrid>
            {priorities.sort((a, b) => a.rank - b.rank).map((priority) => (
              <PriorityCard key={priority.priority_id} color={priority.color} isDark={isDark}>
                <ColorBar color={priority.color} />
                <CardContent>
                  <CardHeader>
                    <PriorityName isDark={isDark}>
                      <ColorPreview color={priority.color} />
                      {priority.name}
                    </PriorityName>
                    <RankBadge color={priority.color}>
                      Rank #{priority.rank}
                    </RankBadge>
                  </CardHeader>
                  
                  <CardStats isDark={isDark}>
                    <Stat isDark={isDark}>
                      <span>{priority.hours_per_week}</span>
                      <label>Hours/Week</label>
                    </Stat>
                    <Stat isDark={isDark}>
                      <span>{((Number(priority.hours_per_week) / 168) * 100).toFixed(1)}%</span>
                      <label>Of Week</label>
                    </Stat>
                  </CardStats>
                  
                  <CardActions isDark={isDark}>
                    <ActionButton isDark={isDark} onClick={() => openEditModal(priority)}>
                      ✏️ Edit
                    </ActionButton>
                    <ActionButton variant="delete" isDark={isDark} onClick={() => handleDelete(priority)}>
                      🗑️ Delete
                    </ActionButton>
                  </CardActions>
                </CardContent>
              </PriorityCard>
            ))}
          </PrioritiesGrid>
        )}
      </ContentContainer>

      {/* Add/Edit Priority Modal */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal isDark={isDark} onClick={e => e.stopPropagation()}>
            <ModalTitle isDark={isDark}>
              {selectedPriority ? '✏️ Edit Priority' : '➕ New Priority'}
            </ModalTitle>

            {formError && <ErrorMessage isDark={isDark}>{formError}</ErrorMessage>}

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label isDark={isDark}>Priority Name *</Label>
                <Input
                  isDark={isDark}
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Work, Family, Health"
                  autoFocus
                />
              </FormGroup>

              <FormGroup>
                <Label isDark={isDark}>Importance Rank (1 = Most Important)</Label>
                <Select
                  isDark={isDark}
                  value={formData.rank}
                  onChange={e => setFormData({ ...formData, rank: e.target.value })}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>
                      {num} - {num === 1 ? 'Highest' : num === 10 ? 'Lowest' : num <= 3 ? 'High' : num <= 7 ? 'Medium' : 'Low'}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label isDark={isDark}>Hours Per Week</Label>
                <Input
                  isDark={isDark}
                  type="number"
                  min="0"
                  max="168"
                  step="0.5"
                  value={formData.hours_per_week}
                  onChange={e => setFormData({ ...formData, hours_per_week: e.target.value })}
                  placeholder="e.g., 40"
                />
              </FormGroup>

              <FormGroup>
                <Label isDark={isDark}>Color</Label>
                <ColorPicker>
                  {PRESET_COLORS.map((color, index) => (
                    <ColorOption
                      key={index}
                      type="button"
                      color={color}
                      isSelected={formData.color === color}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </ColorPicker>
              </FormGroup>

              <ButtonRow>
                <Button type="button" variant="secondary" isDark={isDark} onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isDark={isDark}>
                  {selectedPriority ? '💾 Save Changes' : '➕ Create Priority'}
                </Button>
              </ButtonRow>
            </form>
          </Modal>
        </ModalOverlay>
      )}
      
      <ChatSidebar isDark={isDark} />
    </PageContainer>
  );
};

export default PrioritiesPage;

