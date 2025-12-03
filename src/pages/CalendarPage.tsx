import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { useTheme, themes } from '../context/ThemeContext';
import GoogleCalendarSync from '../components/GoogleCalendarSync';
import ChatSidebar from '../components/ChatSidebar';

// ============ STYLED COMPONENTS ============

const PageContainer = styled.div<{ isDark: boolean }>`
  min-height: 100vh;
  background: ${props => props.isDark ? themes.dark.bgPrimary : themes.light.bgPrimary};
  padding: 20px;
  transition: background 0.3s ease;
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 50%, #6d28d9 100%)' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  border-radius: 15px;
  padding: 20px 30px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  box-shadow: ${props => props.isDark ? themes.dark.shadow : '0 4px 15px rgba(102, 126, 234, 0.4)'};
  transition: all 0.3s ease;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  color: white;
  margin: 0;
  font-size: 1.8rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const NavButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const CurrentMonth = styled.h2`
  color: white;
  margin: 0;
  font-size: 1.5rem;
  min-width: 200px;
  text-align: center;
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
  color: ${props => props.isDark ? 'white' : '#667eea'};
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

const AddEventButton = styled.button<{ isDark: boolean }>`
  background: ${props => props.isDark ? '#22c55e' : '#4CAF50'};
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    background: ${props => props.isDark ? '#16a34a' : '#43a047'};
  }
`;

const CalendarContainer = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? themes.dark.calendarBg : themes.light.calendarBg};
  border-radius: 15px;
  box-shadow: ${props => props.isDark ? themes.dark.shadow : themes.light.shadow};
  overflow: hidden;
  transition: all 0.3s ease;
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
`;

const WeekDaysHeader = styled.div<{ isDark: boolean }>`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)' 
    : '#667eea'};
`;

const WeekDay = styled.div`
  padding: 15px;
  text-align: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
`;

const DayCell = styled.div<{ isCurrentMonth: boolean; isToday: boolean; isDark: boolean }>`
  min-height: 120px;
  padding: 8px;
  border: 1px solid ${props => props.isDark ? themes.dark.borderColor : themes.light.borderColor};
  background: ${props => {
    if (props.isToday) return props.isDark ? themes.dark.bgToday : themes.light.bgToday;
    if (props.isCurrentMonth) return props.isDark ? themes.dark.dayBg : themes.light.dayBg;
    return props.isDark ? themes.dark.dayBgOther : themes.light.dayBgOther;
  }};
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: ${props => {
      if (props.isToday) return props.isDark ? themes.dark.bgTodayHover : themes.light.bgTodayHover;
      return props.isDark ? themes.dark.bgHover : themes.light.bgHover;
    }};
  }
`;

const DayNumber = styled.div<{ isToday: boolean; isCurrentMonth: boolean; isDark: boolean }>`
  font-weight: ${props => props.isToday ? '700' : '500'};
  font-size: 0.9rem;
  color: ${props => {
    if (props.isToday) return props.isDark ? '#60a5fa' : '#1976d2';
    if (props.isCurrentMonth) return props.isDark ? themes.dark.textPrimary : themes.light.textPrimary;
    return props.isDark ? themes.dark.textMuted : themes.light.textMuted;
  }};
  margin-bottom: 5px;
  
  ${props => props.isToday && `
    background: ${props.isDark ? '#3b82f6' : '#1976d2'};
    color: white !important;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  `}
`;

const EventsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 80px;
  overflow-y: auto;
`;

const EventChip = styled.div<{ color: string }>`
  background: ${props => props.color || '#667eea'};
  color: white;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: transform 0.2s;
  
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
  background: ${props => props.isDark ? themes.dark.bgCard : themes.light.bgCard};
  border-radius: 15px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${props => props.isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 10px 40px rgba(0,0,0,0.3)'};
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
  transition: all 0.3s ease;
`;

const ModalTitle = styled.h2<{ isDark: boolean }>`
  color: ${props => props.isDark ? themes.dark.primary : themes.light.primary};
  margin: 0 0 20px 0;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label<{ isDark: boolean }>`
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: ${props => props.isDark ? themes.dark.textPrimary : themes.light.textPrimary};
`;

const Input = styled.input<{ isDark: boolean }>`
  width: 100%;
  padding: 12px;
  border: 2px solid ${props => props.isDark ? themes.dark.borderColor : themes.light.borderColor};
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: all 0.2s;
  background: ${props => props.isDark ? themes.dark.bgSecondary : themes.light.bgSecondary};
  color: ${props => props.isDark ? themes.dark.textPrimary : themes.light.textPrimary};
  
  &:focus {
    outline: none;
    border-color: ${props => props.isDark ? themes.dark.primary : themes.light.primary};
  }
  
  &::placeholder {
    color: ${props => props.isDark ? themes.dark.textMuted : themes.light.textMuted};
  }
`;

const TextArea = styled.textarea<{ isDark: boolean }>`
  width: 100%;
  padding: 12px;
  border: 2px solid ${props => props.isDark ? themes.dark.borderColor : themes.light.borderColor};
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s;
  background: ${props => props.isDark ? themes.dark.bgSecondary : themes.light.bgSecondary};
  color: ${props => props.isDark ? themes.dark.textPrimary : themes.light.textPrimary};
  
  &:focus {
    outline: none;
    border-color: ${props => props.isDark ? themes.dark.primary : themes.light.primary};
  }
  
  &::placeholder {
    color: ${props => props.isDark ? themes.dark.textMuted : themes.light.textMuted};
  }
`;

const Select = styled.select<{ isDark: boolean }>`
  width: 100%;
  padding: 12px;
  border: 2px solid ${props => props.isDark ? themes.dark.borderColor : themes.light.borderColor};
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.isDark ? themes.dark.bgSecondary : themes.light.bgSecondary};
  color: ${props => props.isDark ? themes.dark.textPrimary : themes.light.textPrimary};
  
  &:focus {
    outline: none;
    border-color: ${props => props.isDark ? themes.dark.primary : themes.light.primary};
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
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
          background: ${isDark ? themes.dark.danger : themes.light.danger};
          color: white;
          &:hover { background: #dc2626; }
        `;
      case 'secondary':
        return `
          background: ${isDark ? themes.dark.bgHover : themes.light.bgHover};
          color: ${isDark ? themes.dark.textPrimary : themes.light.textPrimary};
          &:hover { background: ${isDark ? '#3f3f46' : '#d0d0d0'}; }
        `;
      default:
        return `
          background: ${isDark ? themes.dark.primary : themes.light.primary};
          color: white;
          &:hover { background: ${isDark ? themes.dark.primaryHover : themes.light.primaryHover}; }
        `;
    }
  }}
`;

const ErrorMessage = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? '#7f1d1d' : '#ffebee'};
  color: ${props => props.isDark ? '#fca5a5' : '#c62828'};
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid ${props => props.isDark ? '#991b1b' : '#ef9a9a'};
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

interface EventFormData {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  priority_id: string;
}

// ============ COMPONENT ============

const CalendarPage: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGoogleSync, setShowGoogleSync] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    priority_id: ''
  });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

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
      
      const [eventsRes, prioritiesRes] = await Promise.all([
        fetch('http://localhost:3001/api/events', { headers }),
        fetch('http://localhost:3001/api/priorities', { headers })
      ]);

      if (eventsRes.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
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

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.start_time);
      return isSameDay(eventDate, day);
    });
  };

  // Handle day click - open modal to add event
  const handleDayClick = (day: Date) => {
    setSelectedEvent(null);
    setSelectedDate(day);
    setFormData({
      title: '',
      description: '',
      start_time: format(day, "yyyy-MM-dd'T'09:00"),
      end_time: format(day, "yyyy-MM-dd'T'10:00"),
      priority_id: ''
    });
    setFormError('');
    setShowModal(true);
  };

  // Handle event click - open modal to edit
  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setSelectedDate(null);
    setFormData({
      title: event.title,
      description: event.description || '',
      start_time: event.start_time.slice(0, 16),
      end_time: event.end_time.slice(0, 16),
      priority_id: event.priority_id?.toString() || ''
    });
    setFormError('');
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Title is required');
      return;
    }

    if (!formData.start_time || !formData.end_time) {
      setFormError('Start and end times are required');
      return;
    }

    try {
      const headers = getAuthHeaders();
      const eventData = {
        title: formData.title,
        description: formData.description,
        start_time: formData.start_time,
        end_time: formData.end_time,
        priority_id: formData.priority_id ? parseInt(formData.priority_id) : null
      };

      let response;
      if (selectedEvent) {
        response = await fetch(`http://localhost:3001/api/events/${selectedEvent.event_id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(eventData)
        });
      } else {
        response = await fetch('http://localhost:3001/api/events', {
          method: 'POST',
          headers,
          body: JSON.stringify(eventData)
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      setFormError('Failed to save event. Please try again.');
    }
  };

  // Handle delete event
  const handleDelete = async () => {
    if (!selectedEvent) return;

    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`http://localhost:3001/api/events/${selectedEvent.event_id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      setFormError('Failed to delete event. Please try again.');
    }
  };

  const days = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <PageContainer isDark={isDark}>
        <ContentContainer>
          <div style={{ 
            textAlign: 'center', 
            padding: '100px', 
            color: isDark ? themes.dark.primary : themes.light.primary, 
            fontSize: '1.5rem' 
          }}>
            ⏳ Loading calendar...
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
            <Title>📅 Calendar</Title>
            <NavButtons>
              <NavButton onClick={prevMonth}>◀ Prev</NavButton>
              <NavButton onClick={goToToday}>Today</NavButton>
              <NavButton onClick={nextMonth}>Next ▶</NavButton>
            </NavButtons>
            <CurrentMonth>{format(currentDate, 'MMMM yyyy')}</CurrentMonth>
          </HeaderLeft>
          <HeaderRight>
            <ThemeToggle isDark={isDark} onClick={toggleTheme} title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
              {isDark ? '☀️' : '🌙'}
            </ThemeToggle>
            <AddEventButton isDark={isDark} onClick={() => setShowGoogleSync(true)}>
              📅 Google
            </AddEventButton>
            <AddEventButton isDark={isDark} onClick={() => handleDayClick(new Date())}>
              ➕ Add Event
            </AddEventButton>
            <HeaderButton to="/dashboard" isDark={isDark}>📊 Dashboard</HeaderButton>
          </HeaderRight>
        </Header>

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
                    {dayEvents.map(event => (
                      <EventChip
                        key={event.event_id}
                        color={event.priority_color || (isDark ? themes.dark.primary : themes.light.primary)}
                        onClick={(e) => handleEventClick(event, e)}
                        title={`${event.title} - ${format(parseISO(event.start_time), 'h:mm a')}`}
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

      {/* Add/Edit Event Modal */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal isDark={isDark} onClick={e => e.stopPropagation()}>
            <ModalTitle isDark={isDark}>
              {selectedEvent ? '✏️ Edit Event' : '➕ New Event'}
            </ModalTitle>

            {formError && <ErrorMessage isDark={isDark}>{formError}</ErrorMessage>}

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label isDark={isDark}>Title *</Label>
                <Input
                  isDark={isDark}
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Event title"
                  autoFocus
                />
              </FormGroup>

              <FormGroup>
                <Label isDark={isDark}>Description</Label>
                <TextArea
                  isDark={isDark}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add a description..."
                />
              </FormGroup>

              <FormGroup>
                <Label isDark={isDark}>Start Time *</Label>
                <Input
                  isDark={isDark}
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label isDark={isDark}>End Time *</Label>
                <Input
                  isDark={isDark}
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label isDark={isDark}>Priority</Label>
                <Select
                  isDark={isDark}
                  value={formData.priority_id}
                  onChange={e => setFormData({ ...formData, priority_id: e.target.value })}
                >
                  <option value="">No priority</option>
                  {priorities.map(priority => (
                    <option key={priority.priority_id} value={priority.priority_id}>
                      {priority.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <ButtonRow>
                {selectedEvent && (
                  <Button type="button" variant="danger" isDark={isDark} onClick={handleDelete}>
                    🗑️ Delete
                  </Button>
                )}
                <Button type="button" variant="secondary" isDark={isDark} onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isDark={isDark}>
                  {selectedEvent ? '💾 Save Changes' : '➕ Create Event'}
                </Button>
              </ButtonRow>
            </form>
          </Modal>
        </ModalOverlay>
      )}

      {showGoogleSync && (
        <GoogleCalendarSync isDark={isDark} onClose={() => setShowGoogleSync(false)} />
      )}
      
      <ChatSidebar isDark={isDark} />
    </PageContainer>
  );
};

export default CalendarPage;
