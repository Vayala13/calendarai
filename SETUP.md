# 🚀 CalendarAI Setup Guide

## Step 1: Create .env File

```bash
cd /Users/vivianaayala/Desktop/calendarai/backend
```

Create a file named `.env` with this content (replace `your_password` with your actual MySQL password):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=calendarai_db
DB_PORT=3306
PORT=5000
NODE_ENV=development
```

## Step 2: Set Up MySQL Database

Open a new terminal and run:

```bash
# Log into MySQL
mysql -u root -p

# Create the database
CREATE DATABASE calendarai_db;

# Exit MySQL
exit;
```

## Step 3: Create Tables

```bash
# Run the schema file
mysql -u root -p calendarai_db < /Users/vivianaayala/Desktop/calendarai/database/schema.sql

# (Optional) Add sample data
mysql -u root -p calendarai_db < /Users/vivianaayala/Desktop/calendarai/database/seed.sql
```

## Step 4: Start Backend Server

```bash
cd /Users/vivianaayala/Desktop/calendarai/backend
npm run dev
```

You should see:
```
🚀 CalendarAI Backend running on http://localhost:5000
✅ MySQL Database connected successfully
```

## Step 5: Test the Connection

Open your browser and visit:
- http://localhost:5000/api/health ← Should show "Server is running!"
- http://localhost:5000/api/test-db ← Should show "Database connected!"
- http://localhost:5000/api/events ← Should show sample events

## Step 6: Start Frontend (in another terminal)

```bash
cd /Users/vivianaayala/Desktop/calendarai
npm start
```

---

## Troubleshooting

### "Access denied for user 'root'"
Your MySQL password in `.env` is wrong. Update it.

### "Database 'calendarai_db' doesn't exist"
Run Step 2 again to create the database.

### "Cannot find module 'express'"
Run `npm install` in the backend folder.

### "Port 5000 already in use"
Change PORT in `.env` to 5001 or another number.

---

You're all set! 🎉

