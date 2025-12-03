-- Add Google Calendar integration columns to users table
-- Run this to update your existing database

ALTER TABLE users
ADD COLUMN google_access_token TEXT NULL,
ADD COLUMN google_refresh_token TEXT NULL,
ADD COLUMN google_token_expiry DATETIME NULL;

-- Add google_event_id to events table for tracking synced events
ALTER TABLE events
ADD COLUMN google_event_id VARCHAR(255) NULL,
ADD INDEX idx_google_event (google_event_id);

-- Verify the columns were added
DESCRIBE users;
DESCRIBE events;

