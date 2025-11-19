-- Sample data for testing CalendarAI

-- Insert a test user (password: 'password123' hashed with bcrypt)
INSERT INTO users (username, email, password_hash) VALUES
('testuser', 'test@calendarai.com', '$2b$10$rKZhvEqX8F3ZF9h.8vF7LeLzRvLsX5F5Z2ZF5Z2ZF5Z2ZF5Z2ZF5Z2');

-- Insert priorities for the test user
INSERT INTO priorities (user_id, name, `rank`, hours_per_week, color) VALUES
(1, 'Work', 1, 40, '#667eea'),
(1, 'Family', 2, 20, '#f093fb'),
(1, 'Health & Fitness', 3, 10, '#4facfe'),
(1, 'Learning', 4, 5, '#43e97b');

-- Insert sample events for the test user
INSERT INTO events (user_id, priority_id, title, description, start_time, end_time) VALUES
(1, 1, 'Team Meeting', 'Weekly sync with the team', '2024-10-14 10:00:00', '2024-10-14 11:00:00'),
(1, 1, 'Project Work', 'Focus time on main project', '2024-10-14 14:00:00', '2024-10-14 17:00:00'),
(1, 2, 'Dinner with Family', 'Family time', '2024-10-14 18:00:00', '2024-10-14 19:30:00'),
(1, 3, 'Morning Run', 'Cardio workout', '2024-10-15 07:00:00', '2024-10-15 08:00:00'),
(1, 4, 'Online Course', 'Learning React Advanced Patterns', '2024-10-15 20:00:00', '2024-10-15 21:30:00');

-- Insert user preferences
INSERT INTO preferences (user_id, work_start_time, work_end_time, default_ai_mode, theme) VALUES
(1, '09:00:00', '17:00:00', 'whatif', 'light');

-- Insert sample AI chat messages
INSERT INTO messages (user_id, session_id, sender_type, content) VALUES
(1, 'session-001', 'user', 'Can you help me schedule gym time this week?'),
(1, 'session-001', 'ai', 'I can help you with that! Based on your Health & Fitness priority, I recommend adding 1-hour gym sessions at 7am on Monday, Wednesday, and Friday. Would you like me to add these?'),
(1, 'session-001', 'user', 'Yes, please add them.');

