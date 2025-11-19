-- CalendarAI Database Schema

-- Drop existing tables if they exist (for clean slate)
DROP TABLE IF EXISTS scenario_events;
DROP TABLE IF EXISTS scenarios;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS priorities;
DROP TABLE IF EXISTS preferences;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
);

-- Priorities table (Work, Family, Health, etc.)
CREATE TABLE priorities (
    priority_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    `rank` INT CHECK (`rank` BETWEEN 1 AND 10),
    hours_per_week DECIMAL(5,2),
    color VARCHAR(7),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_rank (user_id, `rank`)
);

-- Events table
CREATE TABLE events (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    priority_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    color_override VARCHAR(7),
    is_whatif BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (priority_id) REFERENCES priorities(priority_id) ON DELETE SET NULL,
    CHECK (end_time > start_time),
    INDEX idx_user_time (user_id, start_time, end_time),
    INDEX idx_whatif (user_id, is_whatif)
);

-- AI Chat Messages table
CREATE TABLE messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    sender_type ENUM('user', 'ai') NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_session (user_id, session_id, timestamp)
);

-- What-If Scenarios table
CREATE TABLE scenarios (
    scenario_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_applied BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_scenarios (user_id, is_applied)
);

-- Scenario Events (many-to-many relationship)
CREATE TABLE scenario_events (
    scenario_event_id INT PRIMARY KEY AUTO_INCREMENT,
    scenario_id INT NOT NULL,
    event_id INT NOT NULL,
    modified_fields JSON,
    FOREIGN KEY (scenario_id) REFERENCES scenarios(scenario_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    UNIQUE KEY unique_scenario_event (scenario_id, event_id)
);

-- User Preferences table
CREATE TABLE preferences (
    preference_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    work_start_time TIME DEFAULT '09:00:00',
    work_end_time TIME DEFAULT '17:00:00',
    default_ai_mode ENUM('whatif', 'agent') DEFAULT 'whatif',
    theme VARCHAR(20) DEFAULT 'light',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

