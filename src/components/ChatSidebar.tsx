import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// ============ ANIMATIONS ============

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const typing = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
`;

// ============ STYLED COMPONENTS ============

const SidebarContainer = styled.div<{ isOpen: boolean; isDark: boolean }>`
  position: fixed;
  right: ${props => props.isOpen ? '0' : '-420px'};
  top: 0;
  height: 100vh;
  width: 400px;
  background: ${props => props.isDark 
    ? 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)' 
    : 'linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%)'};
  box-shadow: ${props => props.isOpen ? '-5px 0 30px rgba(0,0,0,0.3)' : 'none'};
  transition: right 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 500px) {
    width: 100%;
    right: ${props => props.isOpen ? '0' : '-100%'};
  }
`;

const Header = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' 
    : 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)'};
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
  }
  
  .badge {
    background: rgba(255,255,255,0.2);
    padding: 3px 8px;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 600;
  }
`;

const CloseButton = styled.button`
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255,255,255,0.3);
  }
`;

const MessagesContainer = styled.div<{ isDark: boolean }>`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Message = styled.div<{ isUser: boolean; isDark: boolean }>`
  max-width: 85%;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  animation: ${fadeIn} 0.3s ease;
`;

const MessageBubble = styled.div<{ isUser: boolean; isDark: boolean }>`
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    : (props.isDark ? 'rgba(255,255,255,0.1)' : 'white')};
  color: ${props => props.isUser ? 'white' : (props.isDark ? '#e5e7eb' : '#1f2937')};
  padding: 12px 16px;
  border-radius: ${props => props.isUser 
    ? '18px 18px 4px 18px' 
    : '18px 18px 18px 4px'};
  font-size: 0.95rem;
  line-height: 1.5;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  
  p {
    margin: 0 0 10px 0;
    &:last-child { margin: 0; }
  }
  
  ul, ol {
    margin: 10px 0;
    padding-left: 20px;
  }
  
  code {
    background: ${props => props.isUser ? 'rgba(255,255,255,0.2)' : (props.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)')};
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85rem;
  }
`;

const MessageTime = styled.div<{ isUser: boolean; isDark: boolean }>`
  font-size: 0.7rem;
  color: ${props => props.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'};
  margin-top: 4px;
  text-align: ${props => props.isUser ? 'right' : 'left'};
`;

const ThinkingIndicator = styled.div<{ isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px;
  color: ${props => props.isDark ? '#a78bfa' : '#7c3aed'};
  font-size: 0.9rem;
  
  .dots {
    display: flex;
    gap: 4px;
    
    span {
      width: 8px;
      height: 8px;
      background: currentColor;
      border-radius: 50%;
      animation: ${typing} 1.4s ease infinite;
      
      &:nth-child(2) { animation-delay: 0.2s; }
      &:nth-child(3) { animation-delay: 0.4s; }
    }
  }
`;

const ThinkingBlock = styled.details<{ isDark: boolean }>`
  background: ${props => props.isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)'};
  border: 1px solid ${props => props.isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'};
  border-radius: 8px;
  padding: 10px;
  margin-top: 10px;
  font-size: 0.8rem;
  
  summary {
    cursor: pointer;
    color: ${props => props.isDark ? '#a78bfa' : '#7c3aed'};
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  .content {
    margin-top: 10px;
    color: ${props => props.isDark ? '#9ca3af' : '#6b7280'};
    line-height: 1.5;
    white-space: pre-wrap;
    max-height: 200px;
    overflow-y: auto;
  }
`;

const InputContainer = styled.div<{ isDark: boolean }>`
  padding: 15px 20px;
  background: ${props => props.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)'};
  border-top: 1px solid ${props => props.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
`;

const InputWrapper = styled.div<{ isDark: boolean }>`
  display: flex;
  gap: 10px;
  background: ${props => props.isDark ? 'rgba(255,255,255,0.1)' : 'white'};
  border-radius: 25px;
  padding: 5px 5px 5px 15px;
  border: 2px solid ${props => props.isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'};
  transition: border-color 0.2s;
  
  &:focus-within {
    border-color: #8b5cf6;
  }
`;

const Input = styled.input<{ isDark: boolean }>`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: ${props => props.isDark ? '#e5e7eb' : '#1f2937'};
  outline: none;
  
  &::placeholder {
    color: ${props => props.isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'};
  }
`;

const SendButton = styled.button<{ isDark: boolean }>`
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const WelcomeMessage = styled.div<{ isDark: boolean }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.isDark ? '#a78bfa' : '#7c3aed'};
  
  .icon {
    font-size: 3rem;
    margin-bottom: 15px;
  }
  
  h4 {
    margin: 0 0 10px 0;
    font-size: 1.1rem;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.8;
  }
  
  .suggestions {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;

const SuggestionButton = styled.button<{ isDark: boolean }>`
  background: ${props => props.isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'};
  border: 1px solid ${props => props.isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'};
  color: ${props => props.isDark ? '#c4b5fd' : '#7c3aed'};
  padding: 10px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'};
    transform: translateY(-2px);
  }
`;

const ToggleButton = styled.button<{ isDark: boolean }>`
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
  transition: all 0.3s;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 30px rgba(139, 92, 246, 0.6);
  }
`;

const ErrorMessage = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'};
  color: ${props => props.isDark ? '#fca5a5' : '#991b1b'};
  padding: 12px 15px;
  border-radius: 10px;
  font-size: 0.85rem;
  margin: 10px 0;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    
    // Add user message
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

      // Add assistant message
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const suggestions = [
    "How can I better balance my priorities this week?",
    "When should I schedule time for my top priority?",
    "Am I on track with my weekly goals?",
    "Suggest a productive schedule for tomorrow"
  ];

  return (
    <>
      <ToggleButton isDark={isDark} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '💬'}
      </ToggleButton>

      <SidebarContainer isOpen={isOpen} isDark={isDark}>
        <Header isDark={isDark}>
          <HeaderTitle>
            <span>🤖</span>
            <div>
              <h3>AI Assistant</h3>
              <span className="badge">Claude Sonnet 4</span>
            </div>
          </HeaderTitle>
          <CloseButton onClick={() => setIsOpen(false)}>✕</CloseButton>
        </Header>

        <MessagesContainer isDark={isDark}>
          {messages.length === 0 ? (
            <WelcomeMessage isDark={isDark}>
              <div className="icon">🤖✨</div>
              <h4>Hi! I'm your AI scheduling assistant</h4>
              <p>I can help you manage your time, analyze your priorities, and suggest the best times to schedule activities.</p>
              <div className="suggestions">
                {suggestions.map((s, i) => (
                  <SuggestionButton 
                    key={i} 
                    isDark={isDark}
                    onClick={() => sendMessage(s)}
                  >
                    {s}
                  </SuggestionButton>
                ))}
              </div>
            </WelcomeMessage>
          ) : (
            messages.map((msg, index) => (
              <Message key={index} isUser={msg.role === 'user'} isDark={isDark}>
                <MessageBubble isUser={msg.role === 'user'} isDark={isDark}>
                  {msg.content}
                  {msg.thinking && (
                    <ThinkingBlock isDark={isDark}>
                      <summary>🧠 View Claude's thinking</summary>
                      <div className="content">{msg.thinking}</div>
                    </ThinkingBlock>
                  )}
                </MessageBubble>
                <MessageTime isUser={msg.role === 'user'} isDark={isDark}>
                  {formatTime(msg.timestamp)}
                </MessageTime>
              </Message>
            ))
          )}
          
          {isLoading && (
            <ThinkingIndicator isDark={isDark}>
              <span>🧠</span>
              Claude is thinking
              <div className="dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </ThinkingIndicator>
          )}
          
          {error && (
            <ErrorMessage isDark={isDark}>
              ⚠️ {error}
            </ErrorMessage>
          )}
          
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputContainer isDark={isDark}>
          <InputWrapper isDark={isDark}>
            <Input
              isDark={isDark}
              type="text"
              placeholder="Ask me anything about your schedule..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <SendButton 
              isDark={isDark} 
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
            >
              ➤
            </SendButton>
          </InputWrapper>
        </InputContainer>
      </SidebarContainer>
    </>
  );
};

export default ChatSidebar;

