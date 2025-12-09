# CalendarAI - Testing Guide for Project Part C

This document provides detailed testing instructions for the 6 required tasks (3 retrieval + 3 update operations).

## Prerequisites

1. Backend server running: `npm run dev:backend` (http://localhost:3001)
2. Database set up with schema and seed data
3. Postman, curl, or similar tool for API testing

---

## Setup: Get Authentication Token

Before testing, you need to authenticate and get a JWT token.

### Step 1: Register a Test User (if not exists)

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@calendarai.com",
    "password": "testpassword123"
  }'
```

**Expected Response**:
```json
{
  "message": "User registered successfully",
  "user_id": 1,
  "username": "testuser"
}
```

### Step 2: Login to Get Token

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@calendarai.com",
    "password": "testpassword123"
  }'
```

**Expected Response**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "username": "testuser",
    "email": "test@calendarai.com"
  }
}
```

**Save the token** - you'll need it for all subsequent requests.

---

## RETRIEVAL TASKS (3 Tasks)

### Retrieval Task 1: Get All Events for a User

**Purpose**: Test SELECT query with JOIN and user filtering

**API Endpoint**: `GET /api/events`
**Authentication**: Required (JWT token in Authorization header)

**Test Command**:
```bash
curl -X GET http://localhost:3001/api/events \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected SQL Query** (executed by backend):
```sql
SELECT e.*, p.name as priority_name, p.color as priority_color 
FROM events e 
LEFT JOIN priorities p ON e.priority_id = p.priority_id 
WHERE e.user_id = ? 
ORDER BY e.start_time
```

**Expected Response**:
```json
[
  {
    "event_id": 1,
    "user_id": 1,
    "priority_id": 1,
    "title": "Team Meeting",
    "description": "Weekly team sync",
    "start_time": "2025-12-10T14:00:00.000Z",
    "end_time": "2025-12-10T15:00:00.000Z",
    "color_override": null,
    "is_whatif": false,
    "created_at": "2025-12-09T10:00:00.000Z",
    "priority_name": "Work",
    "priority_color": "#3b82f6"
  },
  {
    "event_id": 2,
    "user_id": 1,
    "priority_id": 2,
    "title": "Family Dinner",
    "description": null,
    "start_time": "2025-12-11T18:00:00.000Z",
    "end_time": "2025-12-11T20:00:00.000Z",
    "priority_name": "Family",
    "priority_color": "#ec4899"
  }
]
```

**Verification Steps**:
1. ✅ Response is an array
2. ✅ All events belong to authenticated user (user_id matches token)
3. ✅ Events include priority information (JOIN successful)
4. ✅ Events are ordered by start_time (ascending)
5. ✅ Response status code is 200

**Source Code**: `packages/backend/src/routes/events.js` (lines 7-22)

---

### Retrieval Task 2: Get User Priorities with Rankings

**Purpose**: Test SELECT with ORDER BY and user filtering

**API Endpoint**: `GET /api/priorities`
**Authentication**: Required (JWT token)

**Test Command**:
```bash
curl -X GET http://localhost:3001/api/priorities \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected SQL Query**:
```sql
SELECT * FROM priorities 
WHERE user_id = ? 
ORDER BY `rank`
```

**Expected Response**:
```json
[
  {
    "priority_id": 1,
    "user_id": 1,
    "name": "Work",
    "rank": 1,
    "hours_per_week": 40.00,
    "color": "#3b82f6"
  },
  {
    "priority_id": 2,
    "user_id": 1,
    "name": "Family",
    "rank": 2,
    "hours_per_week": 20.00,
    "color": "#ec4899"
  },
  {
    "priority_id": 3,
    "user_id": 1,
    "name": "Health",
    "rank": 3,
    "hours_per_week": 10.00,
    "color": "#22c55e"
  }
]
```

**Verification Steps**:
1. ✅ Response is an array
2. ✅ All priorities belong to authenticated user
3. ✅ Priorities are ordered by rank (1, 2, 3...)
4. ✅ Each priority has required fields (name, rank, hours_per_week, color)
5. ✅ Response status code is 200

**Source Code**: `packages/backend/src/routes/priorities.js` (lines 7-18)

---

### Retrieval Task 3: Get Chat History for a Session

**Purpose**: Test SELECT with session filtering and timestamp ordering

**API Endpoint**: `GET /api/chat/history/:sessionId`
**Authentication**: Required (JWT token)

**Prerequisites**: 
- First, send a chat message to create a session:
```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is on my calendar today?",
    "sessionId": "test_session_001"
  }'
```

**Test Command**:
```bash
curl -X GET http://localhost:3001/api/chat/history/test_session_001 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected SQL Query**:
```sql
SELECT sender_type as role, content, timestamp 
FROM messages 
WHERE user_id = ? AND session_id = ?
ORDER BY timestamp ASC
```

**Expected Response**:
```json
[
  {
    "role": "user",
    "content": "What is on my calendar today?",
    "timestamp": "2025-12-09T10:00:00.000Z"
  },
  {
    "role": "assistant",
    "content": "You have 3 events scheduled for today...",
    "timestamp": "2025-12-09T10:00:05.000Z"
  }
]
```

**Verification Steps**:
1. ✅ Response is an array
2. ✅ Messages are filtered by session_id
3. ✅ Messages are filtered by user_id (from token)
4. ✅ Messages are ordered by timestamp (ascending - oldest first)
5. ✅ Role field is properly formatted (user/assistant)
6. ✅ Response status code is 200

**Source Code**: `packages/backend/src/routes/chat.js` (lines 331-350)

---

## UPDATE TASKS (3 Different Operations)

### Update Task 1: Insert a New Event (INSERT Operation)

**Purpose**: Test INSERT operation with foreign key relationships

**API Endpoint**: `POST /api/events`
**Authentication**: Required (JWT token)

**Test Command**:
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Meeting - INSERT Task",
    "description": "Testing event creation for Project Part C",
    "start_time": "2025-12-15T14:00:00",
    "end_time": "2025-12-15T15:00:00",
    "priority_id": 1,
    "color_override": "#3b82f6"
  }'
```

**Expected SQL Query**:
```sql
INSERT INTO events (user_id, priority_id, title, description, start_time, end_time, color_override, is_whatif) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
```

**Expected Response**:
```json
{
  "event_id": 123,
  "message": "Event created successfully"
}
```

**Database Verification**:
```sql
-- Run this query in MySQL to verify the insert
SELECT * FROM events WHERE event_id = 123;

-- Expected result:
-- event_id: 123
-- user_id: 1 (matches authenticated user)
-- title: "Test Meeting - INSERT Task"
-- start_time: 2025-12-15 14:00:00
-- end_time: 2025-12-15 15:00:00
-- priority_id: 1
```

**Verification Steps**:
1. ✅ Response contains new event_id
2. ✅ Response status code is 201 (Created)
3. ✅ Query database to confirm event exists
4. ✅ Verify user_id matches authenticated user (from token)
5. ✅ Verify all fields were inserted correctly
6. ✅ Verify foreign key constraint (priority_id exists in priorities table)

**Source Code**: `packages/backend/src/routes/events.js` (lines 41-57)

---

### Update Task 2: Update an Existing Priority (UPDATE Operation)

**Purpose**: Test UPDATE operation with WHERE clause filtering

**API Endpoint**: `PUT /api/priorities/:id`
**Authentication**: Required (JWT token)

**Prerequisites**: 
- First, get a priority_id from GET /api/priorities (e.g., priority_id = 1)

**Test Command**:
```bash
curl -X PUT http://localhost:3001/api/priorities/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Work - Updated for Testing",
    "rank": 1,
    "hours_per_week": 45.00,
    "color": "#2563eb"
  }'
```

**Expected SQL Query**:
```sql
UPDATE priorities 
SET name = ?, `rank` = ?, hours_per_week = ?, color = ? 
WHERE priority_id = ? AND user_id = ?
```

**Expected Response**:
```json
{
  "message": "Priority updated successfully"
}
```

**Database Verification**:
```sql
-- Run this query before and after the update
SELECT * FROM priorities WHERE priority_id = 1;

-- Before update:
-- name: "Work"
-- hours_per_week: 40.00
-- color: "#3b82f6"

-- After update:
-- name: "Work - Updated for Testing"
-- hours_per_week: 45.00
-- color: "#2563eb"
```

**Verification Steps**:
1. ✅ Response indicates success
2. ✅ Response status code is 200
3. ✅ Query database to confirm priority was updated
4. ✅ Verify only the specified priority was updated (not others)
5. ✅ Verify user_id constraint (can only update own priorities)
6. ✅ Verify all updated fields match the request

**Source Code**: `packages/backend/src/routes/priorities.js` (lines 39-50)

---

### Update Task 3: Delete an Event (DELETE Operation)

**Purpose**: Test DELETE operation with user verification

**API Endpoint**: `DELETE /api/events/:id`
**Authentication**: Required (JWT token)

**Prerequisites**: 
- First, create a test event using POST /api/events
- Note the event_id from the response (e.g., event_id = 123)

**Test Command**:
```bash
curl -X DELETE http://localhost:3001/api/events/123 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected SQL Query**:
```sql
DELETE FROM events 
WHERE event_id = ? AND user_id = ?
```

**Expected Response**:
```json
{
  "message": "Event deleted successfully"
}
```

**Database Verification**:
```sql
-- Run this query before and after deletion
SELECT * FROM events WHERE event_id = 123;

-- Before deletion:
-- Returns the event record

-- After deletion:
-- Returns empty result set (0 rows)
```

**Additional Verification**:
```sql
-- Verify event is truly deleted (not just hidden)
SELECT COUNT(*) FROM events WHERE event_id = 123;
-- Should return 0

-- Verify other events are not affected
SELECT COUNT(*) FROM events WHERE user_id = 1;
-- Should return count of remaining events
```

**Verification Steps**:
1. ✅ Response indicates success
2. ✅ Response status code is 200
3. ✅ Query database to confirm event was deleted
4. ✅ Verify event cannot be retrieved after deletion (GET /api/events/:id returns 404)
5. ✅ Verify user_id constraint (can only delete own events)
6. ✅ Verify other events are not affected

**Source Code**: `packages/backend/src/routes/events.js` (lines 76-83)

---

## Additional Testing Scenarios

### Test Error Handling

**Invalid Authentication**:
```bash
curl -X GET http://localhost:3001/api/events \
  -H "Authorization: Bearer invalid_token"
```
Expected: 403 Forbidden

**Missing Required Fields**:
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Incomplete Event"
  }'
```
Expected: 400 Bad Request (missing start_time, end_time)

**Foreign Key Constraint**:
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "start_time": "2025-12-15T14:00:00",
    "end_time": "2025-12-15T15:00:00",
    "priority_id": 99999
  }'
```
Expected: Database error (priority_id doesn't exist)

---

## Testing Checklist

### Retrieval Tasks
- [ ] Task 1: Get all events - Returns correct data with JOIN
- [ ] Task 2: Get priorities - Returns ordered by rank
- [ ] Task 3: Get chat history - Returns filtered by session

### Update Tasks
- [ ] Task 1: Insert event - Creates new record in database
- [ ] Task 2: Update priority - Modifies existing record
- [ ] Task 3: Delete event - Removes record from database

### Verification
- [ ] All queries execute successfully
- [ ] Data integrity maintained (foreign keys, constraints)
- [ ] User isolation enforced (users can only access their own data)
- [ ] Error handling works correctly

---

## Notes

- All timestamps are stored in UTC and converted to user's timezone in the application layer
- Foreign key constraints ensure referential integrity
- User_id is automatically extracted from JWT token, preventing unauthorized access
- All DELETE operations include user_id check to prevent deletion of other users' data

