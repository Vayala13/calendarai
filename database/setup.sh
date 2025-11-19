#!/bin/bash

# CalendarAI Database Setup Script
# This will prompt for your MySQL root password

echo "📊 CalendarAI Database Setup"
echo "=============================="
echo ""
echo "Step 1: Creating database..."
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS calendarai_db;"

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully"
    echo ""
    echo "Step 2: Loading schema..."
    mysql -u root -p calendarai_db < "$(dirname "$0")/schema.sql"
    
    if [ $? -eq 0 ]; then
        echo "✅ Schema loaded successfully"
        echo ""
        echo "Step 3: Loading sample data..."
        mysql -u root -p calendarai_db < "$(dirname "$0")/seed.sql"
        
        if [ $? -eq 0 ]; then
            echo "✅ Sample data loaded successfully"
            echo ""
            echo "🎉 Database setup complete!"
            echo ""
            echo "Verify it worked:"
            echo "  mysql -u root -p calendarai_db -e 'SHOW TABLES;'"
        else
            echo "⚠️  Warning: Could not load sample data (optional)"
        fi
    else
        echo "❌ Error loading schema"
    fi
else
    echo "❌ Error creating database"
fi

