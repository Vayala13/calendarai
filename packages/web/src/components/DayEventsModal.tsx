import React from 'react';
import styled from 'styled-components';
import { format, parseISO } from 'date-fns';
import { themes } from '../context/ThemeContext';

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
  color_override?: string | null;
  is_whatif?: boolean;
  created_at?: string;
  isModified?: boolean;
  isDeleted?: boolean;
}

interface DayEventsModalProps {
  date: Date;
  events: Event[];
  isDark: boolean;
  onClose: () => void;
  onEventClick: (event: Event, e: React.MouseEvent) => void;
}

// ============ STYLED COMPONENTS ============

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContainer = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? themes.dark.bgCard : 'white'};
  border-radius: 20px;
  width: 90%;
  max-width: 420px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s ease-out;
  overflow: hidden;
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
  
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 50%, #6d28d9 100%)' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const HeaderContent = styled.div`
  color: white;
`;

const DayOfWeek = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.9;
  margin-bottom: 4px;
`;

const DayNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
  
  &:focus {
    outline: 2px solid white;
    outline-offset: 2px;
  }
`;

const EventsList = styled.div`
  overflow-y: auto;
  padding: 8px 0;
  flex: 1;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    
    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
`;

const EventItem = styled.div<{ isDark: boolean; isDeleted?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 24px;
  cursor: pointer;
  transition: background 0.2s;
  opacity: ${props => props.isDeleted ? 0.5 : 1};
  
  &:hover {
    background: ${props => props.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
  }
  
  &:active {
    background: ${props => props.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'};
  }
`;

const EventDot = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.color};
  flex-shrink: 0;
  margin-top: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const EventContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const EventTime = styled.div<{ isDark: boolean }>`
  font-size: 0.85rem;
  color: ${props => props.isDark ? themes.dark.textSecondary : '#666'};
  margin-bottom: 4px;
  font-weight: 500;
`;

const EventTitle = styled.div<{ isDark: boolean; isDeleted?: boolean }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.isDark ? themes.dark.textPrimary : '#1f2937'};
  margin-bottom: 2px;
  text-decoration: ${props => props.isDeleted ? 'line-through' : 'none'};
  word-wrap: break-word;
`;

const EventPriority = styled.div<{ isDark: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.isDark ? themes.dark.textMuted : '#9ca3af'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ModifiedBadge = styled.span`
  background: #fbbf24;
  color: #78350f;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 6px;
`;

const EmptyState = styled.div<{ isDark: boolean }>`
  padding: 60px 24px;
  text-align: center;
  color: ${props => props.isDark ? themes.dark.textMuted : '#9ca3af'};
  
  .icon {
    font-size: 3rem;
    margin-bottom: 12px;
    opacity: 0.5;
  }
  
  .text {
    font-size: 0.95rem;
  }
`;

// ============ COMPONENT ============

export const DayEventsModal: React.FC<DayEventsModalProps> = ({
  date,
  events,
  isDark,
  onClose,
  onEventClick
}) => {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  const formatEventTime = (startTime: string, endTime: string) => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    return `${format(start, 'h:mma')} - ${format(end, 'h:mma')}`;
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer isDark={isDark} onClick={e => e.stopPropagation()}>
        <ModalHeader isDark={isDark}>
          <HeaderContent>
            <DayOfWeek>{format(date, 'EEE').toUpperCase()}</DayOfWeek>
            <DayNumber>{format(date, 'd')}</DayNumber>
          </HeaderContent>
          <CloseButton 
            onClick={onClose}
            aria-label="Close modal"
            title="Close (Esc)"
          >
            ✕
          </CloseButton>
        </ModalHeader>

        {sortedEvents.length === 0 ? (
          <EmptyState isDark={isDark}>
            <div className="icon">📅</div>
            <div className="text">No events scheduled for this day</div>
          </EmptyState>
        ) : (
          <EventsList>
            {sortedEvents.map(event => (
              <EventItem
                key={event.event_id}
                isDark={isDark}
                isDeleted={event.isDeleted}
                onClick={(e) => onEventClick(event, e)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onEventClick(event, e as any);
                  }
                }}
              >
                <EventDot color={event.priority_color || '#667eea'} />
                <EventContent>
                  <EventTime isDark={isDark}>
                    {formatEventTime(event.start_time, event.end_time)}
                  </EventTime>
                  <EventTitle isDark={isDark} isDeleted={event.isDeleted}>
                    {event.title}
                    {event.isModified && <ModifiedBadge>MODIFIED</ModifiedBadge>}
                  </EventTitle>
                  {event.priority_name && event.priority_name.trim() && (
                    <EventPriority isDark={isDark}>
                      {event.priority_name}
                    </EventPriority>
                  )}
                </EventContent>
              </EventItem>
            ))}
          </EventsList>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
};

export default DayEventsModal;

