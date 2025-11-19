# CalendarAI Backend

Node.js + Express + MySQL backend for CalendarAI.

## Quick Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Database
Create a `.env` file in the `backend/` folder (copy from `.env.example`):
```bash
cp .env.example .env
```

Edit `.env` and set your MySQL password:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=calendarai_db
DB_PORT=3306
PORT=5000
```

### 3. Create Database
```bash
# Log into MySQL
mysql -u root -p

# Create the database
CREATE DATABASE calendarai_db;
exit;
```

### 4. Run Schema
```bash
# From the project root
mysql -u root -p calendarai_db < database/schema.sql

# Optional: Add sample data
mysql -u root -p calendarai_db < database/seed.sql
```

### 5. Start Backend Server
```bash
cd backend
npm run dev
```

Server will run on: `http://localhost:5000`

## Test It Works

Open browser and visit:
- http://localhost:5000/api/health
- http://localhost:5000/api/test-db
- http://localhost:5000/api/events

## API Endpoints

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Priorities
- `GET /api/priorities` - Get all priorities
- `POST /api/priorities` - Create priority
- `PUT /api/priorities/:id` - Update priority
- `DELETE /api/priorities/:id` - Delete priority

### Messages (AI Chat)
- `GET /api/messages/:sessionId` - Get messages for a session
- `POST /api/messages` - Create new message

## Troubleshooting

**"Cannot connect to database"**
- Make sure MySQL is running: `brew services list` (Mac) or `sudo service mysql status` (Linux)
- Check your password in `.env`
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

**"Port 5000 already in use"**
- Change `PORT=5000` to another port in `.env`

