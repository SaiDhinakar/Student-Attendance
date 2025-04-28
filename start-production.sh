#!/bin/bash

echo "Starting Student Attendance System in production mode..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found. Installing PM2 globally..."
    npm install pm2 -g
fi

# Check if the virtual environment exists
if [ ! -d "venv" ]; then
    echo "Python virtual environment not found. Please run setup-production.sh first."
    exit 1
fi

# Start the application with PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.js

echo "Application started successfully!"
echo "You can monitor the application with: pm2 monit"
echo "View logs with: pm2 logs"