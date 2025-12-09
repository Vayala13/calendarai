import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// ============ ANIMATIONS ============

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const thinking = keyframes`
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
`;

// ============ ANTHROPIC-INSPIRED THEME ============

const theme = {
  light: {
    bg: '#FAFAF9',
    bgSecondary: '#FFFFFF',
    bgTertiary: '#F5F5F4',
    text: '#1C1917',
    textSecondary: '#57534E',
    textMuted: '#A8A29E',
    accent: '#D97757',
    accentLight: '#FDEBE6',
    accentDark: '#C4593D',
    border: '#E7E5E4',
    borderLight: '#F5F5F4',
    userBubble: '#1C1917',
    userText: '#FFFFFF',
    aiBubble: '#FFFFFF',
    aiText: '#1C1917',
    shadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
    shadowLg: '0 12px 48px rgba(0, 0, 0, 0.12)',
  },
  dark: {
    bg: '#18181B',
    bgSecondary: '#27272A',
    bgTertiary: '#3F3F46',
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    accent: '#D97757',
    accentLight: '#3D2A24',
    accentDark: '#E8927A',
    border: '#3F3F46',
    borderLight: '#27272A',
    userBubble: '#D97757',
    userText: '#FFFFFF',
    aiBubble: '#27272A',
    aiText: '#FAFAFA',
    shadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
    shadowLg: '0 12px 48px rgba(0, 0, 0, 0.4)',
  }
};

// ============ STYLED COMPONENTS ============

const SidebarContainer = styled.div<{ isOpen: boolean; isDark: boolean }>`
  position: fixed;
  right: ${props => props.isOpen ? '0' : '-440px'};
  top: 0;
  height: 100vh;
  width: 420px;
  background: ${props => props.isDark ? theme.dark.bg : theme.light.bg};
  box-shadow: ${props => props.isOpen ? (props.isDark ? theme.dark.shadowLg : theme.light.shadowLg) : 'none'};
  transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  border-left: 1px solid ${props => props.isDark ? theme.dark.border : theme.light.border};
  
  @media (max-width: 500px) {
    width: 100%;
    right: ${props => props.isOpen ? '0' : '-100%'};
  }
`;

const Header = styled.div<{ isDark: boolean }>`
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${props => props.isDark ? theme.dark.border : theme.light.border};
  background: ${props => props.isDark ? theme.dark.bgSecondary : theme.light.bgSecondary};
`;

const HeaderTitle = styled.div<{ isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  
  .logo {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #D97757 0%, #E8927A 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 2px 8px rgba(217, 119, 87, 0.3);
  }
  
  .info {
    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: ${props => props.isDark ? theme.dark.text : theme.light.text};
      letter-spacing: -0.02em;
    }
    
    .model {
      font-size: 0.75rem;
      color: ${props => props.isDark ? theme.dark.textMuted : theme.light.textMuted};
      margin-top: 2px;
      font-weight: 500;
    }
  }
`;

const CloseButton = styled.button<{ isDark: boolean }>`
  background: transparent;
  border: none;
  color: ${props => props.isDark ? theme.dark.textSecondary : theme.light.textSecondary};
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.isDark ? theme.dark.bgTertiary : theme.light.bgTertiary};
    color: ${props => props.isDark ? theme.dark.text : theme.light.text};
  }
`;

const MessagesContainer = styled.div<{ isDark: boolean }>`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.isDark ? theme.dark.border : theme.light.border};
    border-radius: 3px;
  }
`;

const Message = styled.div<{ isUser: boolean; isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  animation: ${fadeIn} 0.3s ease;
`;

const MessageBubble = styled.div<{ isUser: boolean; isDark: boolean }>`
  max-width: 88%;
  background: ${props => props.isUser 
    ? (props.isDark ? theme.dark.userBubble : theme.light.userBubble)
    : (props.isDark ? theme.dark.aiBubble : theme.light.aiBubble)};
  color: ${props => props.isUser 
    ? (props.isDark ? theme.dark.userText : theme.light.userText)
    : (props.isDark ? theme.dark.aiText : theme.light.aiText)};
  padding: 14px 18px;
  border-radius: ${props => props.isUser ? '20px 20px 6px 20px' : '20px 20px 20px 6px'};
  font-size: 0.9rem;
  line-height: 1.6;
  box-shadow: ${props => props.isUser ? 'none' : (props.isDark ? theme.dark.shadow : theme.light.shadow)};
  border: ${props => props.isUser ? 'none' : `1px solid ${props.isDark ? theme.dark.border : theme.light.border}`};
  
  p {
    margin: 0 0 12px 0;
    &:last-child { margin: 0; }
  }
  
  ul, ol {
    margin: 12px 0;
    padding-left: 20px;
  }
  
  li {
    margin-bottom: 6px;
  }
  
  strong {
    font-weight: 600;
  }
  
  code {
    background: ${props => props.isUser 
      ? 'rgba(255,255,255,0.15)' 
      : (props.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')};
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85em;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }
`;

const MessageMeta = styled.div<{ isUser: boolean; isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  padding: 0 4px;
  
  .time {
    font-size: 0.7rem;
    color: ${props => props.isDark ? theme.dark.textMuted : theme.light.textMuted};
    font-weight: 500;
  }
`;

const ThinkingBadge = styled.button<{ isDark: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${props => props.isDark ? theme.dark.accentLight : theme.light.accentLight};
  color: ${props => props.isDark ? theme.dark.accentDark : theme.light.accent};
  border: none;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.02);
  }
`;

const ThinkingModal = styled.div<{ isDark: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 500px;
  max-height: 70vh;
  background: ${props => props.isDark ? theme.dark.bgSecondary : theme.light.bgSecondary};
  border-radius: 16px;
  box-shadow: ${props => props.isDark ? theme.dark.shadowLg : theme.light.shadowLg};
  border: 1px solid ${props => props.isDark ? theme.dark.border : theme.light.border};
  z-index: 1100;
  overflow: hidden;
  animation: ${fadeIn} 0.2s ease;
`;

const ThinkingModalHeader = styled.div<{ isDark: boolean }>`
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.isDark ? theme.dark.border : theme.light.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h4 {
    margin: 0;
    font-size: 0.95rem;
    color: ${props => props.isDark ? theme.dark.text : theme.light.text};
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const ThinkingModalContent = styled.div<{ isDark: boolean }>`
  padding: 20px;
  max-height: 50vh;
  overflow-y: auto;
  font-size: 0.85rem;
  line-height: 1.7;
  color: ${props => props.isDark ? theme.dark.textSecondary : theme.light.textSecondary};
  white-space: pre-wrap;
  font-family: 'SF Mono', 'Fira Code', monospace;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1050;
`;

const ThinkingIndicator = styled.div<{ isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  animation: ${slideIn} 0.3s ease;
  
  .avatar {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #D97757 0%, #E8927A 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
  }
  
  .content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .label {
      font-size: 0.8rem;
      font-weight: 600;
      color: ${props => props.isDark ? theme.dark.accent : theme.light.accent};
    }
    
    .dots {
      display: flex;
      gap: 4px;
      
      span {
        width: 6px;
        height: 6px;
        background: ${props => props.isDark ? theme.dark.accent : theme.light.accent};
        border-radius: 50%;
        animation: ${thinking} 1.4s ease infinite;
        
        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }
  }
`;

const InputContainer = styled.div<{ isDark: boolean }>`
  padding: 16px 20px 20px;
  background: ${props => props.isDark ? theme.dark.bgSecondary : theme.light.bgSecondary};
  border-top: 1px solid ${props => props.isDark ? theme.dark.border : theme.light.border};
`;

const InputWrapper = styled.div<{ isDark: boolean; isFocused: boolean }>`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: ${props => props.isDark ? theme.dark.bg : theme.light.bg};
  border-radius: 16px;
  padding: 12px 12px 12px 18px;
  border: 2px solid ${props => props.isFocused 
    ? (props.isDark ? theme.dark.accent : theme.light.accent)
    : (props.isDark ? theme.dark.border : theme.light.border)};
  transition: all 0.2s;
  box-shadow: ${props => props.isFocused 
    ? `0 0 0 3px ${props.isDark ? 'rgba(217, 119, 87, 0.15)' : 'rgba(217, 119, 87, 0.1)'}`
    : 'none'};
`;

const Input = styled.textarea<{ isDark: boolean }>`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  color: ${props => props.isDark ? theme.dark.text : theme.light.text};
  outline: none;
  resize: none;
  min-height: 24px;
  max-height: 120px;
  line-height: 1.5;
  font-family: inherit;
  
  &::placeholder {
    color: ${props => props.isDark ? theme.dark.textMuted : theme.light.textMuted};
  }
`;

const SendButton = styled.button<{ isDark: boolean; hasContent: boolean }>`
  background: ${props => props.hasContent 
    ? 'linear-gradient(135deg, #D97757 0%, #C4593D 100%)'
    : (props.isDark ? theme.dark.bgTertiary : theme.light.bgTertiary)};
  border: none;
  color: ${props => props.hasContent ? 'white' : (props.isDark ? theme.dark.textMuted : theme.light.textMuted)};
  width: 40px;
  height: 40px;
  border-radius: 12px;
  cursor: ${props => props.hasContent ? 'pointer' : 'default'};
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  
  &:hover {
    ${props => props.hasContent && `
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(217, 119, 87, 0.3);
    `}
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const WelcomeMessage = styled.div<{ isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 24px;
  animation: ${fadeIn} 0.4s ease;
  
  .logo {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #D97757 0%, #E8927A 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin-bottom: 20px;
    box-shadow: 0 8px 24px rgba(217, 119, 87, 0.25);
  }
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: ${props => props.isDark ? theme.dark.text : theme.light.text};
    letter-spacing: -0.02em;
  }
  
  p {
    margin: 0 0 24px 0;
    font-size: 0.85rem;
    color: ${props => props.isDark ? theme.dark.textSecondary : theme.light.textSecondary};
    line-height: 1.6;
    max-width: 280px;
  }
`;

const SuggestionsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const SuggestionButton = styled.button<{ isDark: boolean }>`
  background: ${props => props.isDark ? theme.dark.bgSecondary : theme.light.bgSecondary};
  border: 1px solid ${props => props.isDark ? theme.dark.border : theme.light.border};
  color: ${props => props.isDark ? theme.dark.textSecondary : theme.light.textSecondary};
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.85rem;
  text-align: left;
  transition: all 0.2s;
  line-height: 1.4;
  
  &:hover {
    background: ${props => props.isDark ? theme.dark.accentLight : theme.light.accentLight};
    border-color: ${props => props.isDark ? theme.dark.accent : theme.light.accent};
    color: ${props => props.isDark ? theme.dark.accentDark : theme.light.accent};
    transform: translateY(-1px);
  }
`;

const ToggleButton = styled.button<{ isDark: boolean; isOpen: boolean }>`
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #D97757 0%, #C4593D 100%);
  border: none;
  color: white;
  font-size: 1.4rem;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(217, 119, 87, 0.35);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => !props.isOpen && `
    &:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(217, 119, 87, 0.45);
    }
  `}
  
  ${props => props.isOpen && `
    opacity: 0;
    pointer-events: none;
    transform: scale(0.8);
  `}
`;

const ErrorMessage = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2'};
  color: ${props => props.isDark ? '#FCA5A5' : '#991B1B'};
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.85rem;
  border: 1px solid ${props => props.isDark ? 'rgba(239, 68, 68, 0.3)' : '#FECACA'};
  animation: ${fadeIn} 0.3s ease;
`;

// ============ INTERFACES ============

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  timestamp: Date;
}

interface Props {
  isDark: boolean;
}

// ============ COMPONENT ============

const ChatSidebar: React.FC<Props> = ({ isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(`chat_${Date.now()}`);
  const [isFocused, setIsFocused] = useState(false);
  const [showThinking, setShowThinking] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    setError(null);
    setInput('');
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat/message', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: text,
          sessionId,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to get response');
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        thinking: data.thinking,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const suggestions = [
    "How can I better balance my priorities?",
    "What should I focus on today?",
    "Am I on track with my weekly goals?",
    "Help me plan tomorrow"
  ];

  return (
    <>
      <ToggleButton isDark={isDark} isOpen={isOpen} onClick={() => setIsOpen(true)}>
        ✨
      </ToggleButton>

      <SidebarContainer isOpen={isOpen} isDark={isDark}>
        <Header isDark={isDark}>
          <HeaderTitle isDark={isDark}>
            <div className="logo">✨</div>
            <div className="info">
              <h3>Claude Assistant</h3>
              <div className="model">Sonnet 4 · Extended Thinking</div>
            </div>
          </HeaderTitle>
          <CloseButton isDark={isDark} onClick={() => setIsOpen(false)}>✕</CloseButton>
        </Header>

        <MessagesContainer isDark={isDark}>
          {messages.length === 0 ? (
            <WelcomeMessage isDark={isDark}>
              <div className="logo">✨</div>
              <h4>Hi, I'm Claude</h4>
              <p>I'm your AI scheduling assistant. I can help you manage your time and stay aligned with your priorities.</p>
              <SuggestionsGrid>
                {suggestions.map((s, i) => (
                  <SuggestionButton 
                    key={i} 
                    isDark={isDark}
                    onClick={() => sendMessage(s)}
                  >
                    {s}
                  </SuggestionButton>
                ))}
              </SuggestionsGrid>
            </WelcomeMessage>
          ) : (
            messages.map((msg, index) => (
              <Message key={index} isUser={msg.role === 'user'} isDark={isDark}>
                <MessageBubble isUser={msg.role === 'user'} isDark={isDark}>
                  {msg.content}
                </MessageBubble>
                <MessageMeta isUser={msg.role === 'user'} isDark={isDark}>
                  <span className="time">{formatTime(msg.timestamp)}</span>
                  {msg.thinking && (
                    <ThinkingBadge isDark={isDark} onClick={() => setShowThinking(msg.thinking!)}>
                      🧠 View thinking
                    </ThinkingBadge>
                  )}
                </MessageMeta>
              </Message>
            ))
          )}
          
          {isLoading && (
            <ThinkingIndicator isDark={isDark}>
              <div className="avatar">✨</div>
              <div className="content">
                <span className="label">Thinking...</span>
                <div className="dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </ThinkingIndicator>
          )}
          
          {error && (
            <ErrorMessage isDark={isDark}>
              {error}
            </ErrorMessage>
          )}
          
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputContainer isDark={isDark}>
          <InputWrapper isDark={isDark} isFocused={isFocused}>
            <Input
              ref={inputRef}
              isDark={isDark}
              placeholder="Ask Claude anything..."
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading}
              rows={1}
            />
            <SendButton 
              isDark={isDark} 
              hasContent={!!input.trim()}
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
            >
              ↑
            </SendButton>
          </InputWrapper>
        </InputContainer>
      </SidebarContainer>

      {/* Thinking Modal */}
      {showThinking && (
        <>
          <Overlay onClick={() => setShowThinking(null)} />
          <ThinkingModal isDark={isDark}>
            <ThinkingModalHeader isDark={isDark}>
              <h4>🧠 Claude's Reasoning</h4>
              <CloseButton isDark={isDark} onClick={() => setShowThinking(null)}>✕</CloseButton>
            </ThinkingModalHeader>
            <ThinkingModalContent isDark={isDark}>
              {showThinking}
            </ThinkingModalContent>
          </ThinkingModal>
        </>
      )}
    </>
  );
};

export default ChatSidebar;
