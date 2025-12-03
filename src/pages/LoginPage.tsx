import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme, themes } from '../context/ThemeContext';

const PageContainer = styled.div<{ isDark: boolean }>`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.isDark 
    ? themes.dark.bgPrimary 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  padding: 20px;
  transition: background 0.3s ease;
`;

const FormCard = styled.div<{ isDark: boolean }>`
  max-width: 400px;
  width: 100%;
  padding: 40px;
  background: ${props => props.isDark ? themes.dark.bgCard : 'rgba(255, 255, 255, 0.95)'};
  border-radius: 15px;
  box-shadow: ${props => props.isDark ? themes.dark.shadow : '0 10px 40px rgba(0,0,0,0.3)'};
  border: ${props => props.isDark ? '1px solid ' + themes.dark.borderColor : 'none'};
  transition: all 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1<{ isDark: boolean }>`
  text-align: center;
  color: ${props => props.isDark ? themes.dark.primary : '#667eea'};
  margin: 0;
  font-size: 1.8rem;
`;

const ThemeToggle = styled.button<{ isDark: boolean }>`
  background: ${props => props.isDark ? themes.dark.bgHover : '#667eea'};
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: rotate(20deg) scale(1.1);
    background: ${props => props.isDark ? '#4c1d95' : '#5a6fd6'};
  }
`;

const ErrorBox = styled.div<{ isDark: boolean }>`
  color: ${props => props.isDark ? '#fca5a5' : '#dc3545'};
  background: ${props => props.isDark ? '#7f1d1d' : '#f8d7da'};
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid ${props => props.isDark ? '#991b1b' : '#f5c6cb'};
  font-size: 0.9rem;
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
  padding: 12px 15px;
  font-size: 1rem;
  border: 2px solid ${props => props.isDark ? themes.dark.borderColor : '#e0e0e0'};
  border-radius: 8px;
  box-sizing: border-box;
  transition: all 0.2s;
  background: ${props => props.isDark ? themes.dark.bgSecondary : 'white'};
  color: ${props => props.isDark ? themes.dark.textPrimary : '#333'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.isDark ? themes.dark.primary : '#667eea'};
    box-shadow: 0 0 0 3px ${props => props.isDark ? 'rgba(129, 140, 248, 0.2)' : 'rgba(102, 126, 234, 0.2)'};
  }
  
  &::placeholder {
    color: ${props => props.isDark ? themes.dark.textMuted : '#999'};
  }
`;

const SubmitButton = styled.button<{ disabled: boolean; isDark: boolean }>`
  width: 100%;
  padding: 14px;
  background: ${props => props.disabled 
    ? (props.isDark ? '#4b5563' : '#999') 
    : (props.isDark ? themes.dark.primary : '#667eea')};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.isDark ? themes.dark.primaryHover : '#5a6fd6'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
`;

const FooterText = styled.p<{ isDark: boolean }>`
  margin-top: 25px;
  text-align: center;
  color: ${props => props.isDark ? themes.dark.textSecondary : '#666'};
  
  a {
    color: ${props => props.isDark ? themes.dark.primary : '#667eea'};
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const HomeLink = styled(Link)<{ isDark: boolean }>`
  display: block;
  text-align: center;
  margin-top: 15px;
  color: ${props => props.isDark ? themes.dark.textMuted : '#999'};
  text-decoration: none;
  font-size: 0.9rem;
  
  &:hover {
    color: ${props => props.isDark ? themes.dark.primary : '#667eea'};
  }
`;

const LoginPage: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer isDark={isDark}>
      <FormCard isDark={isDark}>
        <Header>
          <Title isDark={isDark}>📅 CalendarAI</Title>
          <ThemeToggle isDark={isDark} onClick={toggleTheme} title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
            {isDark ? '☀️' : '🌙'}
          </ThemeToggle>
        </Header>
        
        {error && <ErrorBox isDark={isDark}>{error}</ErrorBox>}

        <form onSubmit={handleLogin}>
          <FormGroup>
            <Label isDark={isDark}>Email</Label>
            <Input
              isDark={isDark}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </FormGroup>

          <FormGroup>
            <Label isDark={isDark}>Password</Label>
            <Input
              isDark={isDark}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </FormGroup>

          <SubmitButton type="submit" disabled={loading} isDark={isDark}>
            {loading ? '⏳ Logging in...' : '🔐 Login'}
          </SubmitButton>
        </form>

        <FooterText isDark={isDark}>
          Don't have an account? <Link to="/register">Register here</Link>
        </FooterText>

        <HomeLink to="/" isDark={isDark}>← Back to Home</HomeLink>
      </FormCard>
    </PageContainer>
  );
};

export default LoginPage;
