import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { createEvents } from 'ics';
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
  padding: 15px 25px;
  margin-bottom: 20px;
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
  gap: 15px;
`;

const BackButton = styled(Link)<{ isDark: boolean }>`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ScenarioInfo = styled.div`
  h1 {
    color: white;
    margin: 0;
    font-size: 1.4rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  p {
    color: rgba(255,255,255,0.9);
    margin: 3px 0 0 0;
    font-size: 0.85rem;
  }
`;

const SandboxBadge = styled.span`
  background: #fbbf24;
  color: #78350f;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const HeaderButton = styled.button<{ variant?: 'primary' | 'success' | 'danger'; isDark?: boolean }>`
  padding: 10px 20px;
  border-radius: 25px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  ${props => {
    switch (props.variant) {
      case 'success':
        return `
          background: #22c55e;
          color: white;
          &:hover { background: #16a34a; }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:hover { background: #dc2626; }
        `;
      default:
        return `
          background: white;
          color: #0891b2;
          &:hover { background: #f0f9ff; }
        `;
    }
  }}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CalendarNav = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? themes.dark.bgCard : 'white'};
  border-radius: 12px;
  padding: 15px 20px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: ${props => props.isDark ? themes.dark.shadow : '0 2px 10px rgba(0,0,0,0.1)'};
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
`;

const NavButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const NavButton = styled.button<{ isDark: boolean }>`
  background: ${props => props.isDark ? themes.dark.bgHover : '#f0f0f0'};
  border: none;
  color: ${props => props.isDark ? themes.dark.textPrimary : '#333'};
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.isDark ? '#0891b2' : '#e0e0e0'};
    color: ${props => props.isDark ? 'white' : '#333'};
  }
`;

const CurrentMonth = styled.h2<{ isDark: boolean }>`
  color: ${props => props.isDark ? themes.dark.textPrimary : '#333'};
  margin: 0;
  font-size: 1.3rem;
`;

const ChangesIndicator = styled.div<{ isDark: boolean; hasChanges: boolean }>`
  background: ${props => props.hasChanges 
    ? (props.isDark ? '#854d0e' : '#fef3c7') 
    : (props.isDark ? themes.dark.bgSecondary : '#f0f0f0')};
  color: ${props => props.hasChanges 
    ? (props.isDark ? '#fbbf24' : '#92400e') 
    : (props.isDark ? themes.dark.textMuted : '#666')};
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CalendarContainer = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? themes.dark.calendarBg : 'white'};
  border-radius: 15px;
  box-shadow: ${props => props.isDark ? themes.dark.shadow : '0 4px 20px rgba(0,0,0,0.1)'};
  overflow: hidden;
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
`;

const WeekDaysHeader = styled.div<{ isDark: boolean }>`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, #0369a1 0%, #0891b2 100%)' 
    : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'};
`;

const WeekDay = styled.div`
  padding: 12px;
  text-align: center;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
`;

const DayCell = styled.div<{ isCurrentMonth: boolean; isToday: boolean; isDark: boolean }>`
  min-height: 100px;
  padding: 6px;
  border: 1px solid ${props => props.isDark ? themes.dark.borderColor : '#e0e0e0'};
  background: ${props => {
    if (props.isToday) return props.isDark ? themes.dark.bgToday : '#e3f2fd';
    if (props.isCurrentMonth) return props.isDark ? themes.dark.dayBg : 'white';
    return props.isDark ? themes.dark.dayBgOther : '#f9f9f9';
  }};
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: ${props => {
      if (props.isToday) return props.isDark ? themes.dark.bgTodayHover : '#bbdefb';
      return props.isDark ? themes.dark.bgHover : '#f0f0f0';
    }};
  }
`;

const DayNumber = styled.div<{ isToday: boolean; isCurrentMonth: boolean; isDark: boolean }>`
  font-weight: ${props => props.isToday ? '700' : '500'};
  font-size: 0.85rem;
  color: ${props => {
    if (props.isToday) return props.isDark ? '#60a5fa' : '#1976d2';
    if (props.isCurrentMonth) return props.isDark ? themes.dark.textPrimary : '#333';
    return props.isDark ? themes.dark.textMuted : '#999';
  }};
  margin-bottom: 4px;
  
  ${props => props.isToday && `
    background: ${props.isDark ? '#3b82f6' : '#1976d2'};
    color: white !important;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
  `}
`;

const EventsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 70px;
  overflow-y: auto;
`;

const EventChip = styled.div<{ color: string; isModified?: boolean; isDeleted?: boolean }>`
  background: ${props => props.isDeleted ? '#9ca3af' : props.color || '#667eea'};
  color: white;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 0.7rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: all 0.2s;
  opacity: ${props => props.isDeleted ? 0.5 : 1};
  text-decoration: ${props => props.isDeleted ? 'line-through' : 'none'};
  border: ${props => props.isModified ? '2px solid #fbbf24' : 'none'};
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
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
  padding: 25px;
  width: 90%;
  max-width: 450px;
  box-shadow: ${props => props.isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 10px 40px rgba(0,0,0,0.3)'};
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
`;

const ModalTitle = styled.h2<{ isDark: boolean }>`
  color: ${props => props.isDark ? '#60a5fa' : '#0891b2'};
  margin: 0 0 20px 0;
  font-size: 1.3rem;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label<{ isDark: boolean }>`
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: ${props => props.isDark ? themes.dark.textPrimary : '#333'};
  font-size: 0.9rem;
`;

const Input = styled.input<{ isDark: boolean }>`
  width: 100%;
  padding: 10px;
  border: 2px solid ${props => props.isDark ? themes.dark.borderColor : '#e0e0e0'};
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;
  background: ${props => props.isDark ? themes.dark.bgSecondary : 'white'};
  color: ${props => props.isDark ? themes.dark.textPrimary : '#333'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.isDark ? '#60a5fa' : '#0891b2'};
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger'; isDark?: boolean }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.9rem;
  
  ${props => {
    switch (props.variant) {
      case 'danger':
        return `
          background: ${props.isDark ? '#ef4444' : '#ef4444'};
          color: white;
          &:hover { background: #dc2626; }
        `;
      case 'secondary':
        return `
          background: ${props.isDark ? themes.dark.bgHover : '#e0e0e0'};
          color: ${props.isDark ? themes.dark.textPrimary : '#333'};
          &:hover { background: ${props.isDark ? '#3f3f46' : '#d0d0d0'}; }
        `;
      default:
        return `
          background: #0891b2;
          color: white;
          &:hover { background: #0369a1; }
        `;
    }
  }}
`;

const ExportModal = styled(Modal)`
  max-width: 500px;
`;

const ExportOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 20px 0;
`;

const ExportOption = styled.button<{ isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border: 2px solid ${props => props.isDark ? themes.dark.borderColor : '#e0e0e0'};
  border-radius: 12px;
  background: ${props => props.isDark ? themes.dark.bgSecondary : '#f9f9f9'};
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  
  &:hover {
    border-color: #0891b2;
    background: ${props => props.isDark ? themes.dark.bgHover : '#e0f7fa'};
    transform: translateY(-2px);
  }
  
  .icon {
    font-size: 2rem;
  }
  
  .info {
    h4 {
      margin: 0 0 5px 0;
      color: ${props => props.isDark ? themes.dark.textPrimary : '#333'};
    }
    p {
      margin: 0;
      font-size: 0.85rem;
      color: ${props => props.isDark ? themes.dark.textSecondary : '#666'};
    }
  }
`;

// ============ INTERFACES ============

interface Event {
  event_id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  priority_id: number | null;
  priority_name: string;
  priority_color: string;
}

interface Priority {
  priority_id: number;
  name: string;
  color: string;
}

interface Scenario {
  scenario_id: number;
  name: string;
  description: string;
}

interface EventModification {
  event_id: number;
  original: Event;
  modified: Partial<Event> & { deleted?: boolean };
}

// ============ COMPONENT ============

const ScenarioEditorPage: React.FC = () => {
  const { isDark } = useTheme();
  const { id: scenarioId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [modifications, setModifications] = useState<Map<number, EventModification>>(new Map());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
  const [showEventModal, setShowEventModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    priority_id: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate, scenarioId]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchData = async () => {
    try {
      const headers = getAuthHeaders();
      
      const [scenarioRes, eventsRes, prioritiesRes] = await Promise.all([
        fetch(`http://localhost:3001/api/scenarios/${scenarioId}`, { headers }),
        fetch('http://localhost:3001/api/events', { headers }),
        fetch('http://localhost:3001/api/priorities', { headers })
      ]);

      if (scenarioRes.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (scenarioRes.ok) {
        const scenarioData = await scenarioRes.json();
        setScenario(scenarioData);
        
        // Load existing modifications
        if (scenarioData.events && scenarioData.events.length > 0) {
          const mods = new Map<number, EventModification>();
          scenarioData.events.forEach((se: any) => {
            if (se.modified_fields) {
              mods.set(se.event_id, {
                event_id: se.event_id,
                original: se,
                modified: JSON.parse(se.modified_fields)
              });
            }
          });
          setModifications(mods);
        }
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
      }

      if (prioritiesRes.ok) {
        const prioritiesData = await prioritiesRes.json();
        setPriorities(prioritiesData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calendar navigation
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Generate calendar days
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  };

  // Get events for a day (with modifications applied)
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const mod = modifications.get(event.event_id);
      if (mod?.modified.deleted) return true; // Still show deleted events (crossed out)
      
      const startTime = mod?.modified.start_time || event.start_time;
      const eventDate = parseISO(startTime);
      return isSameDay(eventDate, day);
    }).map(event => {
      const mod = modifications.get(event.event_id);
      if (mod) {
        return {
          ...event,
          ...mod.modified,
          isModified: true,
          isDeleted: mod.modified.deleted
        };
      }
      return { ...event, isModified: false, isDeleted: false };
    });
  };

  // Handle event click
  const handleEventClick = (event: Event & { isModified?: boolean; isDeleted?: boolean }, e: React.MouseEvent) => {
    e.stopPropagation();
    const mod = modifications.get(event.event_id);
    const currentEvent = mod ? { ...event, ...mod.modified } : event;
    
    setSelectedEvent(event);
    setEventForm({
      title: currentEvent.title,
      description: currentEvent.description || '',
      start_time: currentEvent.start_time.slice(0, 16),
      end_time: currentEvent.end_time.slice(0, 16),
      priority_id: currentEvent.priority_id?.toString() || ''
    });
    setSelectedDate(null);
    setShowEventModal(true);
  };

  // Handle day click
  const handleDayClick = (day: Date) => {
    setSelectedEvent(null);
    setSelectedDate(day);
    setEventForm({
      title: '',
      description: '',
      start_time: format(day, "yyyy-MM-dd'T'09:00"),
      end_time: format(day, "yyyy-MM-dd'T'10:00"),
      priority_id: ''
    });
    setShowEventModal(true);
  };

  // Save event modification
  const handleSaveEvent = async () => {
    if (!selectedEvent) return;
    
    const mod: EventModification = {
      event_id: selectedEvent.event_id,
      original: selectedEvent,
      modified: {
        title: eventForm.title,
        description: eventForm.description,
        start_time: eventForm.start_time,
        end_time: eventForm.end_time,
        priority_id: eventForm.priority_id ? parseInt(eventForm.priority_id) : null
      }
    };
    
    const newMods = new Map(modifications);
    newMods.set(selectedEvent.event_id, mod);
    setModifications(newMods);
    
    // Save to backend
    try {
      await fetch(`http://localhost:3001/api/scenarios/${scenarioId}/events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          event_id: selectedEvent.event_id,
          modified_fields: mod.modified
        })
      });
    } catch (error) {
      console.error('Failed to save modification:', error);
    }
    
    setShowEventModal(false);
  };

  // Delete event (mark as deleted in scenario)
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    const mod: EventModification = {
      event_id: selectedEvent.event_id,
      original: selectedEvent,
      modified: { deleted: true }
    };
    
    const newMods = new Map(modifications);
    newMods.set(selectedEvent.event_id, mod);
    setModifications(newMods);
    
    // Save to backend
    try {
      await fetch(`http://localhost:3001/api/scenarios/${scenarioId}/events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          event_id: selectedEvent.event_id,
          modified_fields: { deleted: true }
        })
      });
    } catch (error) {
      console.error('Failed to save deletion:', error);
    }
    
    setShowEventModal(false);
  };

  // Revert event to original
  const handleRevertEvent = async () => {
    if (!selectedEvent) return;
    
    const newMods = new Map(modifications);
    newMods.delete(selectedEvent.event_id);
    setModifications(newMods);
    
    // Remove from backend
    try {
      await fetch(`http://localhost:3001/api/scenarios/${scenarioId}/events/${selectedEvent.event_id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
    } catch (error) {
      console.error('Failed to revert:', error);
    }
    
    setShowEventModal(false);
  };

  // Apply scenario
  const handleApplyScenario = async () => {
    if (modifications.size === 0) {
      alert('No changes to apply!');
      return;
    }
    
    if (!window.confirm(`Apply ${modifications.size} changes to your calendar? This cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/scenarios/${scenarioId}/apply`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        alert('Scenario applied successfully!');
        navigate('/whatif');
      } else {
        throw new Error('Failed to apply');
      }
    } catch (error) {
      alert('Failed to apply scenario. Please try again.');
    }
  };

  // Export to ICS (Google Calendar compatible)
  const handleExportICS = () => {
    const modifiedEvents = events.map(event => {
      const mod = modifications.get(event.event_id);
      if (mod?.modified.deleted) return null;
      
      const finalEvent = mod ? { ...event, ...mod.modified } : event;
      
      const start = parseISO(finalEvent.start_time);
      const end = parseISO(finalEvent.end_time);
      
      return {
        start: [start.getFullYear(), start.getMonth() + 1, start.getDate(), start.getHours(), start.getMinutes()] as [number, number, number, number, number],
        end: [end.getFullYear(), end.getMonth() + 1, end.getDate(), end.getHours(), end.getMinutes()] as [number, number, number, number, number],
        title: finalEvent.title,
        description: finalEvent.description || '',
        status: 'CONFIRMED' as const,
        busyStatus: 'BUSY' as const
      };
    }).filter(Boolean);

    createEvents(modifiedEvents as any, (error, value) => {
      if (error) {
        console.error(error);
        alert('Failed to generate calendar file');
        return;
      }
      
      // Download the file
      const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${scenario?.name || 'calendar'}-whatif.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setShowExportModal(false);
    });
  };

  const days = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading || !scenario) {
    return (
      <PageContainer isDark={isDark}>
        <ContentContainer>
          <div style={{ textAlign: 'center', padding: '100px', color: isDark ? '#60a5fa' : '#0891b2', fontSize: '1.5rem' }}>
            ⏳ Loading scenario...
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
            <BackButton to="/whatif" isDark={isDark}>← Back</BackButton>
            <ScenarioInfo>
              <h1>🤔 {scenario.name} <SandboxBadge>Sandbox</SandboxBadge></h1>
              <p>{scenario.description || 'Test your schedule changes here'}</p>
            </ScenarioInfo>
          </HeaderLeft>
          <HeaderRight>
            <HeaderButton onClick={() => setShowExportModal(true)}>
              📥 Export to Google
            </HeaderButton>
            <HeaderButton 
              variant="success" 
              onClick={handleApplyScenario}
              disabled={modifications.size === 0}
            >
              ✅ Apply Changes ({modifications.size})
            </HeaderButton>
          </HeaderRight>
        </Header>

        <CalendarNav isDark={isDark}>
          <NavButtons>
            <NavButton isDark={isDark} onClick={prevMonth}>◀ Prev</NavButton>
            <NavButton isDark={isDark} onClick={goToToday}>Today</NavButton>
            <NavButton isDark={isDark} onClick={nextMonth}>Next ▶</NavButton>
          </NavButtons>
          <CurrentMonth isDark={isDark}>{format(currentDate, 'MMMM yyyy')}</CurrentMonth>
          <ChangesIndicator isDark={isDark} hasChanges={modifications.size > 0}>
            {modifications.size > 0 ? `⚠️ ${modifications.size} unsaved changes` : '✓ No changes'}
          </ChangesIndicator>
        </CalendarNav>

        <CalendarContainer isDark={isDark}>
          <WeekDaysHeader isDark={isDark}>
            {weekDays.map(day => (
              <WeekDay key={day}>{day}</WeekDay>
            ))}
          </WeekDaysHeader>

          <DaysGrid>
            {days.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <DayCell
                  key={index}
                  isCurrentMonth={isCurrentMonth}
                  isToday={isToday}
                  isDark={isDark}
                  onClick={() => handleDayClick(day)}
                >
                  <DayNumber isToday={isToday} isCurrentMonth={isCurrentMonth} isDark={isDark}>
                    {format(day, 'd')}
                  </DayNumber>
                  <EventsContainer>
                    {dayEvents.map((event: any) => (
                      <EventChip
                        key={event.event_id}
                        color={event.priority_color || (isDark ? '#818cf8' : '#667eea')}
                        isModified={event.isModified}
                        isDeleted={event.isDeleted}
                        onClick={(e) => handleEventClick(event, e)}
                        title={event.isDeleted ? 'Deleted' : event.isModified ? 'Modified' : event.title}
                      >
                        {event.title}
                      </EventChip>
                    ))}
                  </EventsContainer>
                </DayCell>
              );
            })}
          </DaysGrid>
        </CalendarContainer>
      </ContentContainer>

      {/* Edit Event Modal */}
      {showEventModal && selectedEvent && (
        <ModalOverlay onClick={() => setShowEventModal(false)}>
          <Modal isDark={isDark} onClick={e => e.stopPropagation()}>
            <ModalTitle isDark={isDark}>
              ✏️ Edit Event {modifications.has(selectedEvent.event_id) && '(Modified)'}
            </ModalTitle>

            <FormGroup>
              <Label isDark={isDark}>Title</Label>
              <Input
                isDark={isDark}
                type="text"
                value={eventForm.title}
                onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label isDark={isDark}>Start Time</Label>
              <Input
                isDark={isDark}
                type="datetime-local"
                value={eventForm.start_time}
                onChange={e => setEventForm({ ...eventForm, start_time: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label isDark={isDark}>End Time</Label>
              <Input
                isDark={isDark}
                type="datetime-local"
                value={eventForm.end_time}
                onChange={e => setEventForm({ ...eventForm, end_time: e.target.value })}
              />
            </FormGroup>

            <ButtonRow>
              {modifications.has(selectedEvent.event_id) && (
                <Button variant="secondary" isDark={isDark} onClick={handleRevertEvent}>
                  ↩️ Revert
                </Button>
              )}
              <Button variant="danger" isDark={isDark} onClick={handleDeleteEvent}>
                🗑️ Delete
              </Button>
              <Button variant="secondary" isDark={isDark} onClick={() => setShowEventModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" isDark={isDark} onClick={handleSaveEvent}>
                💾 Save
              </Button>
            </ButtonRow>
          </Modal>
        </ModalOverlay>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ModalOverlay onClick={() => setShowExportModal(false)}>
          <ExportModal isDark={isDark} onClick={e => e.stopPropagation()}>
            <ModalTitle isDark={isDark}>📥 Export to Google Calendar</ModalTitle>
            
            <p style={{ color: isDark ? themes.dark.textSecondary : '#666', marginBottom: '20px' }}>
              Export your What-If scenario (with all modifications) to Google Calendar.
            </p>

            <ExportOptions>
              <ExportOption isDark={isDark} onClick={handleExportICS}>
                <div className="icon">📄</div>
                <div className="info">
                  <h4>Download .ICS File</h4>
                  <p>Download and manually import into Google Calendar</p>
                </div>
              </ExportOption>
              
              <ExportOption isDark={isDark} style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                <div className="icon">🔗</div>
                <div className="info">
                  <h4>Connect Google Account (Coming Soon)</h4>
                  <p>Sync directly with your Google Calendar</p>
                </div>
              </ExportOption>
            </ExportOptions>

            <ButtonRow>
              <Button variant="secondary" isDark={isDark} onClick={() => setShowExportModal(false)}>
                Close
              </Button>
            </ButtonRow>
          </ExportModal>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default ScenarioEditorPage;

